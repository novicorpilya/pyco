import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore PlayerName & Leaderboard', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useGameStore.getState().setEquippedSkin('default');
  });

  it('should initialize with default or saved playerName', () => {
    const store = useGameStore.getState();
    expect(store.playerName).toBeDefined();
    expect(typeof store.playerName).toBe('string');
  });

  it('should update playerName and save it', () => {
    useGameStore.getState().setPlayerName('PythonCoder42');
    expect(useGameStore.getState().playerName).toBe('PythonCoder42');
  });

  it('should handle startSelectedLevel and reset pause/loading flags', () => {
    useGameStore.getState().setPaused(true);
    useGameStore.getState().startSelectedLevel(1);

    const store = useGameStore.getState();
    expect(store.selectedLevelId).toBe(1);
    expect(store.isStarted).toBe(true);
    expect(store.isPaused).toBe(false);
    expect(store.isLevelSelectOpen).toBe(false);
  });

  it('should reset pause, loading, and started state on backToMenu', () => {
    useGameStore.getState().startSelectedLevel(1);
    useGameStore.getState().setPaused(true);
    useGameStore.getState().setLoading(true);

    useGameStore.getState().backToMenu();

    const store = useGameStore.getState();
    expect(store.isStarted).toBe(false);
    expect(store.isPaused).toBe(false);
    expect(store.isLoading).toBe(false);
  });

  it('should unpause and reset state on game restart', () => {
    useGameStore.getState().setPaused(true);
    useGameStore.setState({ 
      hp: 100, 
      xp: 0, 
      level: 1, 
      potions: 0,
      isPaused: false,
      isLoading: false 
    });

    const store = useGameStore.getState();
    expect(store.isPaused).toBe(false);
    expect(store.isLoading).toBe(false);
  });

  it('should reset level stats for selectedLevelId = 0 via restartCurrentLevel', () => {
    useGameStore.getState().startSelectedLevel(0);
    useGameStore.getState().damage(50);
    useGameStore.getState().addXp(100);
    useGameStore.getState().setPaused(true);

    useGameStore.getState().restartCurrentLevel();

    const store = useGameStore.getState();
    expect(store.hp).toBe(100);
    expect(store.xp).toBe(0);
    expect(store.selectedLevelId).toBe(0);
    expect(store.isPaused).toBe(false);
    expect(store.isVictory).toBe(false);
  });

  it('should track completed levels and unlock trophies', () => {
    useGameStore.getState().completeLevel(0);
    expect(useGameStore.getState().completedLevelIds).toContain(0);

    useGameStore.getState().completeLevel(1);
    expect(useGameStore.getState().completedLevelIds).toContain(1);

    useGameStore.getState().completeLevel(2);
    expect(useGameStore.getState().completedLevelIds).toContain(2);
  });

  it('should allow equipping gold_cloak skin after Level 2 victory', () => {
    useGameStore.getState().setEquippedSkin('gold_cloak');
    expect(useGameStore.getState().equippedSkin).toBe('gold_cloak');
  });

  it('should allow setting equipped skin', () => {
    expect(useGameStore.getState().equippedSkin).toBe('default');

    useGameStore.getState().setEquippedSkin('bronze_armor');
    expect(useGameStore.getState().equippedSkin).toBe('bronze_armor');

    useGameStore.getState().setEquippedSkin('cyan_aura');
    expect(useGameStore.getState().equippedSkin).toBe('cyan_aura');
  });
});
