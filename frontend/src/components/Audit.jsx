import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Form, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Audit(){
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    source: 'all',
    timeRange: 'all',
    searchText: ''
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/audit/logs');
      const data = Array.isArray(res.data) ? res.data : res.data.logs || [];
      setLogs(data);
      applyFilters(data, filters);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, f) => {
    let result = data || [];

    // Filter by source
    if (f.source && f.source !== 'all') {
      result = result.filter(log => log.source === f.source);
    }

    // Filter by time range
    if (f.timeRange && f.timeRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      switch (f.timeRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      result = result.filter(log => new Date(log.createdAt) >= cutoffDate);
    }

    // Search in oldValue and newValue
    if (f.searchText && f.searchText.trim()) {
      const query = f.searchText.toLowerCase();
      result = result.filter(log => {
        const oldStr = JSON.stringify(log.oldValue || {}).toLowerCase();
        const newStr = JSON.stringify(log.newValue || {}).toLowerCase();
        const userId = (log.userId || 'system').toLowerCase();
        return oldStr.includes(query) || newStr.includes(query) || userId.includes(query);
      });
    }

    setFiltered(result);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(logs, newFilters);
  };

  const getSourceBadge = (source) => {
    const variants = {
      'seed': 'info',
      'upload': 'primary',
      'manual-correction': 'warning',
      'system': 'secondary'
    };
    return <Badge bg={variants[source] || 'light'}>{source || 'unknown'}</Badge>;
  };

  const formatChangesSummary = (oldValue, newValue) => {
    if (!oldValue || !newValue) return 'Created';
    const changes = [];
    for (const key in newValue) {
      if (oldValue[key] !== newValue[key]) {
        changes.push(`${key}: ${oldValue[key]} → ${newValue[key]}`);
      }
    }
    return changes.length > 0 ? changes.join(', ') : 'No changes';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" /> Loading audit logs...
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Audit Trail</h2>

      <Card className="modern-card mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Source</Form.Label>
                <Form.Select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="seed">Seed</option>
                  <option value="upload">Upload</option>
                  <option value="manual-correction">Manual Correction</option>
                  <option value="system">System</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Time Range</Form.Label>
                <Form.Select
                  value={filters.timeRange}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by user, transaction ID, or values..."
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {filtered.length === 0 ? (
        <Alert variant="info">No audit logs found matching the criteria.</Alert>
      ) : (
        <div>
          <Alert variant="light" className="mb-3">
            Showing <strong>{filtered.length}</strong> of <strong>{logs.length}</strong> audit entries
          </Alert>

          <div className="audit-timeline">
            {filtered.map((log, idx) => (
              <Card key={idx} className="modern-card mb-3">
                <Card.Body>
                  <Row>
                    <Col md={9}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <strong>{log.userId ? `User: ${log.userId}` : 'System'}</strong>
                        {getSourceBadge(log.source)}
                        <small className="text-muted">
                          {new Date(log.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <div className="mb-2">
                        {log.recordId && (
                          <small>
                            <Link to={`/records/${log.recordId}`} className="badge bg-secondary">
                              Record: {log.recordId}
                            </Link>
                          </small>
                        )}
                      </div>
                      <div className="bg-light p-2 rounded" style={{ fontSize: '12px' }}>
                        <strong>Changes:</strong> {formatChangesSummary(log.oldValue, log.newValue)}
                      </div>
                    </Col>
                    <Col md={3}>
                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        data-bs-toggle="collapse"
                        data-bs-target={`#details-${idx}`}
                      >
                        View Details
                      </button>
                    </Col>
                  </Row>

                  <div className="collapse mt-3" id={`details-${idx}`}>
                    <div className="card card-body bg-light">
                      <Row>
                        <Col md={6}>
                          <strong>Before:</strong>
                          <pre className="bg-white p-2 rounded" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                            {JSON.stringify(log.oldValue || {}, null, 2)}
                          </pre>
                        </Col>
                        <Col md={6}>
                          <strong>After:</strong>
                          <pre className="bg-white p-2 rounded" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                            {JSON.stringify(log.newValue || {}, null, 2)}
                          </pre>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
