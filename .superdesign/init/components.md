# Shared components

## ErrorBoundary
Path: `src/components/ErrorBoundary.tsx`
React class error boundary used around the 3D hero.

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Globe render error", error, info); }
  render() {
    if (this.state.hasError) return <div className="grid h-full place-items-center bg-space-bg text-text-secondary">Interactive globe unavailable.</div>;
    return this.props.children;
  }
}
```

Most reusable visual primitives (`Reveal`, `TiltCard`, `CountUp`, `ScrollProgress`, `SectionSep`) live in `src/components/motion.tsx`. They provide intersection reveals, pointer tilt/glare, animated counters, page scroll progress, and section separators. The codebase otherwise uses custom Tailwind utility compositions rather than a component library.
