import { describe, it, expect } from 'vitest';
import { LEVEL1_CONFIG } from './level1.config';

describe('Level 1 Configuration & Quiz Tests (TDD RED/GREEN)', () => {
  it('should have correct level 1 metadata', () => {
    expect(LEVEL1_CONFIG).toBeDefined();
    expect(LEVEL1_CONFIG.id).toBe('level_1');
    expect(LEVEL1_CONFIG.title).toBe('Башня Переменных');
    expect(LEVEL1_CONFIG.topic).toContain('Переменные');
  });

  it('should contain advanced Python quiz questions about variables, multiplication, and types', () => {
    expect(LEVEL1_CONFIG.questions).toBeDefined();
    expect(LEVEL1_CONFIG.questions.length).toBeGreaterThanOrEqual(3);

    const q1 = LEVEL1_CONFIG.questions[0];
    expect(q1.text).toContain('a = "10"');
    expect(q1.options[q1.correctIndex]).toBe('1010');

    const q2 = LEVEL1_CONFIG.questions[1];
    expect(q2.text).toContain('x += 3');
    expect(q2.options[q2.correctIndex]).toBe('8');

    const q3 = LEVEL1_CONFIG.questions[2];
    expect(q3.text).toContain('type(3.14 == 3)');
    expect(q3.options[q3.correctIndex]).toBe('bool');
  });

  it('should define unique boss dialogues for Level 1 Syntax Master', () => {
    expect(LEVEL1_CONFIG.npcName).toBe('Магистр Синтаксиса');
    expect(LEVEL1_CONFIG.dialogues.greeting).toContain('повелеваешь ли ты');
    expect(LEVEL1_CONFIG.dialogues.success).toContain('Адепт Переменных');
    expect(LEVEL1_CONFIG.rewardXp).toBeGreaterThanOrEqual(150);
  });
});
