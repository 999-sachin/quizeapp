import React from 'react';
import { useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  const { id } = useParams();
  return (
    <div>
      <Leaderboard contestId={id} />
    </div>
  );
}