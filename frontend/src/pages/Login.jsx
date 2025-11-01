// File: frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Auth.css'; // We'll create this CSS file for styling

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      // This event tells the Navbar to update its state
      window.dispatchEvent(new Event('storage'));
      navigate('/'); // Redirect to the homepage after successful login
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-info-panel">
          <h1>Welcome Back!</h1>
          <p>Log in to challenge your mind and climb the leaderboard.</p>
        </div>
        <div className="auth-form-panel">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            
            <div className={`input-group ${error ? 'error' : ''}`}>
              <input
                type="email"
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={handleInputChange(setEmail)}
                required
              />
              <i className="fas fa-envelope input-icon"></i>
            </div>
            
            <div className={`input-group ${error ? 'error' : ''}`}>
              <input
                type="password"
                className="auth-input"
                placeholder="Password"
                value={password}
                onChange={handleInputChange(setPassword)}
                required
              />
              <i className="fas fa-lock input-icon"></i>
            </div>
            
            <button type="submit">Login</button>
          </form>
          <p className="auth-switch-link">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}