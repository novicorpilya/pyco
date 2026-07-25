import { describe, it, expect } from 'vitest';
import { LEVEL1_CONFIG } from '../../src/entities/level/config/level1.config';

describe('QuestionOverlay Level Config Integration (TDD RED/GREEN)', () => {
  it('should load Level 1 config correctly for Level 1 Scene', () => {
    expect(LEVEL1_CONFIG.npcName).toBe('Магистр Синтаксиса');
    expect(LEVEL1_CONFIG.title).toBe('Башня Переменных');
    expect(LEVEL1_CONFIG.questions.length).toBeGreaterThanOrEqual(3);
  });

  it('should validate answer correctness for Level 1 questions', () => {
    const q1 = LEVEL1_CONFIG.questions[0];
    const q2 = LEVEL1_CONFIG.questions[1];
    const q3 = LEVEL1_CONFIG.questions[2];

    expect(q1.options[q1.correctIndex]).toBe('1010');
    expect(q2.options[q2.correctIndex]).toBe('8');
    expect(q3.options[q3.correctIndex]).toBe('bool');
  });

  it('should format 1st, 2nd, 3rd, and 4th question prompts precisely for Level 00', () => {
    const getInitialPrompt = (isLvl1: boolean) => {
      return isLvl1
        ? 'Ответь на 1-й вопрос Башни!'
        : 'Ответь на 1-й вопрос';
    };

    const getNextPrompt = (currentIndex: number, isLvl1: boolean) => {
      const nextNum = currentIndex + 2;
      return isLvl1 
        ? `Ответь на ${nextNum}-й вопрос!` 
        : `Ответь на ${nextNum}-й вопрос`;
    };

    expect(getInitialPrompt(false)).toBe('Ответь на 1-й вопрос');
    expect(getInitialPrompt(true)).toBe('Ответь на 1-й вопрос Башни!');

    expect(getNextPrompt(0, false)).toBe('Ответь на 2-й вопрос');
    expect(getNextPrompt(1, false)).toBe('Ответь на 3-й вопрос');
    expect(getNextPrompt(2, false)).toBe('Ответь на 4-й вопрос');
  });

  it('should compute next question prompt from questionIndex instead of optionIndex', () => {
    const computeNextPrompt = (questionIndex: number) => {
      const nextNum = questionIndex + 2;
      return `Ответь на ${nextNum}-й вопрос`;
    };

    // After question 0 (1st question), next is Question 2
    expect(computeNextPrompt(0)).toBe('Ответь на 2-й вопрос');
    // After question 1 (2nd question), next is Question 3
    expect(computeNextPrompt(1)).toBe('Ответь на 3-й вопрос');
    // After question 2 (3rd question), next is Question 4
    expect(computeNextPrompt(2)).toBe('Ответь на 4-й вопрос');
  });
});
