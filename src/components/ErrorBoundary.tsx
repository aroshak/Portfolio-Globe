import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

// Catches render/lifecycle errors in the globe subtree so a runtime fault
// degrades to a visible message instead of unmounting the whole app or
// looping on every animation frame.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[GlobeErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-space-bg">
          <div className="glass-dark rounded-2xl p-6 max-w-md text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-alert-red mb-2">
              Renderer fault
            </div>
            <p className="text-[12px] text-text-secondary font-mono leading-relaxed break-words">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 pill border border-cyan-glow/40 text-cyan-glow hover:border-cyan-glow"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
