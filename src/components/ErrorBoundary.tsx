// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  ignoreErrors?: string[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  private originalConsoleError: any;

  public componentDidMount() {
    // Interceptar console.error para suprimir erros de removeChild
    this.originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      const { ignoreErrors = [] } = this.props;
      
      const shouldIgnore = ignoreErrors.some(msg => 
        errorMessage.includes(msg)
      );

      if (shouldIgnore) {
        // Não mostrar este erro no console
        return;
      }

      // Chamar console.error original para outros erros
      this.originalConsoleError(...args);
    };
  }

  public componentWillUnmount() {
    // Restaurar console.error original
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Verificar se é um erro que deve ser ignorado
    const { ignoreErrors = [] } = this.props;
    const shouldIgnore = ignoreErrors.some(msg => 
      error.message.includes(msg) || error.toString().includes(msg)
    );

    if (shouldIgnore) {
      console.warn('⚠️ Erro ignorado pelo ErrorBoundary:', error.message);
      // Não mostrar o erro, apenas logar
      return;
    }

    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render() {
    const { hasError, error } = this.state;
    const { ignoreErrors = [] } = this.props;

    if (hasError && error) {
      // Verificar se é um erro que deve ser ignorado
      const shouldIgnore = ignoreErrors.some(msg => 
        error.message.includes(msg) || error.toString().includes(msg)
      );

      if (shouldIgnore) {
        // Ignorar o erro e continuar renderizando normalmente
        return this.props.children;
      }

      // Mostrar fallback para outros erros
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Algo deu errado</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
