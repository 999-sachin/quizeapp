import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionIds, setQuestionIds] = useState('');
  const [startAt, setStartAt] = useState('');
  const [durationSec, setDurationSec] = useState(300); // 5 minutes
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // The questionIds need to be an array of strings
      const idsArray = questionIds.split(',').map(id => id.trim());

      await api.post('/contests', {
        title,
        description,
        questionIds: idsArray,
        startAt,
        durationSec
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      navigate('/contests'); // Go to contests page to see the new one
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create contest');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h2>Create New Contest (Admin)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Question IDs (comma-separated)</label>
          <input type="text" value={questionIds} onChange={e => setQuestionIds(e.target.value)} required placeholder="Paste the _id of the question here" style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Start Date and Time</label>
          <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Duration (seconds)</label>
          <input type="number" value={durationSec} onChange={e => setDurationSec(Number(e.target.value))} required style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create Contest</button>
      </form>
    </div>
  );
}