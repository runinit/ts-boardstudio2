/* eslint-disable react/no-unknown-property -- React Three Fiber scene properties. */
import { useEffect, useMemo } from 'react';
import { Line } from '@react-three/drei';
import {
  DoubleSide,
  AlwaysStencilFunc,
  ReplaceStencilOp,
  NotEqualStencilFunc,
  KeepStencilOp,
} from 'three';
import type { FootprintInfo, Vec3 } from '../types/footprint';
import { theme } from '../theme/theme';
import {
  drillOutline,
  padShapeGeometry,
  strokeOutline,
} from '../utils/footprintPadGeometry';
import { trackPoints } from './FootprintPadPlan';

export function FootprintCopper({ info }: { readonly info?: FootprintInfo }) {
  const side = info?.side || 'F';
  const holes = useMemo(() => {
    const base = {
      index: 0,
      number: '',
      type: 'smd',
      shape: 'custom',
      size: [0, 0],
      at: [0, 0],
      layers: ['*.Cu'],
      mechanical: false,
    };
    const pads =
      info?.pads.map((pad) => {
        const geometry = padShapeGeometry({
          ...base,
          polygons: [drillOutline(pad)],
        });
        geometry.rotateZ(((pad.at[2] || 0) * Math.PI) / 180);
        geometry.translate(pad.at[0], -pad.at[1], 0);
        return geometry;
      }) || [];
    const vias =
      info?.vias
        ?.filter((via) =>
          via.layers.some((layer) =>
            [side + '.Cu', '*.Cu', 'F&B.Cu'].includes(layer)
          )
        )
        .map((via) => {
          const geometry = padShapeGeometry({
            ...base,
            shape: 'circle',
            size: [via.drill, via.drill],
          });
          geometry.translate(via.at[0], -via.at[1], 0);
          return geometry;
        }) || [];
    return [...pads, ...vias];
  }, [info, side]);
  useEffect(
    () => () => holes.forEach((geometry) => geometry.dispose()),
    [holes]
  );
  const geometries = useMemo(() => {
    const base = {
      index: 0,
      number: '',
      type: 'smd',
      shape: 'custom',
      size: [0, 0],
      at: [0, 0],
      layers: ['*.Cu'],
      mechanical: false,
    };
    const tracks =
      info?.tracks
        ?.filter((track) => track.layer === side + '.Cu')
        .map((track) => {
          const points = trackPoints(track);
          return padShapeGeometry({
            ...base,
            polygons: points
              .slice(1)
              .map((end, index) =>
                strokeOutline(points[index], end, track.width)
              ),
          });
        }) || [];
    const vias =
      info?.vias
        ?.filter((via) =>
          via.layers.some((layer) =>
            [side + '.Cu', '*.Cu', 'F&B.Cu'].includes(layer)
          )
        )
        .map((via) => {
          const geometry = padShapeGeometry({
            ...base,
            shape: 'circle',
            size: [via.size, via.size],
            drillSize: [via.drill, via.drill],
          });
          geometry.translate(via.at[0], -via.at[1], 0);
          return geometry;
        }) || [];
    return [...tracks, ...vias];
  }, [info, side]);
  useEffect(
    () => () => geometries.forEach((geometry) => geometry.dispose()),
    [geometries]
  );
  return (
    <>
      {info?.zones
        ?.filter((zone) =>
          zone.layers.some((layer) =>
            [side + '.Cu', '*.Cu', 'F&B.Cu'].includes(layer)
          )
        )
        .flatMap((zone, index) =>
          zone.polygons.map((polygon, ring) => {
            const points: Vec3[] = [...polygon, polygon[0]].map(([x, y]) => [
              x,
              -y,
              0,
            ]);
            return (
              <Line
                key={index + ':' + ring}
                points={points}
                color={
                  zone.kind === 'keepout'
                    ? theme.colors.error
                    : theme.colors.warningDark
                }
                dashed={zone.kind === 'keepout'}
                dashSize={0.6}
                gapSize={0.4}
                userData={{ footprint: true }}
              />
            );
          })
        )}
      {holes.map((geometry, index) => (
        <mesh key={'hole' + index} geometry={geometry} renderOrder={-100}>
          <meshBasicMaterial
            side={DoubleSide}
            colorWrite={false}
            depthWrite={false}
            depthTest={false}
            stencilWrite
            stencilRef={1}
            stencilFunc={AlwaysStencilFunc}
            stencilZPass={ReplaceStencilOp}
          />
        </mesh>
      ))}
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} userData={{ footprint: true }}>
          <meshStandardMaterial
            side={DoubleSide}
            stencilWrite
            stencilRef={1}
            stencilFunc={NotEqualStencilFunc}
            stencilZPass={KeepStencilOp}
            color={theme.colors.warningDark}
          />
        </mesh>
      ))}
      {info?.pads.map((pad) => {
        const points = drillOutline(pad);
        if (!points.length) return null;
        const angle = ((pad.at[2] || 0) * Math.PI) / 180;
        const line: Vec3[] = [...points, points[0]].map(([x, y]) => [
          pad.at[0] + x * Math.cos(angle) + y * Math.sin(angle),
          -pad.at[1] + x * Math.sin(angle) - y * Math.cos(angle),
          0,
        ]);
        return (
          <Line
            key={pad.index}
            points={line}
            color={theme.colors.textDarker}
            userData={{ footprint: true }}
          />
        );
      })}
    </>
  );
}
