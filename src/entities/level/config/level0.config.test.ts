import { describe, it, expect } from 'vitest';
import { LEVEL0_CONFIG } from './level0.config';

describe('Level 0 Configuration & Quiz Tests (TDD RED/GREEN)', () => {
  it('should have correct level 0 metadata', () => {
    expect(LEVEL0_CONFIG).toBeDefined();
    expect(LEVEL0_CONFIG.id).toBe('level_0');
    expect(LEVEL0_CONFIG.title).toBe('Старт & Обучение');
  });

  it('should contain basic Python questions (print, comments, strings)', () => {
    expect(LEVEL0_CONFIG.questions).toBeDefined();
    expect(LEVEL0_CONFIG.questions.length).toBeGreaterThanOrEqual(3);

    const q1 = LEVEL0_CONFIG.questions[0];
    expect(q1.text).toContain('для вывода текста');
    expect(q1.options[q1.correctIndex]).toBe('print()');

    const q2 = LEVEL0_CONFIG.questions[1];
    expect(q2.text).toContain('однострочного комментария');
    expect(q2.options[q2.correctIndex]).toBe('#');

    const q3 = LEVEL0_CONFIG.questions[2];
    expect(q3.text).toContain('print("Hello, PYCO!")');
    expect(q3.options[q3.correctIndex]).toBe('Hello, PYCO!');
  });
});
