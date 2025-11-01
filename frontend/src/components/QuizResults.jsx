import React from 'react';
import './QuizResults.css'; // We will create this CSS file next

// A simple component to show a performance bar
const PerformanceChart = ({ score, total }) => {
  const percentage = total > 0 ? (score / total) * 100 : 0;

  const getFeedback = (perc) => {
    if (perc >= 90) return { text: "Excellent!", color: "#28a745" };
    if (perc >= 70) return { text: "Great Job!", color: "#17a2b8" };
    if (perc >= 50) return { text: "Good Effort", color: "#ffc107" };
    return { text: "Keep Practicing!", color: "#dc3545" };
  };

  const feedback = getFeedback(percentage);

  return (
    <div className="performance-chart">
      <div className="feedback-text" style={{ color: feedback.color }}>
        {feedback.text}
      </div>
      <div className="chart-bar-container">
        <div 
          className="chart-bar" 
          style={{ width: `${percentage}%`, backgroundColor: feedback.color }}
        >
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
};

export default function QuizResults({ results, questions, onRestart }) {
  const score = results.filter(r => r.isCorrect).length;
  const total = questions.length;

  return (
    <div className="quiz-results-container card">
      <h2>Quiz Complete!</h2>
      <p className="final-score">Your Score: {score} / {total}</p>
      
      <PerformanceChart score={score} total={total} />

      <h3 className="review-title">Review Your Answers</h3>
      <div className="answers-review">
        {questions.map((q, i) => (
          <div key={i} className="review-item">
            <p><strong>{i + 1}. {q.text}</strong></p>
            <p className={results[i].isCorrect ? 'correct' : 'incorrect'}>
              Your answer: {q.choices[results[i].selected].text}
              {results[i].isCorrect ? ' ✔' : ' ❌'}
            </p>
            {!results[i].isCorrect && (
              <p className="correct-answer">
                Correct answer: {q.choices[q.correctIndex].text}
              </p>
            )}
          </div>
        ))}
      </div>
      <button onClick={onRestart} className="restart-button">
        Create Another Quiz
      </button>
    </div>
  );
}