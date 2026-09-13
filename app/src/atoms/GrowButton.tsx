import styled from 'styled-components';
import { theme } from '../theme/theme';

/**
 * Props for the GrowButton component.
 * @typedef {object} Props
 * @property {string} [aria-label] - An optional aria-label for the button.
 * @property {string} [data-testid] - An optional data-testid for testing purposes.
 */
type Props = {
  'aria-label'?: string;
  'data-testid'?: string;
};

/**
 * A button that expands to fill the available horizontal space.
 */
const GrowButton = styled.button<Props>`
  background-color: ${theme.colors.accentSecondary};
  transition: background-color 0.15s ease-in-out;
  border: none;
  border-radius: 6px;
  color: ${theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  height: 34px;
  font-family: ${theme.fonts.body};
  flex-grow: 1;

  .material-symbols-outlined {
    font-size: ${theme.fontSizes.iconMedium} !important;
  }

  &:hover {
    background-color: ${theme.colors.accentDark};
  }
`;

export default GrowButton;
