import * as ergogen from 'ergogen';
import {
  freezeOutlines,
  isOutlineAutomatic,
  prepareOutlines,
} from '../utils/studioOutline';
import type { Results } from '../types/results';
import type { StudioReply } from '../utils/studioQueue';

type Request = {
  inputConfig: string;
  requestId: string;
  revision: string;
  outline?: 'keep' | 'rebuild' | 'freeze';
};

// Yield between expensive stages so supersession can be observed inside the worker.
export async function runStudio(
  request: Request,
  options: Record<string, unknown>,
  current: () => boolean,
  publish: (reply: StudioReply) => void
) {
  const { requestId, revision } = request;
  const send = (reply: Omit<StudioReply, 'requestId' | 'revision'>) =>
    publish({ ...reply, requestId, revision });
  const checkpoint = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (current()) {
      return true;
    }
    send({ type: 'superseded' });
    return false;
  };
  try {
    const preparedLayout = await ergogen.solveLayout(
      request.inputConfig,
      options
    );
    if (!(await checkpoint())) {
      return;
    }
    send({ type: 'stage', stage: 'layout', results: preparedLayout.results });
    let source =
      request.outline === 'rebuild'
        ? prepareOutlines(request.inputConfig, preparedLayout.results.layout)
        : request.inputConfig;
    const outline = (await ergogen.process(source, {
      ...options,
      preparedLayout,
      analysis: true,
      outlineOnly: true,
    })) as Results;
    if (!(await checkpoint())) {
      return;
    }
    if (
      outline.designs &&
      (request.outline === 'freeze' ||
        (request.outline === 'rebuild' && !isOutlineAutomatic(source)))
    ) {
      source = freezeOutlines(source, outline.designs);
    }
    send({ type: 'stage', stage: 'outline', results: outline });
    const results = (await ergogen.process(source, {
      ...options,
      preparedLayout,
      analysis: true,
    })) as Results;
    if (!(await checkpoint())) {
      return;
    }
    send({ type: 'success', results, source });
  } catch (caught) {
    if (!current()) {
      send({ type: 'superseded' });
      return;
    }
    const error = caught as {
      message?: string;
      diagnostics?: StudioReply['diagnostics'];
    };
    send({
      type: 'error',
      error: error.message || String(caught),
      diagnostics: error.diagnostics,
    });
  }
}
