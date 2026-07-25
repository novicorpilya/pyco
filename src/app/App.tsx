import { useEffect } from 'react';
import { GameContainer } from '../widgets/GameContainer/ui/GameContainer';
import { QuestionOverlay } from '../widgets/QuestionOverlay/ui/QuestionOverlay';
import { GameOverOverlay } from '../widgets/GameOverOverlay/ui/GameOverOverlay';
import { StartScreen } from '../widgets/StartScreen/ui/StartScreen';
import { EntryScreen } from '../widgets/EntryScreen/ui/EntryScreen';
import { LoadingScreen } from '../widgets/LoadingScreen/ui/LoadingScreen';
import { PauseMenu } from '../widgets/PauseMenu/ui/PauseMenu';
import { InstructionPopup } from '../widgets/InstructionPopup/ui/InstructionPopup';
import { VictoryOverlay } from '../widgets/VictoryOverlay/ui/VictoryOverlay';
import { LevelSelectModal } from '../widgets/LevelSelectModal/ui/LevelSelectModal';
import { WelcomeModal } from '../widgets/WelcomeModal';
import { ErrorScreen } from '../widgets/ErrorScreen/ui/ErrorScreen';
import { useGameStore } from '../shared/model/useGameStore';
import { useState } from 'react';
import { EventBus } from '../shared/lib/phaser/EventBus';
import './App.css';

function App() {
  const isStarted = useGameStore((state) => state.isStarted);
  const hasEntered = useGameStore((state) => state.hasEntered);
  const isMuted = useGameStore((state) => state.isMuted);
  const setMuted = useGameStore((state) => state.setMuted);
  const isLoading = useGameStore((state) => state.isLoading);
  const error = useGameStore((state) => state.error);
  const setPaused = useGameStore((state) => state.setPaused);
  const hasSeenManual = useGameStore((state) => state.hasSeenManual);
  const isFullscreen = useGameStore((state) => state.isFullscreen);
  const setFullscreen = useGameStore((state) => state.setFullscreen);
  const volume = useGameStore((state) => state.volume);
  const setVolume = useGameStore((state) => state.setVolume);

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    return typeof window !== 'undefined' && (!localStorage.getItem('pyco_player_name'));
  });

  // Listen for manual nickname change requests
  useEffect(() => {
    const handleOpenWelcome = () => {
      setIsWelcomeModalOpen(true);
    };
    EventBus.on('open-welcome-modal', handleOpenWelcome);
    return () => {
      EventBus.off('open-welcome-modal', handleOpenWelcome);
    };
  }, []);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Initial sync
    setFullscreen(!!document.fullscreenElement);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setMuted(nextMute);
    EventBus.emit('sound-muted', nextMute);
  };

  // Listen for game ready state
  useEffect(() => {
    const handleReady = () => {
      useGameStore.getState().setLoading(false);
    };
    EventBus.on('current-scene-ready', handleReady);
    return () => { EventBus.off('current-scene-ready', handleReady); };
  }, []);

  // Auto-pause for instructions at start
  useEffect(() => {
    if (isStarted && !isLoading && !hasSeenManual) {
      setPaused(true);
      EventBus.emit('pause-game');
    }
  }, [isStarted, isLoading, hasSeenManual, setPaused]);

  return (
    <div className={`min-h-screen w-screen bg-slate-950 bg-[radial-gradient(circle_at_center,rgba(30,41,59,1)_0%,rgba(2,6,23,1)_100%)] text-white flex flex-col items-center justify-center font-sans selection:bg-indigo-500/30 overflow-hidden relative ${isFullscreen ? 'p-0' : 'p-4'}`}>
      
      {/* HUD: Fullscreen & Mute Buttons (Fixed at Corners) - Visible during gameplay */}
      {/* Note: HUD buttons are now inside the game frame div below */}

      {!hasEntered && <EntryScreen />}
      {hasEntered && !isStarted && <StartScreen />}


      {/* Main Content Area */}
      <main className={`flex flex-col items-center justify-center z-10 w-full animate-fade-in ${isFullscreen ? 'h-screen' : 'max-w-5xl py-8 px-4'}`}>
        
        {/* Game Frame with Integrated Glow */}
        <div className={`relative group bg-gradient-to-tr from-white/10 to-white/5 shadow-2xl transition-all duration-500 ${isFullscreen ? 'w-full h-full p-0 rounded-none' : 'p-1 rounded-[24px]'}`}>
          
          {/* Ambient Outer Glow (Only when windowed) */}
          {!isFullscreen && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          )}
          
          {/* Actual Game Window */}
          <div className={`relative bg-black overflow-hidden border border-white/10 flex items-center justify-center transition-all duration-500 ${isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-[1024px] h-[576px] rounded-[20px]'}`}>
            <GameContainer />

            {/* In-Game HUD Buttons (Visible only when started) */}
            {isStarted && (
              <div className="absolute top-4 right-4 z-50 flex items-start gap-2">
                {/* Fullscreen Button */}
                <button 
                  onClick={toggleFullscreen}
                  className="w-11 h-11 flex items-center justify-center bg-black/40 border border-white/10 rounded-xl backdrop-blur-md hover:bg-black/60 transition-all duration-300 shadow-lg group shrink-0"
                  title={isFullscreen ? "Выйти из полноэкранного режима" : "Войти в полноэкранный режим"}
                >
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300 group-hover:scale-110 transition-transform">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300 group-hover:scale-110 transition-transform">
                      <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
                    </svg>
                  )}
                </button>

                {/* Volume & Mute Controls */}
                <div className="w-11 h-11 hover:h-[144px] flex flex-col items-center gap-0 hover:gap-2 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md shadow-lg group/volume transition-all duration-500 overflow-hidden shrink-0">
                  <button 
                    onClick={toggleMute}
                    className="w-11 h-11 flex items-center justify-center group/btn shrink-0 order-first"
                    title={isMuted ? "Включить звук" : "Выключить звук"}
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 group-hover:scale-110 transition-transform">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300 group-hover:scale-110 transition-transform">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      </svg>
                    )}
                  </button>
                  <div className="h-0 opacity-0 group-hover/volume:h-20 group-hover/volume:opacity-100 transition-all duration-500 flex items-center justify-center overflow-hidden pb-2.5">
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
                      className="w-16 h-1 bg-indigo-500/30 rounded-lg appearance-none cursor-pointer accent-indigo-400 hover:accent-indigo-300 transition-all -rotate-90 origin-center"
                      style={{ width: '60px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <QuestionOverlay />
      <GameOverOverlay />
      <PauseMenu />
      {isStarted && !isLoading && !hasSeenManual && <InstructionPopup />}
      <VictoryOverlay />
      <LevelSelectModal />
      {isWelcomeModalOpen && <WelcomeModal onClose={() => setIsWelcomeModalOpen(false)} />}

      {/* High Priority Overlays */}
      {isLoading && <LoadingScreen />}
      {error && <ErrorScreen type={error as '404' | '500'} />}
    </div>
  );
}

export default App;
