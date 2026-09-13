import { render, screen } from '@testing-library/react';
import Button from './Button';
import { theme } from '../theme/theme';

const setup = (props: Partial<React.ComponentProps<typeof Button>> = {}) => {
  const defaultProps: React.ComponentProps<typeof Button> = {
    children: 'Test Button',
  };
  return render(<Button {...defaultProps} {...props} />);
};

describe('Button', () => {
  it('renders with large size by default', () => {
    // Arrange & Act
    setup();

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.large.padding,
      fontSize: theme.buttonSizes.large.fontSize,
    });
  });

  it('renders with medium size when size is "medium"', () => {
    // Arrange & Act
    setup({ size: 'medium' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.medium.padding,
      fontSize: theme.buttonSizes.medium.fontSize,
    });
  });

  it('renders with medium size when size is "md"', () => {
    // Arrange & Act
    setup({ size: 'md' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.medium.padding,
      fontSize: theme.buttonSizes.medium.fontSize,
    });
  });

  it('renders with small size when size is "small"', () => {
    // Arrange & Act
    setup({ size: 'small' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.small.padding,
      fontSize: theme.buttonSizes.small.fontSize,
    });
  });

  it('renders with small size when size is "sm"', () => {
    // Arrange & Act
    setup({ size: 'sm' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.small.padding,
      fontSize: theme.buttonSizes.small.fontSize,
    });
  });

  it('renders with icon size when size is "icon"', () => {
    // Arrange & Act
    setup({ size: 'icon' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.icon.padding,
      fontSize: theme.buttonSizes.icon.fontSize,
    });
  });

  it('renders with large size when size is "large"', () => {
    // Arrange & Act
    setup({ size: 'large' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.large.padding,
      fontSize: theme.buttonSizes.large.fontSize,
    });
  });

  it('renders with large size when size is "lg"', () => {
    // Arrange & Act
    setup({ size: 'lg' });

    // Assert
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveStyle({
      padding: theme.buttonSizes.large.padding,
      fontSize: theme.buttonSizes.large.fontSize,
    });
  });
});
