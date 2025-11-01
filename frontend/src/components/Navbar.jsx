import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Optional: Listen for storage changes to update navbar
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    closeMenu();
    // Redirect to home or login page if needed
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <i className="fas fa-calculator"></i> Math<span>Quiz</span>
      </Link>
      <div className="navbar-toggler" onClick={() => setIsOpen(!isOpen)}>
        <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
      </div>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <NavLink to="/" className="nav-link" onClick={closeMenu}><i className="fas fa-home"></i> Home</NavLink>
        <NavLink to="/contests" className="nav-link" onClick={closeMenu}><i className="fas fa-trophy"></i> Contests</NavLink>
        <NavLink to="/generate-quiz" className="nav-link" onClick={closeMenu}><i className="fas fa-file-upload"></i> PDF Quiz</NavLink>
        {isLoggedIn ? (
          <Link to="/login" className="nav-link" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</Link>
        ) : (
          <NavLink to="/login" className="nav-link" onClick={closeMenu}><i className="fas fa-user-plus"></i> Login/Signup</NavLink>
        )}
      </div>
    </nav>
  );
}