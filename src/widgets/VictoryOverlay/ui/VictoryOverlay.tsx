import { useState } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import { FeedbackForm } from '../../FeedbackForm/ui/FeedbackForm';

export const VictoryOverlay = () => {
    const { isVictory, achievement, setVictory, backToMenu } = useGameStore();
    const [showFeedback, setShowFeedback] = useState(false);

    // Pre-generate particles outside the component render to avoid impure Math.random()
    const [particles] = useState(() => Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`
    })));

    if (!isVictory) return null;

    const handleBackToMenu = () => {
        backToMenu();
        setShowFeedback(false);
    };

    const handleRestart = () => {
        setVictory(false);
        setShowFeedback(false);
        EventBus.emit('restart-game');
    };

    return (
        <div className="absolute inset-0 z-[4000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-700 overflow-y-auto">
            
            {/* Success Particle Simulation (CSS based) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map((p, i) => (
                    <div 
                        key={i}
                        className="absolute w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                        style={{ 
                            left: p.left, 
                            top: p.top,
                            animationDelay: p.animationDelay,
                            opacity: 0.4
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative bg-slate-900 border-2 border-amber-500/50 rounded-[40px] shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-lg w-full p-10 text-center scale-up-center my-auto">
                {!showFeedback ? (
                    <>
                        {/* Achievement Badge */}
                        <div className="mb-8 relative group">
                            <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-1000 ${
                                achievement === 'Золотой шлем' ? 'bg-amber-500/20 group-hover:bg-amber-500/40' :
                                achievement === 'Серебряный меч' ? 'bg-slate-400/20 group-hover:bg-slate-400/40' :
                                'bg-orange-900/20 group-hover:bg-orange-800/40'
                            }`}></div>
                            <div className={`relative w-32 h-32 mx-auto rounded-full p-1 shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer ${
                                achievement === 'Золотой шлем' ? 'bg-gradient-to-b from-amber-300 to-amber-600' :
                                achievement === 'Серебряный меч' ? 'bg-gradient-to-b from-slate-300 to-slate-500' :
                                'bg-gradient-to-b from-orange-400 to-orange-800'
                            }`}>
                                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/10">
                                    <span className="text-6xl animate-pulse">
                                        {achievement === 'Золотой шлем' ? '👑' : 
                                         achievement === 'Серебряный меч' ? '⚔️' : 
                                         '🥉'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={`mt-4 inline-block px-4 py-1.5 rounded-full border ${
                                achievement === 'Золотой шлем' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' :
                                achievement === 'Серебряный меч' ? 'bg-slate-400/20 border-slate-400/30 text-slate-200' :
                                'bg-orange-500/20 border-orange-500/30 text-orange-400'
                            }`}>
                                <span className="text-sm font-black uppercase tracking-widest">Ачивка разблокирована</span>
                            </div>
                        </div>

                        <h2 className={`text-4xl font-black mb-2 bg-clip-text text-transparent uppercase tracking-tighter ${
                            achievement === 'Золотой шлем' ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500' :
                            achievement === 'Серебряный меч' ? 'bg-gradient-to-r from-slate-200 via-white to-slate-400' :
                            'bg-gradient-to-r from-orange-300 via-amber-600 to-orange-800'
                        }`}>
                            Победа!
                        </h2>
                        <h3 className="text-xl font-bold text-white/90 mb-4 uppercase">
                            Уровень 1 пройден
                        </h3>

                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Поздравляем! Ты успешно преодолел все препятствия и ответил на вопросы Магистра. Твои знания теперь подкреплены заслуженной наградой: <br/>
                            <span className={`font-bold block mt-2 text-lg ${
                                achievement === 'Золотой шлем' ? 'text-amber-400' :
                                achievement === 'Серебряный меч' ? 'text-slate-300' :
                                'text-orange-400'
                            }`}>"{achievement}"</span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => setShowFeedback(true)}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.4)] active:scale-95 uppercase tracking-widest"
                            >
                                Поделиться отзывом ✨
                            </button>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleRestart}
                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-white/10 active:scale-95 uppercase tracking-widest text-sm"
                                >
                                    Заново
                                </button>
                                <button 
                                    onClick={handleBackToMenu}
                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-white/10 active:scale-95 uppercase tracking-widest text-sm"
                                >
                                    Меню
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <FeedbackForm onSubmit={() => setShowFeedback(false)} />
                )}

                {/* Decorative particles for edges */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-amber-500/10 blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-amber-500/10 blur-3xl rounded-full"></div>
            </div>
            
            <style>{`
                .scale-up-center {
                    animation: scale-up-center 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
                }
                @keyframes scale-up-center {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
