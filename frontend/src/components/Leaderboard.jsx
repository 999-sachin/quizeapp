import React, { useEffect, useState } from 'react';
import api from '../api/api';

const getMedal = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank;
};

export default function Leaderboard({ contestId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const r = await api.get(`/contests/${contestId}/leaderboard`);
        setRows(r.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLeaderboard();
  }, [contestId]);

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Leaderboard</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Time(s)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.user._id}>
                <td>{getMedal(i + 1)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={`https://i.pravatar.cc/40?u=${r.user._id}`} 
                      alt={r.user.name} 
                      className="avatar" 
                    />
                    {r.user.name}
                  </div>
                </td>
                <td>{r.score}</td>
                <td>{r.totalTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}