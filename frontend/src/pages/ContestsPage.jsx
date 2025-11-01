import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './ContestsPage.css';

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const r = await api.get('/contests');
        setContests(r.data);
      } catch (e) {
        // This is the line that sets the error message you are seeing
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
      return <p>Loading contests...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (contests.length === 0) {
      return (
        <div className="no-contests-found">
          <i className="fas fa-search"></i>
          <h3>No Contests Found</h3>
          <p>There are currently no active contests. Try adding one to the database!</p>
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
            <Link to={`/contests/${contest._id}`} className="join-button">
              Join Now
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="contests-page">
      <h2 className="contests-header">All Contests</h2>
      {renderContent()}
    </div>
  );
}