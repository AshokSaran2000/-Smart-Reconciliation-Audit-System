import React, { useState } from 'react';
import axios from 'axios';
import { Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function PreviewTable({ rows }){
  if(!rows || !rows.length) return null;
  const keys = Object.keys(rows[0]);
  return (
    <div style={{overflowX:'auto'}}>
      <table className="table table-sm table-striped">
        <thead>
          <tr>{keys.map(k=> <th key={k}>{k}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0,20).map((r,idx)=> (
            <tr key={idx}>{keys.map(k=> <td key={k}>{String(r[k] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Upload(){
  const { user } = useAuth();
  // viewers are not allowed to upload
  if(user && user.role === 'Viewer') return <Navigate to="/" replace />;
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mapping, setMapping] = useState({transactionId:'transactionId', amount:'amount', referenceNumber:'referenceNumber', date:'date'});
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }
    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',').map(h=>h.trim());
        const rows = lines.slice(1,21).map(l=>{
          const cols = l.split(',');
          const obj = {};
          headers.forEach((h,i)=> obj[h]=cols[i]);
          return obj;
        });
        setPreview(rows);
      } catch (err) {
        setError('Failed to parse file: ' + err.message);
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(f);
  };

  const upload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/upload', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      setJob(res.data);
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Upload File</h2>
      <Card className="modern-card">
        <Card.Body>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)} dismissible>File uploaded successfully! Processing has started.</Alert>}

          <Form>
            <Form.Group as={Row} className="mb-3">
              <Col sm={12}>
                <Form.Label>Select File (CSV or XLSX)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={e=>handleFile(e.target.files[0])}
                  disabled={loading}
                />
                <small className="text-muted">Max file size: 10MB</small>
              </Col>
            </Form.Group>

            {preview && <div className="mb-3">
              <h6>Preview (first 20 rows)</h6>
              <PreviewTable rows={preview} />
            </div>}

            {file && (
              <Alert variant="info">
                Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </Alert>
            )}

            <h6 className="mt-4">Field Mapping</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Transaction ID Field</Form.Label>
                  <Form.Control
                    placeholder="e.g., transactionId"
                    value={mapping.transactionId}
                    onChange={e=>setMapping({...mapping,transactionId:e.target.value})}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount Field</Form.Label>
                  <Form.Control
                    placeholder="e.g., amount"
                    value={mapping.amount}
                    onChange={e=>setMapping({...mapping,amount:e.target.value})}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reference Number Field</Form.Label>
                  <Form.Control
                    placeholder="e.g., referenceNumber"
                    value={mapping.referenceNumber}
                    onChange={e=>setMapping({...mapping,referenceNumber:e.target.value})}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date Field</Form.Label>
                  <Form.Control
                    placeholder="e.g., date"
                    value={mapping.date}
                    onChange={e=>setMapping({...mapping,date:e.target.value})}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button
              onClick={upload}
              variant="primary"
              className="mt-2"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                'Start Upload'
              )}
            </Button>
          </Form>

          {job && (
            <Alert variant="info" className="mt-3">
              <strong>Upload Submitted!</strong><br />
              Job ID: <code>{job.jobId}</code><br />
              Status: <strong>{job.status}</strong>
              {job.reused && <br />}
              {job.reused && <small className="text-muted">(Previously uploaded file - using cached results)</small>}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
