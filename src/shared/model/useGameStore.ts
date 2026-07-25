import { create } from 'zustand';

export type SkinType = 'default' | 'bronze_armor' | 'cyan_aura' | 'gold_cloak';

export interface LeaderboardEntry {
  playerName: string;
  levelId: number;
  completionTimeSeconds: number;
  coinsCollected: number;
  xp: number;
  score: number;
  date: string;
}

interface GameState {
  playerName: string;
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  potions: number;
  isMuted: boolean;
  volume: number;
  isStarted: boolean;
  hasEntered: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  error: '404' | '500' | null;
  isPaused: boolean;
  hasSeenManual: boolean;
  isVictory: boolean;
  achievement: string | null;
  selectedLevelId: number;
  isLevelSelectOpen: boolean;
  leaderboard: LeaderboardEntry[];
  coinsCollected: number;
  completionTimeSeconds: number;
  completedLevelIds: number[];
  equippedSkin: SkinType;
  
  // Actions
  setPlayerName: (name: string) => void;
  addLeaderboardEntry: (entry: LeaderboardEntry) => void;
  completeLevel: (levelId: number) => void;
  setEquippedSkin: (skin: SkinType) => void;
  setCoinsCollected: (count: number) => void;
  setCompletionTimeSeconds: (time: number) => void;
  damage: (amount: number) => void;
  heal: (amount: number) => void;
  addXp: (amount: number) => void;
  addPotion: () => void;
  usePotion: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  startGame: () => void;
  enterSystem: () => void;
  setLoading: (loading: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSeenManual: (seen: boolean) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setVictory: (victory: boolean) => void;
  setAchievement: (achievement: string | null) => void;
  setError: (error: '404' | '500' | null) => void;
  openLevelSelect: () => void;
  closeLevelSelect: () => void;
  setSelectedLevelId: (id: number) => void;
  startSelectedLevel: (id: number) => void;
  restartCurrentLevel: () => void;
  backToMenu: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerName: typeof window !== 'undefined' ? localStorage.getItem('pyco_player_name') || 'Питонист_42' : 'Питонист_42',
  hp: 100,
  maxHp: 100,
  xp: 0,
  level: 1,
  potions: 0,
  isMuted: false,
  volume: 0.5,
  isStarted: false,
  hasEntered: true,
  isLoading: false,
  isFullscreen: false,
  error: null,
  isPaused: false,
  hasSeenManual: false,
  isVictory: false,
  achievement: null,
  selectedLevelId: 0,
  isLevelSelectOpen: false,
  leaderboard: [],
  coinsCollected: 0,
  completionTimeSeconds: 0,
  completedLevelIds: typeof window !== 'undefined' 
    ? (() => {
        try { return JSON.parse(localStorage.getItem('pyco_completed_levels') || '[]'); } 
        catch { return []; }
      })()
    : [],
  equippedSkin: (typeof window !== 'undefined' 
    ? (localStorage.getItem('pyco_equipped_skin') as SkinType) || 'default' 
    : 'default'),

  setPlayerName: (playerName) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pyco_player_name', playerName);
    }
    set({ playerName });
  },

  setEquippedSkin: (equippedSkin) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pyco_equipped_skin', equippedSkin);
    }
    set({ equippedSkin });
  },

  completeLevel: (levelId: number) => set((state) => {
    if (state.completedLevelIds.includes(levelId)) return state;
    const newCompleted = [...state.completedLevelIds, levelId];
    if (typeof window !== 'undefined') {
      localStorage.setItem('pyco_completed_levels', JSON.stringify(newCompleted));
    }
    return { completedLevelIds: newCompleted };
  }),

  addLeaderboardEntry: (entry) => set((state) => {
    const newCompleted = state.completedLevelIds.includes(entry.levelId) 
      ? state.completedLevelIds 
      : [...state.completedLevelIds, entry.levelId];
    if (typeof window !== 'undefined') {
      localStorage.setItem('pyco_completed_levels', JSON.stringify(newCompleted));
    }
    return {
      leaderboard: [...state.leaderboard, entry].sort((a, b) => b.score - a.score),
      completedLevelIds: newCompleted
    };
  }),

  setCoinsCollected: (coinsCollected) => set({ coinsCollected }),
  setCompletionTimeSeconds: (completionTimeSeconds) => set({ completionTimeSeconds }),

  damage: (amount) => set((state) => ({ 
    hp: Math.max(0, state.hp - amount) 
  })),
  
  heal: (amount) => set((state) => ({ 
    hp: Math.min(state.maxHp, state.hp + amount) 
  })),

  addPotion: () => set((state) => ({ 
    potions: state.potions + 1 
  })),

  usePotion: () => set((state) => {
    if (state.potions > 0) {
      return { 
        hp: state.maxHp, 
        potions: state.potions - 1 
      };
    }
    return state;
  }),

  addXp: (amount) => set((state) => {
    let newXp = state.xp + amount;
    let newLevel = state.level;

    // Handle Level Up
    if (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
    } 
    // Handle Level Down (Penalty across levels)
    else if (newXp < 0) {
      if (newLevel > 1) {
        newLevel -= 1;
        newXp = 100 + newXp; // e.g., 0 - 10 = 90 at previous level
      } else {
        newXp = 0; // Absolute floor at Level 1, 0 XP
      }
    }

    return { xp: newXp, level: newLevel };
  }),

  setMuted: (isMuted) => set({ isMuted }),
  setVolume: (volume) => set({ volume }),
  startGame: () => set({ isStarted: true, isLevelSelectOpen: false }),
  enterSystem: () => set({ hasEntered: true }),
  setLoading: (isLoading) => set({ isLoading }),
  setPaused: (isPaused) => set({ isPaused }),
  setSeenManual: (hasSeenManual) => set({ hasSeenManual }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setVictory: (isVictory) => set({ isVictory }),
  setAchievement: (achievement) => set({ achievement }),
  setError: (error) => set({ error }),
  openLevelSelect: () => set({ isLevelSelectOpen: true }),
  closeLevelSelect: () => set({ isLevelSelectOpen: false }),
  setSelectedLevelId: (selectedLevelId) => set({ selectedLevelId }),
  startSelectedLevel: (id) => set({ selectedLevelId: id, isStarted: true, isPaused: false, isLoading: false, isLevelSelectOpen: false }),
  restartCurrentLevel: () => set((state) => ({
    hp: 100,
    xp: 0,
    level: state.selectedLevelId === 1 ? 1 : 1,
    potions: 0,
    isStarted: true,
    isPaused: false,
    isLoading: false,
    isVictory: false,
    achievement: null
  })),
  
  backToMenu: () => set({
    isStarted: false,
    isLevelSelectOpen: false,
    isVictory: false,
    isPaused: false,
    isLoading: false,
    achievement: null,
    hp: 100,
    xp: 0,
    level: 1,
    potions: 0
  }),

  reset: () => set({ 
    hp: 100, 
    xp: 0, 
    level: 1,
    isStarted: false,
    hasEntered: false,
    isLoading: false,
    isPaused: false,
    hasSeenManual: false,
    isVictory: false,
    achievement: null,
    error: null,
    selectedLevelId: 0,
    isLevelSelectOpen: false
  }),
}));
