/**
 * ═══════════════════════════════════════════════════════════════
 * ErrorBoundary — Catches React render errors gracefully
 * ═══════════════════════════════════════════════════════════════
 *
 * Wraps route sections to prevent a single component crash from
 * taking down the entire app. Shows a user-friendly error card
 * with retry and navigation options.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackTitle?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        // Use window.location to fully reset the React tree
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">
                        {this.props.fallbackTitle || 'Something went wrong'}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                        An unexpected error occurred. This has been logged.
                        You can try again or return to the home page.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6 max-w-lg overflow-auto text-left">
                            {this.state.error.message}
                        </pre>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
