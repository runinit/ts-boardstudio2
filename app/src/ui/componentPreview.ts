export function componentSideSvgTransform(side: 'front' | 'back'): string {
  return side === 'back' ? 'scale(-1 1)' : '';
}

export function componentPoseSvgTransform(at: { x: number; y: number }, rotation: number, side: 'front' | 'back'): string {
  const pose = `translate(${at.x} ${at.y}) rotate(${rotation})`;
  const sideTransform = componentSideSvgTransform(side);
  return sideTransform ? `${pose} ${sideTransform}` : pose;
}
