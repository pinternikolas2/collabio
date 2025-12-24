import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
                    <div className="text-center max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-red-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Něco se pokazilo</h1>
                        <p className="text-gray-600 mb-6">
                            Omlouváme se, v aplikaci nastala neočekávaná chyba. Zkuste prosím stránku obnovit.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-3 bg-red-50 rounded text-left overflow-x-auto">
                                <p className="text-xs text-red-800 font-mono">{this.state.error.toString()}</p>
                            </div>
                        )}
                        <Button
                            onClick={this.handleReload}
                            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white w-full"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Obnovit stránku
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
