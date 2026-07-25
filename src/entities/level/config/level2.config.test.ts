import { describe, it, expect } from 'vitest';
import { LEVEL2_CONFIG } from './level2.config';

describe('Level 2 Config Specification', () => {
    it('should have correct metadata for Level 2 Amber Canyons of Conditions', () => {
        expect(LEVEL2_CONFIG.id).toBe('level_2');
        expect(LEVEL2_CONFIG.title).toBe('Янтарные Каньоны Условий');
        expect(LEVEL2_CONFIG.questions.length).toBeGreaterThanOrEqual(4);
    });

    it('should contain condition logic questions (if, else, elif, ==, !=, and/or)', () => {
        const questionTexts = LEVEL2_CONFIG.questions.map(q => q.codeSnippet + ' ' + q.questionText);
        const hasIfElse = questionTexts.some(text => text.includes('if') || text.includes('else'));
        const hasComparison = questionTexts.some(text => text.includes('==') || text.includes('!='));
        
        expect(hasIfElse).toBe(true);
        expect(hasComparison).toBe(true);
    });

    it('should have canyon guardian dialogues', () => {
        expect(LEVEL2_CONFIG.dialogues.greeting).toContain('Страж');
        expect(LEVEL2_CONFIG.dialogues.success).toBeDefined();
    });
});
