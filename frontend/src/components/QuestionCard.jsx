import React, { useState } from 'react';
import api from '../api/api';

export default function QuestionCard({ contestId, question, index, token, onAnswered }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle');

  const submit = async () => {
    if (selected === null) return;
    setStatus('loading');
    try {
      const resp = await api.post(`/contests/${contestId}/submit`, {
        questionIndex: index,
        answerIndex: selected,
        timeTakenSec: 0
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStatus('done');
      onAnswered && onAnswered(resp.data);
    } catch (err) {
      setStatus('error');
      console.error(err?.response?.data || err.message);
      if (err?.response?.data?.msg) alert(err.response.data.msg);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      padding: '16px',
      marginBottom: '16px',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h4>{index + 1}. {question.text}</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {question.choices.map((c, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <label>
              <input type="radio" name={`q${index}`} onChange={() => setSelected(i)} disabled={status === 'done'} /> {c.text}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={submit} disabled={status === 'done' || selected === null}>
        {status === 'loading' ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}