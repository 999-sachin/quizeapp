import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // We will create this CSS file next

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="welcome-banner">
        <h1>Welcome to Math Masters!</h1>
        <p>Test your skills, challenge your friends, and climb the leaderboard.</p>
      </div>

      <div className="cta-section">
        <h2>What's Next?</h2>
        <div className="cta-buttons">
          <Link to="/contests" className="cta-button primary">
            <i className="fas fa-trophy"></i> Browse Contests
          </Link>
          <Link to="/generate-quiz" className="cta-button secondary">
            <i className="fas fa-file-upload"></i> Create a Quiz from PDF
          </Link>
        </div>
      </div>
    </div>
  );
}