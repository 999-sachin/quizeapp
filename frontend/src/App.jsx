import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import ContestsPage from './pages/ContestPage';
import ContestPage from './pages/ContestPage'; // This is the component for a single contest
import LeaderboardPage from './pages/LeaderboardPage';
import GenerateQuizPage from './pages/GenerateQuizPage';
import AdminPage from './pages/AdminPage'; // Make sure you have an Admin page if you use this route
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contests" element={<ContestsPage />} />
          {/* This route now correctly points to the single ContestPage component */}
          <Route path="/contests/:id" element={<ContestPage />} />
          <Route path="/contests/:id/leaderboard" element={<LeaderboardPage />} />
          <Route path="/generate-quiz" element={<GenerateQuizPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Optional: Add a route for your admin page */}
          <Route path="/admin/create-contest" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}