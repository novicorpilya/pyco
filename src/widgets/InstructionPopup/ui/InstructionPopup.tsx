import { useGameStore } from '../../../shared/model/useGameStore';
import { EventBus } from '../../../shared/lib/phaser/EventBus';

export const InstructionPopup = () => {
    const { hasSeenManual, setSeenManual, setPaused, selectedLevelId } = useGameStore();

    if (hasSeenManual) return null;

    const handleClose = () => {
        setSeenManual(true);
        setPaused(false);
        EventBus.emit('resume-game');
    };

    const isLevel2 = selectedLevelId === 2;
    const isLevel1 = selectedLevelId === 1;

    return (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white">
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-[2.5rem] shadow-[0_0_120px_rgba(245,158,11,0.25)] max-w-5xl w-full relative overflow-hidden animate-in zoom-in duration-300">
                
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
                    <h2 className="text-4xl font-black text-center mb-2 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent uppercase tracking-tight italic">
                        Советы Магистра
                    </h2>
                    <p className="text-center text-sm font-bold text-amber-300/80 uppercase tracking-widest mb-8">
                        {isLevel2 
                            ? 'Уровень 2: Янтарные Каньоны Условий (if / else / elif)' 
                            : isLevel1 
                            ? 'Уровень 1: Башня Переменных & Типы Python' 
                            : 'Уровень 0: Введение и Основы Python'
                        }
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1: Controls */}
                        <div className="space-y-4">
                            <h4 className="text-indigo-400 uppercase text-xs font-black tracking-widest mb-4 px-2">Управление</h4>
                            
                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors min-h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-500/20 flex items-center justify-center rounded-xl border border-indigo-500/30">
                                        <span className="text-sm">⌨️</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">Движение</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">WASD или стрелки для перемещения, прыжков по лифтам и уклонения от слаймов.</p>
                            </div>

                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors min-h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-500/20 flex items-center justify-center rounded-xl border border-red-500/30">
                                        <span className="text-sm">💎</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">Лечение</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Нажми <span className="text-white font-mono bg-white/10 px-1 py-0.5 rounded italic uppercase font-bold">[H]</span> для мгновенного восстановления HP при наличии кристалла.
                                </p>
                            </div>
                        </div>

                        {/* Column 2: Mechanics */}
                        <div className="space-y-4">
                            <h4 className="text-amber-400 uppercase text-xs font-black tracking-widest mb-4 px-2">
                                {isLevel2 ? 'Новые Механики' : isLevel1 ? 'Боевые Механики' : 'Механики'}
                            </h4>
                            
                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors min-h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-500/20 flex items-center justify-center rounded-xl border border-orange-500/30">
                                        <span className="text-sm">{isLevel2 ? '🚪' : isLevel1 ? '🔥' : '🪙'}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">
                                        {isLevel2 ? 'Врата Условий' : isLevel1 ? 'Атака СВЕРХУ' : 'Сбор монет'}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {isLevel2 
                                        ? 'Читай код на Голографических Кристаллах и пробегай через правильные Зеленые Ворота (if/elif)!'
                                        : isLevel1 
                                        ? 'Прыгай СВЕРХУ на пламенных слаймов для уничтожения и +25 XP!'
                                        : 'Каждая монета дает опыт. Чем выше уровень — тем круче награда.'
                                    }
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors min-h-[120px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-500/20 flex items-center justify-center rounded-xl border border-purple-500/30">
                                        <span className="text-sm">{isLevel2 ? '🌉' : isLevel1 ? '📦' : '🌀'}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-md">
                                        {isLevel2 ? 'Мосты и Лифты' : isLevel1 ? 'Типы Python' : 'Порталы'}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {isLevel2 
                                        ? 'Песчаные лифты поднимут над шипами, а деревянные мостики рушатся через 0.8с после прыжка!'
                                        : isLevel1 
                                        ? 'Взойди на вершину башни и ответь на вопросы Магистра по переменным и типам данных!'
                                        : 'Отвечай на вопросы Наставника Пико, чтобы открыть проход дальше.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Column 3: Rewards (Level Specific Skin & Trophy) */}
                        <div className="space-y-4">
                            <h4 className="text-amber-400 uppercase text-xs font-black tracking-widest mb-4 px-2">Твоя Награда</h4>
                            
                            <div className="bg-amber-500/5 p-4 rounded-[2rem] border border-amber-500/20 min-h-[256px] flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center rounded-xl border border-amber-500/30">
                                        <span className="text-sm">🏆</span>
                                    </div>
                                    <h3 className="font-bold text-amber-200 text-md">
                                        {isLevel2 ? 'Награда 2-го Уровня' : isLevel1 ? 'Награда 1-го Уровня' : 'Награда 0-го Уровня'}
                                    </h3>
                                </div>
                                
                                {isLevel2 ? (
                                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-center my-auto">
                                        <span className="text-5xl mb-2 animate-bounce">🥇</span>
                                        <h4 className="font-black text-amber-300 text-sm tracking-wide uppercase">Золотой Костюм Каньона</h4>
                                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                            Пройди Янтарный Каньон Условий и разблокируй элитный Золотой Скафандр Космонавта в Гардеробе!
                                        </p>
                                        <span className="mt-2 text-xs font-black text-emerald-400">+200 XP</span>
                                    </div>
                                ) : isLevel1 ? (
                                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-center my-auto">
                                        <span className="text-5xl mb-2 animate-bounce">👑</span>
                                        <h4 className="font-black text-cyan-300 text-sm tracking-wide uppercase">Неоновая Аура Кода</h4>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                            Пройди Башню Переменных и разблокируй сияющий магический шлейф ауры (#22d3ee) в Гардеробе!
                                        </p>
                                        <span className="mt-2 text-xs font-black text-emerald-400">+150 XP</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center my-auto">
                                        <span className="text-5xl mb-2 animate-bounce">🥉</span>
                                        <h4 className="font-black text-amber-300 text-sm tracking-wide uppercase">Бронзовая Броня Пилота</h4>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                            Ответь на вопросы Наставника Пико и получи золотисто-бронзовый доспех для космонавта!
                                        </p>
                                        <span className="mt-2 text-xs font-black text-emerald-400">+100 XP</span>
                                    </div>
                                )}

                                <p className="text-[10px] text-center text-slate-500 italic mt-2">
                                    Выдаётся при успешной победе на уровне
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-12 w-full">
                        <button 
                            onClick={handleClose}
                            className="w-full max-w-sm py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black rounded-3xl transition-all shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.6)] active:scale-95 uppercase tracking-widest text-lg italic"
                        >
                            Я готов к коду!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
