import React, { useState, useEffect } from 'react';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import './QuestionOverlay.css';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS: Question[] = [
  {
    text: "Что делает цикл for (let i = 0; i < 5; i++)?",
    options: [
      "Повторяет код 5 раз",
      "Повторяет код 4 раза",
      "Повторяет код бесконечно",
      "Ничего не делает"
    ],
    correctIndex: 0
  },
  {
    text: "Какой цикл лучше использовать, если количество итераций заранее неизвестно?",
    options: [
      "for",
      "while",
      "switch",
      "if"
    ],
    correctIndex: 1
  }
];

export const QuestionOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    const showHandler = (data?: { index?: number }) => {
      setVisible(true);
      if (data?.index !== undefined) {
        setCurrentQuestionIndex(data.index);
      }
      setSelectedIdx(null);
      setMessage('Архитектор Циклов преграждает тебе путь!');
      setIsFinished(false);
    };

    const nextQuestionHandler = () => {
      setSelectedIdx(null);
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setVisible(true);
      } else {
        setIsFinished(true);
        setVisible(false);
      }
    };

    EventBus.on('show-question', showHandler);
    EventBus.on('quiz-next-question', nextQuestionHandler);

    return () => {
      EventBus.removeListener('show-question', showHandler);
      EventBus.removeListener('quiz-next-question', nextQuestionHandler);
    };
  }, [currentQuestionIndex]);

  const handleAnswer = (index: number) => {
    if (selectedIdx !== null) return; 
    
    setSelectedIdx(index);
    const question = QUESTIONS[currentQuestionIndex];
    const isCorrect = index === question.correctIndex;

    setTimeout(() => {
      setVisible(false);
      EventBus.emit('quiz-answer-selected', { 
        index, 
        isCorrect, 
        isLast: currentQuestionIndex === QUESTIONS.length - 1 
      });
    }, 600);
  };

  if (!visible) return null;

  return (
    <div className="question-overlay">
      <div className="question-card">
        <h2>Архитектор Циклов</h2>
        
        {message && <p className="message">{message}</p>}
        
        {!isFinished && (
          <>
            <p className="question-text">{QUESTIONS[currentQuestionIndex].text}</p>
            <div className="options-grid">
              {QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleAnswer(idx)}
                  className={`option-button ${selectedIdx === idx ? 'selected' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
