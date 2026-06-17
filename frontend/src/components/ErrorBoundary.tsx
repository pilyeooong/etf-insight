import { Component, type ReactNode } from 'react';
import { TextButton } from '@toss/tds-mobile';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <p>오류가 발생했습니다.</p>
            <TextButton size="medium" onClick={() => window.location.reload()}>
              새로고침
            </TextButton>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
