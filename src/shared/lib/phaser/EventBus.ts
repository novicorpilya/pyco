import { Events } from 'phaser';

// DEFINE THE GLOBAL EVENT MAP
export type GameEventMap = {
  // UI -> Scene
  'sound-muted': boolean;
  'volume-change': number;
  'quiz-answer-selected': { questionIndex: number; isCorrect: boolean; isLast: boolean };
  'quiz-next-question': void;
  'show-question': { index?: number } | undefined;
  'hide-question': void;
  'pause-game': void;
  'resume-game': void;
  'restart-game': void;
  'open-welcome-modal': void;
  
  // Scene -> UI
  'show-game-over': void;
  'quest-finished': void;
  'take-damage': number;
  'gain-xp': number;
  'current-scene-ready': any; // The scene instance
};

type EventKey = keyof GameEventMap;

class TypedEventBus extends Events.EventEmitter {
  emit<K extends EventKey>(
    event: K, 
    ...args: undefined extends GameEventMap[K] ? [GameEventMap[K]?] : [GameEventMap[K]]
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends EventKey>(
    event: K, 
    fn: (args: GameEventMap[K]) => void, 
    context?: any
  ): this {
    return super.on(event, fn, context);
  }

  off<K extends EventKey>(
    event: K, 
    fn?: (args: GameEventMap[K]) => void, 
    context?: any, 
    once?: boolean
  ): this {
    return super.off(event, fn, context, once);
  }

  once<K extends EventKey>(
    event: K, 
    fn: (args: GameEventMap[K]) => void, 
    context?: any
  ): this {
    return super.once(event, fn, context);
  }
}

export const EventBus = new TypedEventBus();
