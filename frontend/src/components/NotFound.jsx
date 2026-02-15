import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function NotFound(){
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="modern-card text-center p-5">
            <h1 style={{ fontSize: '72px', fontWeight: 'bold', color: '#0d6efd', marginBottom: '20px' }}>
              404
            </h1>
            <h3 className="mb-3">Page Not Found</h3>
            <p className="text-muted mb-4">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
              <Button variant="primary" size="lg">
                Back to Dashboard
              </Button>
            </Link>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
