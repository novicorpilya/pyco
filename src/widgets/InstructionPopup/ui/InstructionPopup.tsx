import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';

export const InstructionPopup = () => {
    const { hasSeenManual, setSeenManual, setPaused } = useGameStore();

    if (hasSeenManual) return null;

    const handleClose = () => {
        setSeenManual(true);
        setPaused(false);
        EventBus.emit('resume-game');
    };

    return (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white">
            <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-[2.5rem] shadow-[0_0_120px_rgba(79,70,229,0.3)] max-w-5xl w-full relative overflow-hidden animate-in zoom-in duration-300">
                
                {/* Cross Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-20 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white transition-colors">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="p-10">
                    <h2 className="text-4xl font-black text-center mb-10 bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight italic">
                        Советы Магистра
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1: Controls */}
                        <div className="space-y-4">
                            <h4 className="text-indigo-400 uppercase text-xs font-black tracking-widest mb-4 px-2">Управление</h4>
                            
                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-500/20 flex items-center justify-center rounded-xl border border-indigo-500/30">
                                        <span className="text-sm">⌨️</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">Движение</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">WASD или стрелки для перемещения и прыжков.</p>
                            </div>

                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-500/20 flex items-center justify-center rounded-xl border border-red-500/30">
                                        <span className="text-sm">💎</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">Здоровье</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Нажми <span className="text-white font-mono bg-white/10 px-1 py-0.5 rounded italic uppercase font-bold">[H]</span> для лечения.</p>
                            </div>
                        </div>

                        {/* Column 2: Mechanics */}
                        <div className="space-y-4">
                            <h4 className="text-cyan-400 uppercase text-xs font-black tracking-widest mb-4 px-2">Механики</h4>
                            
                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-cyan-500/20 flex items-center justify-center rounded-xl border border-cyan-500/30">
                                        <span className="text-sm">🪙</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">Сбор монет</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Каждая монета дает опыт. Чем выше уровень — тем круче награда.</p>
                            </div>

                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-500/20 flex items-center justify-center rounded-xl border border-purple-500/30">
                                        <span className="text-sm">🌀</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">Порталы</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Отвечай на вопросы Магистра Кода, чтобы открыть проход дальше.</p>
                            </div>
                        </div>

                        {/* Column 3: Rewards (Achievement Board) */}
                        <div className="space-y-4">
                            <h4 className="text-amber-400 uppercase text-xs font-black tracking-widest mb-4 px-2">Твоя Награда</h4>
                            
                            <div className="bg-amber-500/5 p-4 rounded-[2rem] border border-amber-500/20 h-[256px] flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center rounded-xl border border-amber-500/30">
                                        <span className="text-sm">🏆</span>
                                    </div>
                                    <h3 className="font-bold text-amber-200 text-md">Ачивки</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">👑</span>
                                            <span className="text-[10px] font-bold text-slate-300">Шлем</span>
                                        </div>
                                        <span className="text-[11px] font-black text-amber-400 italic">4+ УР.</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">⚔️</span>
                                            <span className="text-[10px] font-bold text-slate-300">Меч</span>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-300 italic">2-3 УР.</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🥉</span>
                                            <span className="text-[10px] font-bold text-slate-300">Кубок</span>
                                        </div>
                                        <span className="text-[11px] font-black text-orange-400 italic">1 УР.</span>
                                    </div>
                                </div>

                                <p className="text-[10px] text-center text-slate-500 italic mt-4">Уровень считается в конце игры</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-12 w-full">
                        <button 
                            onClick={handleClose}
                            className="w-full max-w-sm py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] active:scale-95 uppercase tracking-widest text-lg italic"
                        >
                            Я готов к коду!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
