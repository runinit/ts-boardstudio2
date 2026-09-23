import { memo, useMemo } from 'react';
import type { PartDefinition } from '../../../contracts/src/index';
import { compileFootprint, previewFootprint } from '@boardstudio/v2-kicad';
import './library-workspace.css';

export const LibraryWorkspace = memo(({ definition }: { definition?: PartDefinition }) => {
  const svg = useMemo(() => definition ? previewFootprint(compileFootprint(definition)) : '', [definition]);

  if (!definition) {
    return <div className="wb-library-workspace-empty">Select a footprint from the library.</div>;
  }

  return <div className="wb-library-workspace" aria-label="Footprint workspace">
    <div className="wb-library-workspace-title"><h2>{definition.name}</h2><span>2D footprint · top view</span></div>
    <div className="wb-library-workspace-geometry" dangerouslySetInnerHTML={{ __html: svg }} />
    <div className="wb-library-workspace-scale">Millimetres</div>
  </div>;
});
