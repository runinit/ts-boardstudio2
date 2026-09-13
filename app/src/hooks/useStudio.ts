import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sourceValue } from '../utils/sourceSnapshot';
import { resolveLayout } from 'ergogen/src/native/draft';
import type { LayoutReport } from 'ergogen/src/native';
import { useFootprintLibrary } from './useFootprintLibrary';
import { libraryAssets } from '../utils/footprintLibrary';
import { createErgogenWorker } from '../workers/workerFactory';
import {
  StudioQueue,
  type StudioReply,
  type StudioRequest,
} from '../utils/studioQueue';
import {
  freezeOutlines,
  hasManagedOutline,
  isOutlineAutomatic,
  setOutlineAutomatic,
} from '../utils/studioOutline';
import type { Results } from '../types/results';
import type { GeometryJob } from './useCasePreview';

type Session = {
  source: string;
  project?: string | null;
  injections?: string[][];
  assets: Record<string, string>;
  revision: number;
  action: 'edit' | 'restore' | 'amend';
  amend: (revision: number, before: string, after: string) => boolean;
  edit: (source: string) => void;
};

// Studio alone publishes background geometry; source remains owned by project history.
export function useStudio(session: Session) {
  const { source, injections, assets, revision, action } = session;
  const { entries } = useFootprintLibrary();
  const mergedAssets = useMemo(
    () => ({ ...libraryAssets(injections, entries), ...assets }),
    [injections, entries, assets]
  );
  const library = JSON.stringify(
    entries.map((entry) => [entry.id, entry.revision])
  );
  const key = JSON.stringify([
    source,
    injections,
    mergedAssets,
    library,
    revision,
    session.project,
  ]);
  const latest = useRef({ session, key });
  latest.current = { session, key };
  const [reply, setReply] = useState<StudioReply | null>(null);
  const [result, setResult] = useState<Results | null>(null);
  const visible = useRef(result);
  visible.current = result;
  const [layoutRevision, setLayoutRevision] = useState('');
  const [completed, setCompleted] = useState('');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestMode = useRef<StudioRequest['outline']>();
  const owned = useRef<StudioQueue | null>(null);
  const adopted = useRef<string | null>(null);
  const initial = useRef(key);
  const offsets = result?.layout?.offsets;
  const draftOffsets =
    action === 'restore' && layoutRevision !== key ? undefined : offsets;
  const draft = useMemo(() => {
    try {
      return {
        report: resolveLayout(
          sourceValue(source) as Parameters<typeof resolveLayout>[0],
          draftOffsets
        ) as LayoutReport,
        error: '',
      };
    } catch (error) {
      return { report: undefined, error: String(error) };
    }
  }, [source, draftOffsets]);
  useEffect(() => {
    const queue = new StudioQueue(createErgogenWorker, (message) => {
      const current = latest.current;
      if (message.revision !== current.key) {
        return;
      }
      setReply(message);
      if (message.results?.layout) {
        setLayoutRevision(current.key);
      }
      if (message.results && message.stage !== 'outline') {
        setResult((previous) => ({ ...previous, ...message.results }));
      }
      if (message.type === 'stage') {
        return;
      }
      setPending(false);
      if (message.type !== 'success') {
        return;
      }
      setCompleted(current.key);
      if (message.source && message.source !== current.session.source) {
        adopted.current = message.source;
        if (
          !current.session.amend(
            current.session.revision,
            current.session.source,
            message.source
          )
        ) {
          adopted.current = null;
        }
      }
    });
    owned.current = queue;
    return () => {
      queue.dispose();
      owned.current = null;
    };
  }, []);
  useEffect(() => {
    if (adopted.current === source && action === 'amend') {
      adopted.current = null;
      setCompleted(key);
      return;
    }
    const [capturedSource, capturedInjections, capturedAssets] =
      JSON.parse(key);
    const outline =
      requestMode.current ||
      (initial.current !== key &&
      action === 'edit' &&
      isOutlineAutomatic(capturedSource)
        ? 'rebuild'
        : 'keep');
    requestMode.current = undefined;
    setPending(true);
    setReply(null);
    owned.current?.schedule({
      revision: key,
      source: capturedSource,
      injections: capturedInjections,
      assets: capturedAssets,
      outline,
    });
  }, [key, source, action, attempt]);
  const generate = useCallback(() => {
    requestMode.current = 'rebuild';
    setAttempt((value) => value + 1);
  }, []);
  const toggle = useCallback(() => {
    const current = latest.current.session;
    if (!isOutlineAutomatic(current.source)) {
      current.edit(setOutlineAutomatic(current.source, true));
      return;
    }
    if (visible.current?.designs) {
      current.edit(freezeOutlines(current.source, visible.current.designs));
      return;
    }
    requestMode.current = 'freeze';
    setAttempt((value) => value + 1);
  }, []);
  const analysis: GeometryJob = {
    result,
    pending,
    stale: completed !== key,
    error:
      reply?.type === 'error' ? reply.error || 'Outline failed.' : draft.error,
    diagnostics: reply?.diagnostics || [],
    generate,
    cancel: () => {
      owned.current?.dispose();
      setPending(false);
    },
  };
  return {
    analysis,
    report: draft.report || result?.layout,
    automatic: isOutlineAutomatic(source),
    managed: hasManagedOutline(source),
    toggle,
    rebuild: generate,
  };
}
