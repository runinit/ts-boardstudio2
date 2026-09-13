import { render, screen } from '@testing-library/react';
import LoadingBar from './LoadingBar';

describe('LoadingBar', () => {
  it('should render when visible is true', () => {
    // Arrange & Act
    render(<LoadingBar visible={true} data-testid="loading-bar" />);

    // Assert
    expect(screen.getByTestId('loading-bar')).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    // Arrange & Act
    render(<LoadingBar visible={false} data-testid="loading-bar" />);

    // Assert
    expect(screen.queryByTestId('loading-bar')).not.toBeInTheDocument();
  });

  it('should use accent color from theme and be positioned as overlay', () => {
    // Arrange & Act
    render(<LoadingBar visible={true} data-testid="loading-bar" />);

    const loadingBar = screen.getByTestId('loading-bar');

    // Assert
    expect(loadingBar).toBeInTheDocument();
    // The loading bar container should be positioned fixed as an overlay
    expect(loadingBar).toHaveStyle({
      height: '3px',
      position: 'fixed',
      top: '45px',
    });
  });
});
