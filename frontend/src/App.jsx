import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import ContestsPage from './pages/ContestsPage';

// ======================================================================
// THIS IS THE LINE THAT WAS MISSING
// ======================================================================
import ContestList from './pages/ContestList';
import LeaderboardPage from './pages/LeaderboardPage';
import GenerateQuizPage from './pages/GenerateQuizPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* This route shows the LIST of all contests */}
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/contests/:id" element={<ContestList />} />

          <Route path="/contests/:id/leaderboard" element={<LeaderboardPage />} />
          <Route path="/generate-quiz" element={<GenerateQuizPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/create-contest" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}