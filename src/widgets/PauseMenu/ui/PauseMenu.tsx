import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';

export const PauseMenu = () => {
    const { isPaused, setPaused, backToMenu } = useGameStore();

    if (!isPaused) return null;

    const handleResume = () => {
        setPaused(false);
        EventBus.emit('resume-game');
    };

    const handleRestart = () => {
        // Reset only gameplay stats
        useGameStore.setState({ 
            hp: 100, 
            xp: 0, 
            level: 1, 
            potions: 0,
            isPaused: false 
        });
        EventBus.emit('restart-game');
    };

    const handleExit = () => {
        backToMenu();
    };

    return (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-indigo-500/50 p-10 rounded-3xl shadow-2xl shadow-indigo-500/20 max-w-sm w-full flex flex-col gap-6 text-center">
                <h2 className="text-4xl font-black text-white tracking-widest uppercase italic">Пауза</h2>
                
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={handleResume}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 group overflow-hidden relative"
                    >
                        <span className="relative z-10">ПРОДОЛЖИТЬ</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>

                    <button 
                        onClick={handleRestart}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-2xl transition-all border border-slate-700 active:scale-95"
                    >
                        НАЧАТЬ ЗАНОВО
                    </button>

                    <button 
                        onClick={handleExit}
                        className="w-full py-4 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 font-bold rounded-2xl transition-all border border-red-500/30 active:scale-95"
                    >
                        В ГЛАВНОЕ МЕНЮ
                    </button>
                </div>

                <p className="text-slate-500 text-sm mt-4 uppercase tracking-[0.2em]">Нажмите ESC чтобы вернуться</p>
            </div>
        </div>
    );
};
