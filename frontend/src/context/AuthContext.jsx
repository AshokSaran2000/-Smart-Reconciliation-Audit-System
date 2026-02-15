import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Point axios to backend
axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext(null);

function decodeJwt(token){
  try{
    const parts = token.split('.');
    if (!parts[1]) return null;
    // base64url -> base64
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // pad with '='
    while (payload.length % 4) payload += '=';
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }catch(e){
    return null;
  }
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    const p = decodeJwt(t);
    return p ? { token: t, ...p } : null;
  });

  useEffect(()=>{
    if (user?.token) axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    else delete axios.defaults.headers.common['Authorization'];
  },[user]);

  const login = async ({ email, password }) => {
    // In development, allow any entered credentials by mapping them to the seeded admin account
    // This makes it easy to get a valid token without remembering exact credentials.
    let creds = { email, password };
    if (process.env.NODE_ENV !== 'production') {
      // default to admin seeded user during local development
      creds = { email: 'admin@example.com', password: 'Admin123!' };
    }
    const res = await axios.post('/api/auth/login', creds);
    const token = res.data.token;
    const decoded = decodeJwt(token);
    const u = decoded ? { token, ...decoded } : { token };
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){ return useContext(AuthContext); }

export default AuthContext;
