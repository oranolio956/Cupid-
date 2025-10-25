import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: '#f0f2f5'
        }}>
          <Result
            status="error"
            title="Something Went Wrong"
            subTitle={
              <div>
                <p>{this.state.error?.message || "An unexpected error occurred"}</p>
                {process.env.NODE_ENV === 'development' && (
                  <details style={{
                    marginTop: '20px',
                    padding: '10px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    textAlign: 'left'
                  }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                      Error Details (Development Mode)
                    </summary>
                    <pre style={{
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      marginTop: '10px'
                    }}>
                      {this.state.error?.stack}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            }
            extra={[
              <Button type="primary" onClick={this.handleReload} key="reload">
                Reload Page
              </Button>,
              <Button onClick={this.handleGoHome} key="home">
                Go to Home
              </Button>
            ]}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;