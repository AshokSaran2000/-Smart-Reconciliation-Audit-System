import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Card, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';

export default function Records(){
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    searchText: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/records?limit=1000');
      const data = Array.isArray(res.data) ? res.data : res.data.records || [];
      setRows(data);
      applyFilters(data, filters);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, f) => {
    let result = data || [];

    // Filter by status
    if (f.status && f.status !== 'all') {
      result = result.filter(r => r.result?.status === f.status);
    }

    // Search in transaction ID and reference number
    if (f.searchText && f.searchText.trim()) {
      const query = f.searchText.toLowerCase();
      result = result.filter(r => {
        const txnId = (r.record?.transactionId || '').toLowerCase();
        const refNum = (r.record?.referenceNumber || '').toLowerCase();
        const amount = String(r.record?.amount || '').toLowerCase();
        return txnId.includes(query) || refNum.includes(query) || amount.includes(query);
      });
    }

    setFiltered(result);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(rows, newFilters);
  };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'Matched': return 'success';
      case 'Partially Matched': return 'warning';
      case 'Not Matched': return 'danger';
      case 'Duplicate': return 'secondary';
      default: return 'light';
    }
  };

  const paginatedRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filtered.length / pageSize);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" /> Loading records...
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Records & Reconciliation</h2>

      <Card className="modern-card mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Matched">Matched</option>
                  <option value="Partially Matched">Partially Matched</option>
                  <option value="Not Matched">Not Matched</option>
                  <option value="Duplicate">Duplicate</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by Transaction ID, Reference Number, or Amount..."
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
        <Alert variant="info">No records found matching the criteria.</Alert>
      ) : (
        <>
          <Alert variant="light" className="mb-3">
            Showing <strong>{paginatedRows.length}</strong> of <strong>{filtered.length}</strong> records
          </Alert>

          <Card className="modern-card">
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Reference Number</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((r, idx) => (
                      <tr key={idx}>
                        <td><strong>{r.record?.transactionId || '-'}</strong></td>
                        <td>{r.record?.amount ? `$${r.record.amount.toFixed(2)}` : '-'}</td>
                        <td>{r.record?.referenceNumber || '-'}</td>
                        <td>
                          <span className={`badge bg-${getStatusBadgeVariant(r.result?.status)}`}>
                            {r.result?.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{r.record?.date ? new Date(r.record.date).toLocaleDateString() : '-'}</td>
                        <td>
                          <Link to={`/records/${r.record?._id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <Form.Select
                      style={{ width: '100px' }}
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </Form.Select>
                  </div>
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      return pageNum <= totalPages ? (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      ) : null;
                    })}
                    <Pagination.Next
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
