import React from 'react';

export class ModelPreviewBoundary extends React.Component<{ resetKey: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }

  componentDidUpdate(previous: Readonly<{ resetKey: string }>): void {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render(): React.ReactNode {
    if (this.state.failed) return <div className="wb-model-message" role="alert"><p>The 3D preview could not be displayed. Switch to 2D or retry the model.</p><button className="wb-secondary" onClick={() => this.setState({ failed: false })}>Retry model loading</button></div>;
    return this.props.children;
  }
}
