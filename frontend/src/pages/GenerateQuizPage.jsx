// File: frontend/src/pages/GenerateQuizPage.jsx

import React, { useState, useRef } from 'react';
import api from '../api/api';
import QuizResults from '../components/QuizResults'; // Import the new results component
import './GenerateQuizPage.css';

// A new component for handling each question within this page
const InteractiveQuestion = ({ question, index, onSelectAnswer, selectedAnswer }) => {
  return (
    <div className="question-card card">
      <h4>{index + 1}. {question.text}</h4>
      <ul className="choices-list">
        {question.choices.map((choice, i) => (
          <li key={i}>
            <label className={`choice-label ${selectedAnswer === i ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`q${index}`}
                onChange={() => onSelectAnswer(index, i)}
                checked={selectedAnswer === i}
              />
              {choice.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function GenerateQuizPage() {
  // State for the configuration step
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // State for the quiz itself
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizState, setQuizState] = useState('configuring'); // 'configuring', 'taking', 'finished'

  const handleRestart = () => {
    setFile(null);
    setFileName('No file chosen');
    setQuiz(null);
    setError('');
    setAnswers({});
    setQuizState('configuring');
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleGenerateSubmit = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in. Your session may have expired.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('numQuestions', numQuestions);
    
    setIsLoading(true);
    setError('');
    setQuiz(null);

    try {
      const response = await api.post('/quiz/generate-from-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setQuiz(response.data);
      setQuizState('taking');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to generate quiz.');
      setQuizState('configuring');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitQuiz = () => {
    setQuizState('finished');
  };

  // --- RENDER LOGIC ---

  // State 1: Show the upload form
  if (quizState === 'configuring') {
    return (
      <div className="generate-quiz-container">
        <div className="upload-card card">
          <h2>Generate an AI-Powered Quiz</h2>
          <p>Upload a PDF with questions, and our AI will create a complete multiple-choice quiz.</p>
          
          <div className="file-input-wrapper">
            <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} style={{display: 'none'}} />
            <button onClick={() => fileInputRef.current.click()} className="file-input-label">Choose File</button>
            <span className="file-name">{fileName}</span>
          </div>

          <div className="num-questions-wrapper">
            <label htmlFor="numQuestions">Number of Questions:</label>
            <input 
              type="number" 
              id="numQuestions" 
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, e.target.value))}
              min="1" max="20"
            />
          </div>

          <button onClick={handleGenerateSubmit} disabled={isLoading} className="generate-button">
            {isLoading ? 'Generating...' : 'Generate Quiz'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
        {isLoading && <div className="spinner"></div>}
      </div>
    );
  }

  // State 2: Show the active quiz
  if (quizState === 'taking' && quiz) {
    return (
      <div className="quiz-taking-container">
        <h3>{quiz.title}</h3>
        {quiz.questions.map((q, i) => (
          <InteractiveQuestion
            key={i}
            question={q}
            index={i}
            onSelectAnswer={handleSelectAnswer}
            selectedAnswer={answers[i]}
          />
        ))}
        <button 
          onClick={handleSubmitQuiz} 
          className="submit-quiz-button"
          disabled={Object.keys(answers).length !== quiz.questions.length}
        >
          Finish & See Results
        </button>
      </div>
    );
  }

  // State 3: Show the final results
  if (quizState === 'finished' && quiz) {
    const results = quiz.questions.map((q, i) => ({
      selected: answers[i],
      isCorrect: q.correctIndex === answers[i]
    }));
    return <QuizResults results={results} questions={quiz.questions} onRestart={handleRestart} />;
  }

  return null; // Should not be reached
}