import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('Global script error:', event.error || event.message);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = 'padding:20px;color:red;font-family:sans-serif;';
    const title = document.createElement('h1');
    title.textContent = 'Global Error';
    const detail = document.createElement('pre');
    detail.textContent = String(event.message || 'An unexpected error occurred.');
    errorContainer.appendChild(title);
    errorContainer.appendChild(detail);
    root.appendChild(errorContainer);
  }
});

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
