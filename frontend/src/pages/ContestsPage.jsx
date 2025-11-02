import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './ContestList.css'; // You can rename ContestsPage.css to ContestList.css or vice-versa

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await api.get('/contests');
        setContests(response.data);
      } catch (e) {
        setError('Could not fetch contests. Please ensure the backend is running.');
        console.error("API Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading contests...</p>;
    }
    if (error) {
      return <p style={{ textAlign: 'center', color: 'red', marginTop: '40px' }}>{error}</p>;
    }
    if (contests.length === 0) {
      return (
        <div className="no-contests-found">
          <i className="fas fa-search"></i>
          <h3>No Contests Found</h3>
          <p>There are currently no active contests. An admin can create one!</p>
        </div>
      );
    }
    return (
      <div className="contests-grid">
        {contests.map(contest => (
          <div key={contest._id} className="contest-card">
            <h3>{contest.title}</h3>
            <div className="contest-info">
              <i className="fas fa-calendar-alt"></i>
              <span>Starts: {new Date(contest.startAt).toLocaleString()}</span>
            </div>
            {/* This Link will navigate to the single contest page with the correct ID */}
            <Link to={`/contests/${contest._id}`} className="join-button">
              View Contest
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="contest-list-page">
       <div className="welcome-banner">
        <h1>Available Contests</h1>
        <p>Select a contest to view its details and participate.</p>
      </div>
      {renderContent()}
    </div>
  );
}