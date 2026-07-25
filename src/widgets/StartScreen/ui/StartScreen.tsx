import { useEffect, useRef } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';

export const StartScreen = () => {
  const openLevelSelect = useGameStore((state) => state.openLevelSelect);
  const isMuted = useGameStore((state) => state.isMuted);
  const setMuted = useGameStore((state) => state.setMuted);
  const isFullscreen = useGameStore((state) => state.isFullscreen);
  const volume = useGameStore((state) => state.volume);
  const setVolume = useGameStore((state) => state.setVolume);
  const playerName = useGameStore((state) => state.playerName);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add custom styles for the "dance", "glow", "float" and "shimmer" animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes character-dance {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-15px) rotate(-5deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-15px) rotate(5deg); }
      }
      @keyframes button-glow {
        0%, 100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); border-color: rgba(255, 255, 255, 0.2); }
        50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.8); border-color: rgba(255, 255, 255, 0.5); }
      }
      @keyframes splash-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      @keyframes splash-shimmer {
        0% { transform: translateX(-150%) skewX(-25deg); }
        20%, 100% { transform: translateX(250%) skewX(-25deg); }
      }
      .animate-dance {
        animation: character-dance 1s infinite ease-in-out;
        will-change: transform;
      }
      .animate-glow {
        animation: button-glow 2s infinite ease-in-out;
        will-change: box-shadow;
      }
      .animate-splash-float {
        animation: splash-float 6s infinite ease-in-out;
        will-change: transform;
      }
      .animate-shimmer {
        animation: splash-shimmer 8s infinite ease-in-out;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 1. Sync volume separately to avoid resetting the audio playback on every slider move
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 2. Manage playback state (play/pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;

    const playAudio = () => {
      if (audio && !isMuted) {
        audio.play().catch(() => { /* Autoplay block */ });
      }
    };

    playAudio();

    const handleFirstInteraction = () => {
      playAudio();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    if (isMuted) {
      audio.pause();
    }
    
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      if (audio) {
        audio.pause();
      }
    };
  }, [isMuted]);

  const handleStart = () => {
    openLevelSelect();
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-fade-in text-center transition-all duration-700 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* Start Soundtrack */}
      <audio ref={audioRef} src="/Golden_Coins_Ignite.mp3" />

      <div className={`relative w-full group animate-splash-float transition-all duration-700 ${isFullscreen ? 'max-w-none h-screen' : 'max-w-4xl'}`}>
        {/* Ambient Glow behind image */}
        {!isFullscreen && (
          <div className="absolute -inset-4 bg-indigo-500/20 rounded-3xl blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        )}
        
        {/* The Splash Image */}
        <div className={`relative bg-slate-900 overflow-hidden border transition-all duration-700 shadow-2xl ${isFullscreen ? 'h-full border-none rounded-none' : 'rounded-[32px] border-white/10 hover:scale-[1.02]'}`}>
          <img 
            src="/assets/Pyco.png" 
            alt="PyCo - КОД. ПРЫЖОК. ПОБЕДА."
            className={`w-full cursor-default transition-all duration-700 ${isFullscreen ? 'h-full object-cover' : 'h-auto object-contain'}`}
          />
          
          {/* Shimmer Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>
          
          {/* Overlay Gradient for consistent feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          
          {/* Top-Left: Fullscreen Button (over image) */}
          <button 
            onClick={() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
            }}
            className="absolute top-6 left-6 z-[120] w-12 h-12 flex items-center justify-center bg-black/60 border border-white/20 rounded-2xl backdrop-blur-md hover:bg-black/80 transition-all duration-300 shadow-xl group/btn animate-glow"
            title="Войти в полноэкранный режим"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover/btn:scale-110 transition-transform">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
            </svg>
            <div className="absolute -inset-1 bg-white/10 rounded-2xl blur opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
          </button>

          {/* Top-Center/Left: Player Nickname Badge */}
          <div className="absolute top-6 left-24 z-[120]">
            <button
              onClick={() => EventBus.emit('open-welcome-modal')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-black/60 hover:bg-black/80 border border-sky-400/40 hover:border-sky-400 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl group/nick"
              title="Сменить никнейм"
            >
              <span className="text-xl">👤</span>
              <span className="text-sm font-bold text-sky-200 group-hover/nick:text-white transition-colors">
                {playerName || 'Ввести Ник'}
              </span>
              <span className="text-xs text-sky-400/80 group-hover/nick:translate-x-0.5 transition-transform">✏️</span>
            </button>
          </div>

          {/* Top-Right: Volume & Mute Controls (over image) */}
          <div className="absolute top-6 right-6 z-[120] flex items-start gap-3">
            {/* Volume Slider - appears below on hover */}
            <div className="w-12 h-12 hover:h-[180px] flex flex-col items-center gap-0 hover:gap-3 bg-black/60 border border-white/20 rounded-2xl backdrop-blur-md shadow-xl group/volume transition-all duration-500 overflow-hidden shrink-0">
              <button 
                onClick={() => {
                    const nextMute = !isMuted;
                    setMuted(nextMute);
                    EventBus.emit('sound-muted', nextMute);
                }}
                className="w-12 h-12 flex items-center justify-center group/btn shrink-0 order-first"
                title={isMuted ? "Включить звук" : "Выключить звук"}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 group-hover/btn:scale-110 transition-transform">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover/btn:scale-110 transition-transform">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                )}
              </button>
              <div className="h-0 opacity-0 group-hover/volume:h-24 group-hover/volume:opacity-100 transition-all duration-500 flex items-center justify-center overflow-hidden pb-3">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setVolume(vol);
                    EventBus.emit('volume-change', vol);
                  }}
                  className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all -rotate-90 origin-center"
                  style={{ width: '80px' }}
                />
              </div>
            </div>
          </div>

          {/* Dancing Character (Spritesheet extraction) */}
          <div className="absolute bottom-32 right-12 z-[110] pointer-events-none select-none animate-dance">
            <div 
              style={{
                backgroundImage: 'url(/Spritesheets/spritesheet-characters-default.png)',
                backgroundPosition: '-645px 0px', // character_beige_idle
                width: '128px',
                height: '128px',
                transform: 'scale(1.5)'
              }}
              className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
            {/* Music Notes Animation */}
            {!isMuted && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
                <span className="text-2xl animate-bounce delay-75">♪</span>
                <span className="text-xl animate-bounce delay-150">♫</span>
                <span className="text-2xl animate-bounce delay-300">♩</span>
              </div>
            )}
          </div>

          {/* CTA Button Overlay */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full px-8">
            <button
              onClick={handleStart}
              className="group relative px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xl tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1 active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span>НАЧАТЬ ПУТЬ</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
