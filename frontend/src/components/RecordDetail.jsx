import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, ListGroup, Spinner, Alert } from 'react-bootstrap';

function Timeline({ items }){
  if(!items || items.length === 0) return <p className="text-muted">No changes recorded</p>;
  return (
    <ListGroup variant="flush">
      {items.map((it,idx)=> (
        <ListGroup.Item key={idx}>
          <div className="d-flex justify-content-between">
            <strong>{it.userId ? `User: ${it.userId}` : 'System'}</strong>
            <small className="text-muted">{new Date(it.createdAt).toLocaleString()}</small>
          </div>
          <div style={{background:'#f9f9f9',padding:8,borderRadius:6,marginTop:8}}>
            <pre style={{margin:0,fontSize:11}}>{JSON.stringify(it.newValue,null,2)}</pre>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default function RecordDetail(){
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecordDetail();
  }, [id]);

  const fetchRecordDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/records/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load record details');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" /> Loading record...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <strong>Error:</strong> {error}
        <br />
        <Link to="/records" className="btn btn-sm btn-outline-danger mt-2">
          Back to Records
        </Link>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert variant="warning" className="mt-3">
        <strong>Record not found</strong>
        <br />
        <Link to="/records" className="btn btn-sm btn-outline-warning mt-2">
          Back to Records
        </Link>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/records" className="btn btn-outline-secondary">
          ← Back to Records
        </Link>
      </div>

      <Row>
        <Col md={8}>
          <Card className="modern-card mb-3">
            <Card.Body>
              <Card.Title>Record Details</Card.Title>
              <div className="table-responsive">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Transaction ID</strong></td>
                      <td><code>{data.record?.transactionId}</code></td>
                    </tr>
                    <tr>
                      <td><strong>Amount</strong></td>
                      <td>${data.record?.amount?.toFixed(2) || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Reference Number</strong></td>
                      <td>{data.record?.referenceNumber || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Date</strong></td>
                      <td>{data.record?.date ? new Date(data.record.date).toLocaleString() : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Upload Job ID</strong></td>
                      <td><code>{data.record?.uploadJobId}</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>

          <Card className="modern-card">
            <Card.Body>
              <Card.Title>Reconciliation Result</Card.Title>
              {data.result ? (
                <div>
                  <p>
                    <strong>Status: </strong>
                    <span className={`badge bg-${
                      data.result.status === 'Matched' ? 'success' :
                      data.result.status === 'Partially Matched' ? 'warning' :
                      data.result.status === 'Not Matched' ? 'danger' : 'secondary'
                    }`}>
                      {data.result.status}
                    </span>
                  </p>
                  {data.result.mismatchFields && data.result.mismatchFields.length > 0 && (
                    <p>
                      <strong>Mismatch Fields:</strong> {data.result.mismatchFields.join(', ')}
                    </p>
                  )}
                  <div className="bg-light p-3 rounded">
                    <pre style={{margin: 0, fontSize: '12px'}}>{JSON.stringify(data.result, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No reconciliation result available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="modern-card">
            <Card.Body>
              <Card.Title>Raw Data</Card.Title>
              <div style={{maxHeight: '300px', overflow: 'auto'}}>
                <pre style={{fontSize: '11px'}}>{JSON.stringify(data.record?.rawData || {}, null, 2)}</pre>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={12}>
          <Card className="modern-card">
            <Card.Body>
              <Card.Title>Audit Timeline</Card.Title>
              <Timeline items={data.timeline} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
