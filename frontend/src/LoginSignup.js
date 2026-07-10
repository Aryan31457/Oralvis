import React, { useState } from 'react';
import { FaTooth, FaTeethOpen } from 'react-icons/fa';
import axios from 'axios';
import OtpVerification from './OtpVerification';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

const LoginSignup = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
        onAuth(res.data.user, res.data.token);
      } else {
        await axios.post(`${API_BASE_URL}/api/signup`, { email, password, name, role });
        setShowOtp(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
    }
  };

  if (showOtp) {
    return <OtpVerification email={email} onVerified={() => { setShowOtp(false); setIsLogin(true); window.location.reload(); }} />;
  }

  return (
    <>
      <header className="dentiva-header">
        <FaTooth size={48} style={{ color: '#1976d2', marginRight: 12 }} />
        <span className="dentiva-title">DENTIVA</span>
      </header>
      <div className="auth-container">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
              <select value={role} onChange={e => setRole(e.target.value)} required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: 10 }}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
        {error && <div className="error-msg">{error}</div>}
      </div>
      <footer className="dentiva-footer">
        <FaTeethOpen size={32} style={{ color: '#1976d2', marginRight: 8 }} />
        <span>Oral Health. Simplified.</span>
      </footer>
    </>
  );
};

export default LoginSignup;
