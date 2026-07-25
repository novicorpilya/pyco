import React, { useState } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';
import './WelcomeModal.css';

interface WelcomeModalProps {
  onClose?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const registerNickname = useGameStore((state) => state.registerNickname);
  const registeredNicknames = useGameStore((state) => state.registeredNicknames);

  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputName(val);

    // Dynamic real-time validation preview
    const trimmed = val.trim();
    if (!trimmed) {
      setErrorMessage(null);
      return;
    }

    if (trimmed.length < 3) {
      setErrorMessage('Никнейм должен содержать минимум 3 символа');
      return;
    }

    const isTaken = registeredNicknames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase()
    );

    if (isTaken) {
      setErrorMessage('⚠️ Игрок с таким ником уже зарегистрирован! Выберите другой ник.');
    } else {
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerNickname(inputName);
    if (result.success) {
      if (onClose) onClose();
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const isFormValid = inputName.trim().length >= 3 && !errorMessage;

  return (
    <div className="welcome-backdrop">
      <div className="welcome-card">
        <div className="welcome-logo">🚀</div>
        <h1 className="welcome-title">Добро пожаловать в PYCO!</h1>
        <p className="welcome-subtitle">
          Введите ваш уникальный никнейм питониста, чтобы начать приключение и сохранить результаты в таблицу лидеров.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="welcome-input-group">
            <label className="welcome-input-label" htmlFor="pyco-nickname-input">
              Ваш Никнейм
            </label>
            <input
              id="pyco-nickname-input"
              type="text"
              className={`welcome-input ${errorMessage ? 'has-error' : ''}`}
              placeholder="Например: PythonCoder_99"
              value={inputName}
              onChange={handleInputChange}
              maxLength={20}
              autoFocus
            />

            {errorMessage && (
              <div className="welcome-error-msg" role="alert">
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="welcome-btn"
            disabled={!isFormValid}
          >
            Начать Приключение 🚀
          </button>
        </form>
      </div>
    </div>
  );
};
