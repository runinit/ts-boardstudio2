# N: editor patterns
tldraw 05ba06d341d4fc7212812c30cb80309c011d428a has explicit interaction states, viewport-filtered snapping and content-keyed geometry caches; no demonstrated incremental spatial index. Excalidraw 97c68dd371e13c017a8dcca49f8b3995ba7890a8 has transient render overrides and capture policies. Worker pool is uncapped, not a supersession model to copy. No local speed evidence.
Sources: GitHub tldraw packages/editor/src/lib/{hooks/useCanvasEvents.ts,editor/Editor.ts,editor/managers/SnapManager/SnapManager.ts}; Excalidraw packages/excalidraw/{types.ts,workers.ts,history.ts}.
EXPAND: trace render-override implementation and actual pointer callers; dispatched N wave2.
