import React, { useState, useEffect } from 'react';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import { LEVEL1_CONFIG, type QuestionItem } from '../../../entities/level/config/level1.config';
import { LEVEL0_CONFIG } from '../../../entities/level/config/level0.config';
import { useGameStore } from '../../../shared/model/useGameStore';
import './QuestionOverlay.css';

export const QuestionOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selectedLevelId = useGameStore((state) => state.selectedLevelId);
  const levelConfig = selectedLevelId === 0 ? LEVEL0_CONFIG : LEVEL1_CONFIG;

  // Dynamically load active questions based on selectedLevelId
  const activeQuestions: QuestionItem[] = levelConfig.questions;
  const mentorName = levelConfig.npcName;

  useEffect(() => {
    const showHandler = (data?: { index?: number }) => {
      setVisible(true);
      if (data?.index !== undefined) {
        setCurrentQuestionIndex(data.index);
      }
      setSelectedIdx(null);
      setMessage(`${mentorName} испытывает твои знания типов Python!`);
      setIsFinished(false);
    };

    const nextQuestionHandler = () => {
      setSelectedIdx(null);
      if (currentQuestionIndex < activeQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
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
  }, [currentQuestionIndex, activeQuestions.length, mentorName]);

  const handleAnswer = (index: number) => {
    if (selectedIdx !== null) return;

    setSelectedIdx(index);
    const question = activeQuestions[currentQuestionIndex];
    const isCorrect = index === question.correctIndex;

    setTimeout(() => {
      setVisible(false);
      EventBus.emit('quiz-answer-selected', {
        questionIndex: currentQuestionIndex,
        isCorrect,
        isLast: currentQuestionIndex === activeQuestions.length - 1
      });
    }, 600);
  };

  if (!visible) return null;

  const currentQ = activeQuestions[currentQuestionIndex];

  return (
    <div className="question-overlay">
      <div className="question-card">
        <h2>{mentorName} — {levelConfig.title}</h2>

        {message && <p className="message">{message}</p>}

        {!isFinished && currentQ && (
          <>
            <p className="question-text">{currentQ.text}</p>
            <div className="options-grid">
              {currentQ.options.map((option, idx) => (
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
