import React from 'react';
import { safeStorage } from './storage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0b0d11',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h1 style={{ color: '#ef4444', marginTop: 0 }}>Something went wrong</h1>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              The application crashed during render. Below is the error detail:
            </p>
            <pre style={{
              background: '#000',
              padding: '16px',
              borderRadius: '8px',
              color: '#f43f5e',
              overflowX: 'auto',
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '13px',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                safeStorage.clear();
                window.location.href = '/';
              }}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Reset App Data & Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
