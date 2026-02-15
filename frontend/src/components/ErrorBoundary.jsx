import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="modern-card border-danger">
                <Card.Body>
                  <h2 className="text-danger mb-3">⚠️ Something went wrong</h2>
                  <p className="text-muted mb-3">
                    An unexpected error occurred. Please try refreshing the page or contact support.
                  </p>
                  <div className="bg-light p-3 rounded mb-3" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                    <strong>Error Details:</strong>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      this.setState({ hasError: false, error: null, errorInfo: null });
                      window.location.reload();
                    }}
                  >
                    Refresh Page
                  </Button>
                  <Button
                    variant="outline-secondary"
                    href="/"
                    className="ms-2"
                  >
                    Back to Home
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}
