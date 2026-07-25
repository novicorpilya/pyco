import { useState, useEffect } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import { FeedbackForm } from '../../FeedbackForm/ui/FeedbackForm';
import { LeaderboardModal } from '../../LeaderboardModal/ui/LeaderboardModal';
import { SkinSelectModal } from '../../SkinSelectModal';

export const VictoryOverlay = () => {
    const { 
        isVictory, 
        setVictory, 
        backToMenu, 
        playerName, 
        selectedLevelId, 
        startSelectedLevel,
        addLeaderboardEntry,
        coinsCollected,
        completionTimeSeconds,
        xp
    } = useGameStore();

    const [showFeedback, setShowFeedback] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showSkinModal, setShowSkinModal] = useState(false);

    // Record victory score into leaderboard once per victory
    useEffect(() => {
        if (isVictory) {
            const today = new Date().toLocaleDateString('ru-RU');
            const calculatedScore = xp + (coinsCollected * 10) + Math.max(0, 300 - completionTimeSeconds);
            
            addLeaderboardEntry({
                playerName: playerName || 'Пилот_PYCO',
                levelId: selectedLevelId,
                completionTimeSeconds: completionTimeSeconds || 45,
                coinsCollected: coinsCollected || 8,
                xp: xp || 150,
                score: calculatedScore || 500,
                date: today
            });
        }
    }, [isVictory]);

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

    const handleNextLevel = () => {
        setVictory(false);
        setShowFeedback(false);
        const nextId = selectedLevelId === 0 ? 1 : 0;
        startSelectedLevel(nextId);
        EventBus.emit('restart-game');
    };

    const handleRestart = () => {
        useGameStore.getState().restartCurrentLevel();
        setShowFeedback(false);
        EventBus.emit('restart-game');
    };

    return (
        <div className="absolute inset-0 z-[4000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-700 overflow-y-auto">
            
            {/* Success Particle Simulation */}
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

            <div className="relative bg-slate-900 border-2 border-amber-500/50 rounded-[40px] shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-lg w-full p-8 text-center scale-up-center my-auto">
                {!showFeedback ? (
                    <>
                        {/* Achievement Badge */}
                        <div className="mb-6 relative group">
                            <div className="relative w-28 h-28 mx-auto rounded-full p-1 shadow-2xl flex items-center justify-center bg-gradient-to-b from-amber-300 to-amber-600">
                                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/10">
                                    <span className="text-5xl animate-bounce">
                                        {selectedLevelId === 0 ? '🥉' : '👑'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-3 inline-block px-4 py-1 rounded-full border bg-amber-500/20 border-amber-500/30 text-amber-300">
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {selectedLevelId === 0 ? 'Новый Скин: 🥉 Бронзовая Броня' : 'Новый Скин: 👑 Неоновая Аура'}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black mb-1 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent uppercase tracking-tight">
                            Победа, {playerName || 'Пилот'}!
                        </h2>
                        <h3 className="text-md font-bold text-slate-300 mb-4 uppercase">
                            Уровень {selectedLevelId} пройден
                        </h3>

                        {/* Level Stats Summary Box */}
                        <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 text-center">
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase block">Время</span>
                                <span className="text-sm font-black text-amber-300">⏱️ {Math.floor((completionTimeSeconds || 45) / 60)}m {(completionTimeSeconds || 45) % 60}s</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase block">Монеты</span>
                                <span className="text-sm font-black text-amber-400">🪙 {coinsCollected || 8} шт</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase block">Опыт</span>
                                <span className="text-sm font-black text-emerald-400">⚡ +{xp || 150} XP</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleNextLevel}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-95 uppercase tracking-widest text-md italic"
                            >
                                {selectedLevelId === 0 ? 'Следующий Уровень (Ур. 1) ▶' : 'Пройти Заново ▶'}
                            </button>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowSkinModal(true)}
                                    className="flex-1 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold rounded-2xl transition-all border border-cyan-500/30 active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    🛡️ Скины
                                </button>
                                <button 
                                    onClick={() => setShowLeaderboard(true)}
                                    className="flex-1 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-2xl transition-all border border-amber-500/30 active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    🏆 Рейтинг
                                </button>
                                <button 
                                    onClick={() => setShowFeedback(true)}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10 active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    Отзыв ✨
                                </button>
                            </div>
                            
                            <div className="flex gap-3 mt-1">
                                <button 
                                    onClick={handleRestart}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-white/10 active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    Заново
                                </button>
                                <button 
                                    onClick={handleBackToMenu}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-white/10 active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    В меню
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <FeedbackForm onSubmit={() => setShowFeedback(false)} />
                )}

                <LeaderboardModal 
                    isOpen={showLeaderboard}
                    onClose={() => setShowLeaderboard(false)}
                />

                <SkinSelectModal
                    isOpen={showSkinModal}
                    onClose={() => setShowSkinModal(false)}
                />

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
