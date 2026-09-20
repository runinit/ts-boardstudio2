import { useId } from 'react';
import type { FootprintInfo } from '../types/footprint';
import { theme } from '../theme/theme';
import { graphicPoints } from '../utils/footprintGeometry';
import {
  drillOutline,
  outlinePath,
  padContours,
  padHasCopper,
} from '../utils/footprintPadGeometry';

type Props = {
  readonly info?: FootprintInfo;
  readonly pad?: string;
  readonly onPad?: (number: string) => void;
};
const transform = (pad: FootprintInfo['pads'][number]) =>
  `translate(${pad.at[0]} ${pad.at[1]}) rotate(${-Number(pad.at[2] || 0)})`;
export function trackPoints(
  track: NonNullable<FootprintInfo['tracks']>[number]
) {
  return graphicPoints({
    ...track,
    type: track.type === 'segment' ? 'line' : 'arc',
    center: [],
    points: [],
  });
}
export function FootprintPadPlan({ info, pad, onPad }: Props) {
  const maskId = useId();
  const side = info?.side || 'F';
  const pads = info?.pads || [];
  const tracks =
    info?.tracks?.filter((track) => track.layer === `${side}.Cu`) || [];
  const vias =
    info?.vias?.filter((via) =>
      via.layers.some((layer) =>
        [side + '.Cu', '*.Cu', 'F&B.Cu'].includes(layer)
      )
    ) || [];
  const zones =
    info?.zones?.filter((zone) =>
      zone.layers.some((layer) =>
        [side + '.Cu', '*.Cu', 'F&B.Cu'].includes(layer)
      )
    ) || [];
  const candidates = pads.flatMap((p) =>
    [...padContours(p).flat(), ...drillOutline(p)].map(([x, y]) => {
      const angle = (-(p.at[2] || 0) * Math.PI) / 180;
      return [
        p.at[0] + x * Math.cos(angle) - y * Math.sin(angle),
        p.at[1] + x * Math.sin(angle) + y * Math.cos(angle),
      ];
    })
  );
  candidates.push(
    ...(info?.graphics.flatMap(graphicPoints) || []),
    ...tracks.flatMap(trackPoints),
    ...vias.map((via) => via.at),
    ...zones.flatMap((zone) => zone.polygons.flat())
  );
  const points = candidates.length
    ? candidates
    : [
        [-10, -10],
        [10, 10],
      ];
  const low = [0, 1].map(
    (axis) => Math.min(...points.map((point) => point[axis])) - 3
  );
  const high = [0, 1].map(
    (axis) => Math.max(...points.map((point) => point[axis])) + 3
  );
  return (
    <svg
      role="img"
      aria-label={`Footprint pads and geometry, ${side === 'F' ? 'front' : 'back'} copper`}
      viewBox={`${low[0]} ${low[1]} ${high[0] - low[0]} ${high[1] - low[1]}`}
    >
      {zones.flatMap((zone, index) =>
        zone.polygons.map((polygon, ring) => (
          <path
            key={index + ':' + ring}
            d={outlinePath(polygon)}
            fill="none"
            stroke={
              zone.kind === 'keepout'
                ? theme.colors.error
                : theme.colors.warningDark
            }
            strokeWidth={0.15}
            strokeDasharray={zone.kind === 'keepout' ? '0.6 0.4' : undefined}
            data-layer={zone.layers.join(' ')}
          >
            <title>
              {zone.kind === 'keepout'
                ? 'Keepout outline'
                : 'Copper zone outline'}
            </title>
          </path>
        ))
      )}
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={low[0]}
          y={low[1]}
          width={high[0] - low[0]}
          height={high[1] - low[1]}
        >
          <rect
            x={low[0]}
            y={low[1]}
            width={high[0] - low[0]}
            height={high[1] - low[1]}
            fill="white"
          />
          {pads.map((p) => (
            <path
              key={p.index}
              d={outlinePath(drillOutline(p))}
              transform={transform(p)}
              fill="black"
            />
          ))}
          {vias.map((via, index) => (
            <circle
              key={index}
              cx={via.at[0]}
              cy={via.at[1]}
              r={via.drill / 2}
              fill="black"
            />
          ))}
        </mask>
      </defs>
      {info?.graphics.map((g, index) => (
        <polyline
          key={index}
          points={graphicPoints(g)
            .map((p) => p.join(','))
            .join(' ')}
          fill="none"
          stroke={theme.colors.textDarker}
          strokeWidth={0.15}
        />
      ))}
      <g mask={`url(#${maskId})`}>
        {tracks.map((track, index) => (
          <polyline
            key={index}
            data-layer={track.layer}
            points={trackPoints(track)
              .map((point) => point.join(','))
              .join(' ')}
            fill="none"
            stroke={theme.colors.warningDark}
            strokeWidth={track.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {vias.map((via, index) => (
          <circle
            key={index}
            cx={via.at[0]}
            cy={via.at[1]}
            r={via.size / 2}
            fill={theme.colors.warningDark}
          >
            <title>Via</title>
          </circle>
        ))}
        {pads
          .filter((p) => padHasCopper(p, side))
          .map((p) => (
            <g
              key={p.index}
              transform={transform(p)}
              onClick={() => onPad?.(p.number)}
              data-layer={side + '.Cu'}
            >
              <title>
                {p.mechanical ? 'Mechanical pad' : `Pad ${p.number}`}
              </title>
              {padContours(p).map((contour, index) => (
                <path
                  key={index}
                  d={outlinePath(contour)}
                  fill={
                    p.number === pad
                      ? theme.colors.accent
                      : theme.colors.warningDark
                  }
                />
              ))}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(...p.size) * 0.55}
                fill={theme.colors.text}
              >
                {p.number}
              </text>
            </g>
          ))}
      </g>
      {pads
        .filter((p) => drillOutline(p).length)
        .map((p) => (
          <path
            key={p.index}
            d={outlinePath(drillOutline(p))}
            transform={transform(p)}
            fill="none"
            stroke={theme.colors.textDarker}
            strokeWidth={0.08}
          >
            <title>
              {p.type === 'np_thru_hole' ? 'Unplated hole' : 'Plated drill'}
            </title>
          </path>
        ))}
      <path
        d="M -1 0 H 1 M 0 -1 V 1"
        stroke={theme.colors.accent}
        strokeWidth={0.1}
      />
    </svg>
  );
}
