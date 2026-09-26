import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRendererCanvas, type RendererCanvas } from '../renderClient';
import type { ComponentPreview } from './componentPreview';
import { componentPoseSvgTransform, componentSideSvgTransform } from './componentPreview';

type Mesh = { positions: Float32Array; normals: Float32Array; revision: number };
export { componentPoseSvgTransform, componentSideSvgTransform };
export type { ComponentPreview };

const emptyPreviews: ComponentPreview[] = [];
const samePreviews = (left: ComponentPreview[], right: ComponentPreview[]) => left.length === right.length && left.every((item, index) => {
  const other = right[index];
  return item.id === other.id
    && item.reference === other.reference
    && item.pose.at.x === other.pose.at.x
    && item.pose.at.y === other.pose.at.y
    && item.pose.rotation === other.pose.rotation
    && item.side === other.side
    && item.model.offset.x === other.model.offset.x
    && item.model.offset.y === other.model.offset.y
    && item.model.offset.z === other.model.offset.z
    && item.model.rotation.x === other.model.rotation.x
    && item.model.rotation.y === other.model.rotation.y
    && item.model.rotation.z === other.model.rotation.z
    && item.model.scale.x === other.model.scale.x
    && item.model.scale.y === other.model.scale.y
    && item.model.scale.z === other.model.scale.z
    && item.mesh.positions === other.mesh.positions
    && item.mesh.normals === other.mesh.normals
    && item.mesh.colors === other.mesh.colors;
});

const CasePreview = ({ mesh, componentPreviews, boardThickness = 0, colorScheme = 'light', controlsTarget }: {
  mesh?: Mesh;
  componentPreviews?: ComponentPreview[];
  boardThickness?: number;
  colorScheme?: 'light' | 'dark';
  controlsTarget?: HTMLElement | null;
}) => {
  const incomingPreviews = componentPreviews ?? emptyPreviews;
  const previewsRef = useRef(incomingPreviews);
  if (!samePreviews(previewsRef.current, incomingPreviews)) previewsRef.current = incomingPreviews;
  const previews = previewsRef.current;
  const renderableComponentCount = previews.filter((component) => component.mesh.positions.length >= 9 && component.mesh.positions.length % 3 === 0).length;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererCanvas>();
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    const caseMesh = mesh && mesh.positions.length >= 9 && mesh.positions.length % 3 === 0 ? mesh : undefined;
    const components = previews.filter((component) => component.mesh.positions.length >= 9 && component.mesh.positions.length % 3 === 0);
    setReady(false);
    setError('');
    if (!canvas || (!caseMesh && components.length === 0)) return;
    let disposed = false;
    let renderer: RendererCanvas | undefined;

    createRendererCanvas(canvas).then(async (instance) => {
      if (disposed) { instance.dispose(); return; }
      renderer = instance;
      rendererRef.current = instance;
      await instance.setScene({
        revision: caseMesh?.revision ?? components.length,
        kind: 'case',
        theme: colorScheme,
        boardThickness,
        caseMesh: caseMesh && { positions: caseMesh.positions, normals: caseMesh.normals },
        componentPreviews: components,
      });
      setReady(true);
    }).catch(() => {
      if (!disposed) setError('The 3D preview could not initialize.');
    });

    return () => {
      disposed = true;
      renderer?.dispose();
      if (rendererRef.current === renderer) rendererRef.current = undefined;
    };
  }, [mesh?.positions, mesh?.normals, mesh?.revision, previews, boardThickness, colorScheme]);

  const zoom = (factor: number) => {
    rendererRef.current?.zoom(factor);
    setZoomPercent((value) => Math.max(5, Math.round(value / factor)));
  };
  const fit = () => { rendererRef.current?.fit(); setZoomPercent(100); };

  if ((!mesh || mesh.positions.length < 9) && renderableComponentCount === 0) return <div className="wb-case-preview-empty">
    <span className="wb-case-preview-wire"><CaseWire /></span>
    <strong>{error || 'Waiting for a case assembly'}</strong>
    <small>The 3D preview appears when the settled geometry is ready.</small>
  </div>;

  const viewControls = <div className={controlsTarget ? 'wb-footer-zoom' : 'wb-case-preview-controls'} role="group" aria-label="3D view controls">
    <button aria-label="Fit preview" title="Fit preview" disabled={!ready} onClick={fit}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4M3 3l4 4m10-4-4 4M3 17l4-4m10 4-4-4" /></svg></button>
    <button aria-label="Zoom out" title="Zoom out" disabled={!ready} onClick={() => zoom(1.2)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10" /></svg></button>
    <output aria-label="Preview zoom" title="Zoom relative to the fitted preview">{zoomPercent}%</output>
    <button aria-label="Zoom in" title="Zoom in" disabled={!ready} onClick={() => zoom(1 / 1.2)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10M10 5v10" /></svg></button>
  </div>;

  return <div className="wb-case-preview" aria-label={`Case and component mesh preview, ${renderableComponentCount} components`}>
    <canvas ref={canvasRef} aria-label="Interactive 3D case preview. Drag to orbit and scroll to zoom." />
    <div className="wb-case-preview-label"><span>Case + components</span><span>{renderableComponentCount} {renderableComponentCount === 1 ? 'component' : 'components'}</span>{mesh && <span className="wb-case-preview-revision">r{mesh.revision}</span>}</div>
    <div className="wb-case-preview-disclaimer">Visual preview · not clearance proof</div>
    {controlsTarget ? createPortal(viewControls, controlsTarget) : viewControls}
    {error && <div className="wb-case-preview-error" role="status">{error}</div>}
  </div>;
};

const CaseWire = () => <svg viewBox="0 0 80 60" aria-hidden="true">
  <path d="m10 20 30-12 30 12-30 12zM10 20v25l30 12V32M70 20v25L40 57" />
  <path d="m20 24 20 8 20-8M20 30v9l20 8 20-8v-9M28 38v8m24-8v8" />
</svg>;

export { CasePreview };
