export type ComponentPreview = {
  id: string;
  reference: string;
  pose: { at: { x: number; y: number }; rotation: number };
  side: 'front' | 'back';
  model: { offset: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number }; scale: { x: number; y: number; z: number } };
  mesh: { positions: Float32Array; normals: Float32Array; colors?: Float32Array };
};

export function componentSideSvgTransform(side: 'front' | 'back'): string {
  return side === 'back' ? 'scale(-1 1)' : '';
}

export function componentPoseSvgTransform(at: { x: number; y: number }, rotation: number, side: 'front' | 'back'): string {
  const pose = `translate(${at.x} ${at.y}) rotate(${rotation})`;
  const sideTransform = componentSideSvgTransform(side);
  return sideTransform ? `${pose} ${sideTransform}` : pose;
}
