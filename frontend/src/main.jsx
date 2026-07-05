import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('React Error Boundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f5f6fa', padding: 24, fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>
              The app encountered an unexpected error. Please try refreshing the page.
            </p>
            <div style={{ background: '#fee2e2', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', fontFamily: 'monospace', wordBreak: 'break-word' }}>
              <strong>Error:</strong> {this.state.error?.message || String(this.state.error)}
            </div>
            {this.state.info?.componentStack && (
              <details style={{ marginBottom: 16 }}>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Component Stack</summary>
                <pre style={{ fontSize: 11, color: '#6b7280', overflow: 'auto', maxHeight: 200, background: '#f9fafb', padding: 12, borderRadius: 6 }}>
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => window.location.reload()}
                style={{ background: '#1e3a8a', color: 'white', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                Refresh Page
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{ background: 'transparent', color: '#1e3a8a', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #1e3a8a' }}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
