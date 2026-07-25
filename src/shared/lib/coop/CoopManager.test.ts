import { describe, it, expect } from 'vitest';
import { CoopManager } from './CoopManager';

describe('CoopManager', () => {
  it('should generate a valid room code', () => {
    const roomCode = CoopManager.generateRoomCode();
    expect(roomCode).toMatch(/^PYCO-\d{3,4}$/);
  });

  it('should evaluate team voting matrix correctly', () => {
    // Both Correct -> SUCCESS
    const bothRight = CoopManager.evaluateTeamVote(true, true);
    expect(bothRight.status).toBe('SUCCESS');
    expect(bothRight.xpBonusPercentage).toBe(100);
    expect(bothRight.hpDamage).toBe(0);

    // Split Vote -> SPLIT_VOTE
    const split = CoopManager.evaluateTeamVote(true, false);
    expect(split.status).toBe('SPLIT_VOTE');
    expect(split.xpBonusPercentage).toBe(0);
    expect(split.hpDamage).toBe(0);

    // Both Wrong -> DOUBLE_FAIL
    const bothWrong = CoopManager.evaluateTeamVote(false, false);
    expect(bothWrong.status).toBe('DOUBLE_FAIL');
    expect(bothWrong.penaltyXp).toBe(-40);
    expect(bothWrong.hpDamage).toBe(15);
  });
});
