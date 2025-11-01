import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './ContestList.css'; // This line requires ContestList.css to be in the same folder

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const r = await api.get('/contests');
        setContests(r.data);
      } catch (e) {
        setError('Could not fetch contests. Please try again later.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  return (
    <div className="contest-list-page">
      <div className="welcome-banner">
        <h1>Welcome to Math Masters!</h1>
        <p>Test your skills, challenge your friends, and climb the leaderboard.</p>
      </div>

      <h2 className="contests-header">All Contests</h2>
      
      {loading && <p>Loading contests...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
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
      )}
    </div>
  );
}