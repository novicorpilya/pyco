import { create } from 'zustand';

interface GameState {
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
  
  // Actions
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
  backToMenu: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  hp: 100,
  maxHp: 100,
  xp: 0,
  level: 1,
  potions: 0,
  isMuted: false,
  volume: 0.5,
  isStarted: false,
  hasEntered: false,
  isLoading: false,
  isFullscreen: false,
  error: null,
  isPaused: false,
  hasSeenManual: false,
  isVictory: false,
  achievement: null,

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
  startGame: () => set({ isStarted: true }),
  enterSystem: () => set({ hasEntered: true }),
  setLoading: (isLoading) => set({ isLoading }),
  setPaused: (isPaused) => set({ isPaused }),
  setSeenManual: (hasSeenManual) => set({ hasSeenManual }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setVictory: (isVictory) => set({ isVictory }),
  setAchievement: (achievement) => set({ achievement }),
  setError: (error) => set({ error }),
  
  backToMenu: () => set({
    isStarted: false,
    isVictory: false,
    isPaused: false,
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
    error: null
  }),
}));
