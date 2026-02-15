import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login(){
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Viewer');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const auth = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try{
      await auth.login({ email, password });
      nav('/');
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${baseURL}/api/auth/register`, {
        name,
        email,
        password,
        role
      });
      setSuccess('Registration successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('Viewer');
      setTimeout(() => setIsRegister(false), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <Card className="mx-auto modern-card" style={{maxWidth:420}}>
      <Card.Body>
        <h4 className="mb-3">
          {isRegister ? 'Create Account' : 'Sign in'}
        </h4>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <Form.Group className="mb-2">
              <Form.Label>Full Name</Form.Label>
              <Form.Control 
                type="text" 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                required 
              />
            </Form.Group>
          )}
          
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
            />
          </Form.Group>

          {isRegister && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e=>setConfirmPassword(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                  value={role} 
                  onChange={e=>setRole(e.target.value)}
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          <div className="d-grid mb-2">
            <Button type="submit" variant="primary">
              {isRegister ? 'Register' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="link" 
              className="p-0"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setSuccess(null);
              }}
            >
              {isRegister ? 'Back to login' : 'Create new account'}
            </Button>
          </div>

          <div className="mt-3 text-center text-muted small">
            {isRegister 
              ? 'Register to create your account' 
              : 'Use any email/password or register'}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
