import styled from 'styled-components';
// @ts-expect-error -- react-easy-panzoom doesn't have type definitions
import { PanZoom } from 'react-easy-panzoom';

/**
 * Props for the SvgPreview component.
 * @typedef {object} Props
 * @property {string} svg - The SVG content as a string.
 * @property {number | string} width - The width of the SVG image.
 * @property {number | string} height - The height of the SVG image.
 * @property {string} [aria-label] - An optional aria-label for the preview container.
 * @property {string} [data-testid] - An optional data-testid for testing purposes.
 */
type Props = {
  svg: string;
  width: number | string;
  height: number | string;
  'aria-label'?: string;
  'data-testid'?: string;
};

/**
 * An img element styled to invert its colors and disable dragging.
 * This is used to make the SVG preview visible in a dark theme.
 */
const InvertedImage = styled.img`
  filter: invert();
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
`;

/**
 * A styled PanZoom component to provide panning and zooming functionality.
 * It hides overflow and removes the focus outline.
 */
const StyledPanZoom = styled(PanZoom)`
  overflow: hidden;
  height: 100%;

  &:focus-visible {
    outline: none;
  }
`;

/**
 * A component that displays an SVG preview with panning and zooming capabilities.
 * The SVG's colors are inverted for better visibility on dark backgrounds.
 *
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} A pan-and-zoom container with the inverted SVG image.
 */
const SvgPreview = ({
  svg,
  width,
  height,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: Props): JSX.Element => (
  <StyledPanZoom
    enableBoundingBox={true}
    minZoom={0.8}
    maxZoom={5}
    aria-label={ariaLabel}
    data-testid={dataTestId}
  >
    <InvertedImage
      width={width || '100%'}
      height={height || '100%'}
      src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
      alt={'Ergogen SVG Output preview'}
      draggable="false"
    />
  </StyledPanZoom>
);

export default SvgPreview;
