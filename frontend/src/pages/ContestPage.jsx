import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import Leaderboard from '../components/Leaderboard';

export default function ContestPage() {
  const { id } = useParams(); // This 'id' is coming as undefined initially
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contestState, setContestState] = useState('pending');
  const [answered, setAnswered] = useState({});

  useEffect(() => {
    const fetchContest = async () => {
      try {
        // CORRECTION: Add a guard clause to prevent the API call if id is missing.
        if (!id) {
          setError('No contest ID specified in the URL.');
          setLoading(false);
          return; // Stop execution of the function
        }

        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view a contest.');
          setLoading(false);
          return;
        }

        // This line will now only run if 'id' is valid.
        const response = await api.get(`/contests/${id}`);
        setContest(response.data);

      } catch (e) {
        // This is where the error from your log is caught
        console.error("AxiosError", e);
        setError(e.response?.data?.msg || 'Could not fetch contest data.');
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]); // The dependency array is correct

  // ... (the rest of the component remains the same) ...

  useEffect(() => {
    if (!contest) return;

    const updateContestState = () => {
      const now = Date.now();
      const startTime = new Date(contest.startAt).getTime();
      const endTime = startTime + contest.durationSec * 1000;

      if (now < startTime) {
        setContestState('pending');
      } else if (now >= startTime && now < endTime) {
        setContestState('running');
      } else {
        setContestState('finished');
      }
    };

    updateContestState();
    const interval = setInterval(updateContestState, 1000);
    return () => clearInterval(interval);
  }, [contest]);
  
  const handleAnswered = (response, questionIndex) => {
    setAnswered(prev => ({...prev, [questionIndex]: true}));
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading contest...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red', marginTop: '40px' }}>{error}</p>;
  if (!contest) return null;

  const renderContent = () => {
    switch (contestState) {
      case 'pending':
        return (
          <div style={{ textAlign: 'center' }}>
            <h2>{contest.title}</h2>
            <p>This contest has not started yet.</p>
            <p><strong>Starts at:</strong> {new Date(contest.startAt).toLocaleString()}</p>
          </div>
        );
      case 'running':
        return (
          <div>
            <h2 style={{ textAlign: 'center' }}>{contest.title}</h2>
            <Timer startAt={contest.startAt} duration={contest.durationSec} onEnd={() => setContestState('finished')} />
            {contest.questions.map((q, i) => (
              <QuestionCard
                key={q._id || i}
                contestId={id}
                question={q}
                index={i}
                token={localStorage.getItem('token')}
                onAnswered={(resp) => handleAnswered(resp, i)}
              />
            ))}
          </div>
        );
      case 'finished':
        return (
          <div style={{ textAlign: 'center' }}>
            <h2>Contest Finished!</h2>
            <p>The contest '{contest.title}' has ended. Check out the final standings below.</p>
            <Leaderboard contestId={id} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {renderContent()}
    </div>
  );
}