import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Nie udało się wyświetlić aplikacji:', error, info);
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6 text-center text-zinc-300">
          <h1 className="text-xl font-bold text-zinc-100">Nie udało się wyświetlić strony</h1>
          <p className="max-w-md text-sm text-zinc-500">
            Odśwież aplikację, aby ponownie załadować moduł.
          </p>
          <Button type="button" variant="outline" onClick={this.reload}>
            Odśwież
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;