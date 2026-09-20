import { FootprintCopper } from './FootprintCopper';
import { FootprintPadPlan } from './FootprintPadPlan';
import { padShapeGeometry, padHasCopper } from '../utils/footprintPadGeometry';
import { FootprintModelMesh } from './FootprintModelMesh';
import { graphicPoints, footprintView } from '../utils/footprintGeometry';
/* eslint-disable react/no-unknown-property -- React Three Fiber scene properties. */
import { Component, ReactNode, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { previewBounds } from '../utils/previewBounds';
import { Bounds, OrbitControls, Line, useBounds } from '@react-three/drei';
import { DoubleSide, NotEqualStencilFunc, KeepStencilOp } from 'three';
import styled from 'styled-components';
import type { FootprintInfo, ModelBinding, Vec3 } from '../types/footprint';
import { CaseAssets } from '../utils/caseAssets';
import { theme } from '../theme/theme';

const Surface = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: ${theme.caseWizard.previewHeight};
  background: ${theme.colors.background};
  svg[role='img'] {
    width: 100%;
    height: 100%;
    min-height: ${theme.caseWizard.planHeight};
  }
`;
const PreviewNotice = styled.details`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  margin: 0;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: ${theme.workbench.textSize};
  summary {
    cursor: pointer;
  }
  p {
    margin: ${theme.spacing.sm} 0 0;
  }
`;
class Boundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <p role="alert">Preview unavailable: {this.state.error}</p>
    ) : (
      this.props.children
    );
  }
}
type Props = {
  info?: FootprintInfo;
  models: ModelBinding[];
  assets: CaseAssets;
  selected: number;
  onSelect: (index: number) => void;
  onChange?: (model: ModelBinding) => void;
  mode?: 'translate' | 'rotate' | 'scale';
  view?: '2d' | '3d';
  pad?: string;
  onPad?: (number: string) => void;
  side?: 'F' | 'B';
};
function Fit({ revision }: { revision: unknown }) {
  const bounds = useBounds();
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    bounds.refresh(previewBounds(scene)).clip().fit();
  }, [bounds, revision, scene]);
  return null;
}
export default function FootprintCanvas({
  info: sourceInfo,
  models,
  assets,
  selected,
  onSelect,
  onChange,
  mode = 'translate',
  view = '3d',
  pad,
  onPad,
  side = 'F',
}: Props) {
  const info = useMemo(
    () => footprintView(sourceInfo, side),
    [sourceInfo, side]
  );
  const pads = useMemo(() => info?.pads.map(padShapeGeometry) || [], [info]);
  useEffect(() => () => pads.forEach((pad) => pad.dispose()), [pads]);
  const assetRevision = models.map((model) => model.asset).join(',');
  const revision = useMemo(() => [info, assetRevision], [info, assetRevision]);
  return (
    <Surface aria-label="Footprint preview">
      {info?.diagnostics.some(
        (diagnostic) =>
          diagnostic.code.includes('preview') ||
          diagnostic.code.startsWith('unsupported-')
      ) && (
        <PreviewNotice>
          <summary>Preview limitations</summary>
          <p role="status">
            {Array.from(
              new Set(
                info.diagnostics
                  .filter(
                    (diagnostic) =>
                      diagnostic.code.includes('preview') ||
                      diagnostic.code.startsWith('unsupported-')
                  )
                  .map((diagnostic) => diagnostic.message)
              )
            ).join(' ')}
          </p>
        </PreviewNotice>
      )}
      <Boundary>
        {view === '2d' ? (
          <FootprintPadPlan info={info} pad={pad} onPad={onPad} />
        ) : (
          <Canvas
            frameloop="demand"
            gl={{ stencil: true }}
            camera={{ position: [25, -35, 30], up: [0, 0, 1] }}
          >
            <ambientLight intensity={1.4} />
            <directionalLight position={[20, -20, 50]} intensity={2} />
            <Bounds margin={1.5} maxDuration={0}>
              <Fit revision={revision} />
              <group>
                <FootprintCopper info={info} />
                {info?.pads.map((p, index) =>
                  padHasCopper(p, side) ? (
                    <mesh
                      key={p.index}
                      geometry={pads[index]}
                      userData={{ footprint: true }}
                      position={[p.at[0], -p.at[1], 0]}
                      rotation={[0, 0, ((p.at[2] || 0) * Math.PI) / 180]}
                      onClick={(event) => {
                        event.stopPropagation();
                        onPad?.(p.number);
                      }}
                    >
                      <meshStandardMaterial
                        side={DoubleSide}
                        stencilWrite
                        stencilRef={1}
                        stencilFunc={NotEqualStencilFunc}
                        stencilZPass={KeepStencilOp}
                        color={
                          p.number === pad
                            ? theme.colors.accent
                            : theme.colors.warningDark
                        }
                      />
                    </mesh>
                  ) : null
                )}
                {info?.graphics.map((g, index) => {
                  const points = graphicPoints(g);
                  return points.length > 1 ? (
                    <Line
                      key={index}
                      userData={{ footprint: true }}
                      points={points.map(
                        (point) => [point[0], -point[1], 0] as Vec3
                      )}
                      color={theme.colors.textDarker}
                    />
                  ) : null;
                })}
                <group rotation={side === 'B' ? [Math.PI, 0, 0] : [0, 0, 0]}>
                  {models.map((model, index) => (
                    <FootprintModelMesh
                      key={`${index}:${model.asset || model.path}`}
                      model={model}
                      assets={assets}
                      active={index === selected}
                      onSelect={() => onSelect(index)}
                      onChange={onChange}
                      mode={mode}
                    />
                  ))}
                  <axesHelper args={[5]} />
                </group>
              </group>
            </Bounds>
            <OrbitControls makeDefault />
          </Canvas>
        )}
      </Boundary>
    </Surface>
  );
}
