import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[InkMind]', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
          <h2 className="font-display text-lg text-ink">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="max-w-sm text-sm text-ink-muted">{this.state.error.message}</p>
          <button
            type="button"
            className="kos-btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
