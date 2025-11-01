import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

const mathFacts = [
  "Forty is the only number spelt with letters arranged in alphabetical order.",
  "Pi (π) is an irrational number; its decimal representation never ends or repeats.",
  "The equals sign (=) was invented in 1557 by a Welsh mathematician.",
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const randomFact = mathFacts[Math.floor(Math.random() * mathFacts.length)];

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };
  
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const r = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', r.data.token);
      window.dispatchEvent(new Event('storage')); // Notify navbar of login
      nav('/');
    } catch (e) {
      setError(e.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-info-panel">
          <h1>Join the Challenge!</h1>
          <p>Create your account to start competing in math quizzes today.</p>
          <div className="math-fact-box">
            <strong>Did you know?</strong>
            <p>{randomFact}</p>
          </div>
        </div>
        <div className="auth-form-panel">
          <h2>Create Account</h2>
          <form onSubmit={submit}>
            {error && <p className="error-message">{error}</p>}

            <div className={`input-group ${error.includes('Name') ? 'error' : ''}`}>
              <input
                type="text"
                className="auth-input"
                placeholder="Name"
                value={name}
                onChange={handleInputChange(setName)}
                required
              />
              <i className="fas fa-user input-icon"></i>
            </div>
            
            <div className={`input-group ${error.includes('Email') ? 'error' : ''}`}>
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

            <div className={`input-group ${error.includes('Password') ? 'error' : ''}`}>
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
            
            <button type="submit">Register</button>
          </form>
          <p className="auth-switch-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}