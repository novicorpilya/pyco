import { useEffect, useState } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';

export const GameOverOverlay = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showGameOver = () => setIsVisible(true);
        EventBus.on('show-game-over', showGameOver);
        return () => {
            EventBus.off('show-game-over', showGameOver);
        };
    }, []);

    const handleRestart = () => {
        useGameStore.setState({ 
            hp: 100, 
            xp: 0, 
            level: 1, 
            potions: 0,
            isStarted: true, 
            isPaused: false 
        });
        setIsVisible(false);
        EventBus.emit('restart-game'); 
    };

    const handleExit = () => {
        const store = useGameStore.getState();
        store.backToMenu();
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-1000">
            {/* Multi-layered Magical Aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.05)_0%,transparent_50%)] pointer-events-none"></div>
            
            <div className="relative flex flex-col items-center justify-center max-w-lg mx-auto p-8 text-center animate-in zoom-in-95 duration-700 delay-200">
                
                {/* Magic Lightbulb Container */}
                <div className="mb-12 relative group">
                    <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                    <div className="relative w-32 h-32 rounded-full bg-slate-900/50 flex items-center justify-center border border-amber-400/30 shadow-[0_0_60px_-15px_rgba(251,191,36,0.4)]">
                        <span className="text-6xl drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce-slow">💡</span>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-60"></div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-6 mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-white uppercase sm:text-6xl">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400">ЗНАНИЯ</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600">УСКОЛЬЗНУЛИ</span>
                    </h1>
                    
                    <p className="max-w-xs mx-auto text-slate-300 text-lg font-medium leading-relaxed opacity-90">
                        Ой! Похоже, частичка знаний о циклах спряталась в лесной чаще. 
                        Попробуем собрать её снова?
                    </p>
                </div>

                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center scale-90 sm:scale-100">
                    {/* Rebirth Button */}
                    <button
                        onClick={handleRestart}
                        className="group relative px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_15px_40px_-15px_rgba(245,158,11,0.6)] flex items-center gap-4 border-b-4 border-amber-700 hover:border-amber-600 whitespace-nowrap min-w-[280px] justify-center"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-950/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z" />
                            </svg>
                        </div>
                        <span>ПОПРОБОВАТЬ СНОВА</span>
                    </button>

                    {/* Exit Button */}
                    <button
                        onClick={handleExit}
                        className="group relative px-10 py-5 bg-slate-900/60 hover:bg-slate-800/80 text-amber-200 hover:text-amber-100 font-bold text-lg rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 border border-amber-400/30 hover:border-amber-400/60 backdrop-blur-md shadow-xl flex items-center gap-4 whitespace-nowrap min-w-[280px] justify-center"
                    >
                        <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                            </svg>
                        </div>
                        <span>В ГЛАВНОЕ МЕНЮ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
