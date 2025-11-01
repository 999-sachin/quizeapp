import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import ContestsPage from './pages/ContestsPage'; // This line must be correct
import ContestPage from './pages/ContestsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import GenerateQuizPage from './pages/GenerateQuizPage';
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
          <Route path="/generate-quiz" element={<GenerateQuizPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contests/:id" element={<ContestPage />} />
          <Route path="/contests/:id/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </main>
    </div>
  );
}