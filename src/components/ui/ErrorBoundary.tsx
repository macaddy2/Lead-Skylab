// Error Boundary component for catching render errors in page sections
import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>
                        Something went wrong
                    </h3>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
