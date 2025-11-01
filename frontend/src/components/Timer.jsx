import React, { useEffect, useState } from 'react';

export default function Timer({ startAt, duration, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(startAt).getTime() + duration * 1000;
      const rem = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(rem);
      if (rem <= 0) onEnd && onEnd();
    };

    tick();
    const iv = setInterval(tick, 1000);

    return () => clearInterval(iv);
  }, [startAt, duration, onEnd]);

  return (
    <div style={{
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderRadius: '5px'
    }}>
      Time Left: {timeLeft}s
    </div>
  );
}