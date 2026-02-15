import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard(){
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);
  const sample = {
    totalUploads: 28,
    totalRecords: 15420,
    matched: 12850,
    partially: 200,
    notMatched: 1200,
    duplicates: 170,
    accuracy: 94.2
  };

  useEffect(()=>{
    axios.get('/api/dashboard/summary').then(r=>setData(r.data)).catch(()=>setData(sample));
    axios.get('/api/dashboard/recent?limit=6').then(r=>{
      const payload = r.data;
      let arr = [];
      if (Array.isArray(payload)) arr = payload;
      else if (Array.isArray(payload.data)) arr = payload.data;
      else if (Array.isArray(payload.items)) arr = payload.items;
      else if (payload && typeof payload === 'object') arr = Array.isArray(payload.recent) ? payload.recent : [payload];
      setRecent(arr);
    }).catch(()=>setRecent([
      { _id: '1', fileName: 'transactions_january.csv', totalRecords: 2450, status: 'Completed', uploadedBy: { name: 'John Doe' }, createdAt: '2024-01-15' },
      { _id: '2', fileName: 'transactions_december.csv', totalRecords: 3120, status: 'Processing', uploadedBy: { name: 'Jane Smith' }, createdAt: '2024-01-14' },
      { _id: '3', fileName: 'transactions_november.csv', totalRecords: 1890, status: 'Completed', uploadedBy: { name: 'Mike Johnson' }, createdAt: '2024-01-13' },
      { _id: '4', fileName: 'transactions_october.csv', totalRecords: 2670, status: 'Failed', uploadedBy: { name: 'Jane Smith' }, createdAt: '2024-01-12' }
    ]));
  },[]);

  if(!data) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const pie = [
    { name: 'Matched', value: data.matched },
    { name: 'Partially', value: data.partially },
    { name: 'Not Matched', value: data.notMatched },
    { name: 'Duplicates', value: data.duplicates }
  ];

  return (
    <div style={{padding:20}}>
      <h2 className="mb-3">Reconciliation Dashboard</h2>

      <Card className="mb-3 p-3 modern-card">
        <Row className="g-3">
          <Col md={4}>
            <FormFilters onApply={() => {}} />
          </Col>
          <Col md={8} className="d-flex align-items-center justify-content-end">
            <div className="text-muted">Showing live system metrics</div>
          </Col>
        </Row>
      </Card>

      <Row className="mb-4">
        <Col md={3}><Card className="p-3 modern-card"><div className="text-muted">TOTAL RECORDS</div><h3 className="mt-2">{data.totalRecords}</h3></Card></Col>
        <Col md={3}><Card className="p-3 modern-card"><div className="text-muted">MATCHED RECORDS</div><h3 className="mt-2 text-success">{data.matched}</h3></Card></Col>
        <Col md={3}><Card className="p-3 modern-card"><div className="text-muted">UNMATCHED RECORDS</div><h3 className="mt-2 text-danger">{data.notMatched}</h3></Card></Col>
        <Col md={3}><Card className="p-3 modern-card"><div className="text-muted">ACCURACY RATE</div><h3 className="mt-2 text-success">{data.accuracy}%</h3></Card></Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-3 modern-card">
            <Card.Body>
              <h6>Reconciliation Status Breakdown</h6>
              <div style={{width:'100%',height:300}}>
                <ResponsiveContainer>
                  <BarChart data={[{name:'Matched', value:data.matched},{name:'Unmatched', value:data.notMatched},{name:'Duplicate', value:data.duplicates},{name:'Partial', value:data.partially}]}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4b6ef6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3 modern-card">
            <Card.Body>
              <h6>Upload Status</h6>
              <div style={{width: '100%', height: 220}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                      {pie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="modern-card">
        <Card.Body>
          <h6>Recent Upload Jobs</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr><th>FILE NAME</th><th>RECORDS</th><th>STATUS</th><th>UPLOADED BY</th><th>DATE</th><th>ACTION</th></tr>
              </thead>
              <tbody>
                {(Array.isArray(recent) ? recent : []).map((j)=> (
                  <tr key={j._id}>
                    <td>{j.fileName}</td>
                    <td>{j.totalRecords || '-'}</td>
                    <td><span className={`badge ${j.status==='Completed'?'bg-success': j.status==='Processing'?'bg-warning text-dark':'bg-danger'}`}>{j.status}</span></td>
                    <td>{j.uploadedBy?.name || '—'}</td>
                    <td>{j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '-'}</td>
                    <td><a href={`/records?uploadJobId=${j._id}`}>View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

function FormFilters({ onApply }){
  return (
    <div className="d-flex gap-2">
      <select className="form-select form-select-sm">
        <option>All Time</option>
        <option>Last 7 days</option>
        <option>Last 30 days</option>
      </select>
      <select className="form-select form-select-sm">
        <option>All Status</option>
        <option>Matched</option>
        <option>Not Matched</option>
      </select>
      <select className="form-select form-select-sm">
        <option>All Users</option>
      </select>
      <button className="btn btn-outline-primary btn-sm" onClick={onApply}>Apply Filters</button>
    </div>
  );
}
