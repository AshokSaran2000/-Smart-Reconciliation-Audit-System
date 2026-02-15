import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Records from './components/Records';
import RecordDetail from './components/RecordDetail';
import Audit from './components/Audit';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

function Header(){
  const { user, logout } = useAuth();
  return (
    <header className="app-header">
      <div className="app-container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="app-brand me-3">SRA System</div>
          <small className="text-white-50">Smart Reconciliation & Audit System</small>
        </div>
        <div className="d-flex align-items-center gap-3">
          <nav className="me-3 nav">
            <Link className="nav-link" to="/">Dashboard</Link>
            <Link className="nav-link" to="/upload">Uploads</Link>
            <Link className="nav-link" to="/records">Reconciliation</Link>
            <Link className="nav-link" to="/audit">Audit Trail</Link>
          </nav>
        {user ? (
          <>
              <Link className="btn btn-light btn-sm" to="/upload">Upload File</Link>
              <NavDropdown title={user.name || user.role || 'User'} id="userMenu">
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
          </>
        ) : (
          <Link className="btn btn-light btn-sm" to="/login">Sign in</Link>
        )}
        </div>
      </div>
    </header>
  );
}

export default function App(){
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Container style={{paddingTop:20}}>
            <Routes>
              <Route path='/login' element={<Login/>} />
              <Route path='/' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
              <Route path='/upload' element={<ProtectedRoute requiredRole={['Admin', 'Analyst']}><Upload/></ProtectedRoute>} />
              <Route path='/records' element={<ProtectedRoute><Records/></ProtectedRoute>} />
              <Route path='/records/:id' element={<ProtectedRoute><RecordDetail/></ProtectedRoute>} />
              <Route path='/audit' element={<ProtectedRoute><Audit/></ProtectedRoute>} />
              <Route path='*' element={<NotFound/>} />
            </Routes>
          </Container>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
