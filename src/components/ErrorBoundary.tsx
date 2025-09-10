import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
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

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <AlertTriangle size={40} className="text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Что-то пошло не так
            </h1>
            
            <p className="text-slate-300 mb-8 leading-relaxed">
              Произошла неожиданная ошибка. Попробуйте обновить страницу или вернуться на главную.
            </p>
            
            {this.state.error && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 mb-6 text-left">
                <div className="text-red-400 text-sm font-mono">
                  {this.state.error.message}
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl transition-colors font-semibold"
              >
                <RefreshCw size={20} className="mr-2" />
                Обновить
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-xl transition-colors font-semibold"
              >
                <Home size={20} className="mr-2" />
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;