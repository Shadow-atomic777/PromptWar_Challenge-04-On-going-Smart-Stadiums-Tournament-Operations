import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-main)', textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={64} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontFamily: 'var(--global-header-font)', fontSize: '2rem', marginBottom: '0.5rem' }}>Connection Lost</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '2rem' }}>
            We encountered an unexpected error loading this part of OmniStadium. Please check your network connection and try again.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
