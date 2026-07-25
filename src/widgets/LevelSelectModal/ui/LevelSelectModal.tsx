import React, { useState } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';
import { SkinSelectModal } from '../../SkinSelectModal';
import './LevelSelectModal.css';

export interface LevelItem {
  id: number;
  number: string;
  title: string;
  codeSnippet: string;
  icon: string;
  isUnlocked: boolean;
  accentColor: string;
}

export const LEVELS_LIST: LevelItem[] = [
  {
    id: 0,
    number: '00',
    title: 'Старт & Обучение',
    codeSnippet: 'print("Hello, PYCO!")',
    icon: '🚀',
    isUnlocked: true,
    accentColor: 'from-emerald-400 via-teal-500 to-emerald-600'
  },
  {
    id: 1,
    number: '01',
    title: 'Башня Переменных',
    codeSnippet: 'x = 10; name = "Pyco"',
    icon: '📦',
    isUnlocked: true,
    accentColor: 'from-blue-500 via-indigo-500 to-cyan-500'
  },
  {
    id: 2,
    number: '02',
    title: 'Янтарные Каньоны Условий',
    codeSnippet: 'if temp > 25: print("Жара")',
    icon: '🔀',
    isUnlocked: false,
    accentColor: 'from-amber-400 via-amber-500 to-orange-500'
  },
  {
    id: 3,
    number: '03',
    title: 'Долина Циклов',
    codeSnippet: 'for i in range(5):',
    icon: '🔄',
    isUnlocked: false,
    accentColor: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    number: '04',
    title: 'Лабиринт Списков',
    codeSnippet: 'items = [1, 2, 3]',
    icon: '📚',
    isUnlocked: false,
    accentColor: 'from-cyan-500 to-blue-600'
  },
  {
    id: 5,
    number: '05',
    title: 'Цитадель Словарей',
    codeSnippet: 'user = {"hp": 100}',
    icon: '🔑',
    isUnlocked: false,
    accentColor: 'from-rose-500 to-red-600'
  },
  {
    id: 6,
    number: '06',
    title: 'Фабрика Функций',
    codeSnippet: 'def attack(power):',
    icon: '⚙️',
    isUnlocked: false,
    accentColor: 'from-fuchsia-500 to-purple-600'
  },
  {
    id: 7,
    number: '07',
    title: 'Вершина Исключений',
    codeSnippet: 'try: ... except:',
    icon: '🛡️',
    isUnlocked: false,
    accentColor: 'from-violet-500 to-indigo-600'
  },
  {
    id: 8,
    number: '08',
    title: 'Замок ООП (БОСС)',
    codeSnippet: 'class Boss(Hero):',
    icon: '👑',
    isUnlocked: false,
    accentColor: 'from-amber-400 via-orange-500 to-red-600'
  }
];

export const LevelSelectModal: React.FC = () => {
  const isLevelSelectOpen = useGameStore((state) => state.isLevelSelectOpen);
  const closeLevelSelect = useGameStore((state) => state.closeLevelSelect);
  const startSelectedLevel = useGameStore((state) => state.startSelectedLevel);
  const setLoading = useGameStore((state) => state.setLoading);
  const [showSkinModal, setShowSkinModal] = useState(false);

  if (!isLevelSelectOpen) return null;

  const handleSelectLevel = (lvl: LevelItem) => {
    if (!lvl.isUnlocked) return;
    setLoading(true);
    startSelectedLevel(lvl.id);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 p-4 sm:p-6 animate-fade-in overflow-y-auto">
      {/* Main Container Card */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-indigo-500/30 rounded-[32px] shadow-[0_0_60px_rgba(79,70,229,0.3)] p-6 md:p-8 flex flex-col max-h-[92vh] my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl text-indigo-300 shadow-lg">
              🗺️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wider uppercase bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                ВЫБОР УРОВНЯ ИГРЫ
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                Нажмите на доступный уровень, чтобы начать прохождение
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSkinModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition-all text-xs uppercase tracking-wider shadow-md hover:scale-105"
            >
              🛡️ Гардероб Скинов
            </button>

            <button
              onClick={closeLevelSelect}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/15 transition-all text-base font-bold shadow-md hover:scale-105"
              title="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Level Cards Grid (3 Columns, Spacious) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2 custom-scrollbar pb-8 pt-1 px-1">
          {LEVELS_LIST.map((lvl) => {
            return (
              <div
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl)}
                className={`relative rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between border min-h-[220px] ${
                  lvl.isUnlocked
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)] hover:border-emerald-400 cursor-pointer hover:-translate-y-1 hover:scale-[1.02]'
                    : 'bg-slate-950/60 border-white/10 opacity-75 cursor-not-allowed select-none'
                }`}
              >
                {/* Glowing Top Border Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${lvl.accentColor} ${
                    lvl.isUnlocked ? 'opacity-100' : 'opacity-40'
                  }`}
                />

                {/* Card Top Section */}
                <div className="flex flex-col gap-2">
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl border tracking-wide ${
                          lvl.isUnlocked
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700'
                        }`}
                      >
                        LVL {lvl.number}
                      </span>
                      <span className="text-2xl drop-shadow-md">{lvl.icon}</span>
                    </div>

                    {/* Status Badge */}
                    {lvl.isUnlocked ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-300 bg-emerald-950 border border-emerald-500/60 px-3 py-1 rounded-full uppercase tracking-wider shadow-inner animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        ОТКРЫТ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-900 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        <span>🔒</span> В РАЗРАБОТКЕ
                      </span>
                    )}
                  </div>

                  {/* Level Title */}
                  <h3
                    className={`text-lg font-black tracking-tight ${
                      lvl.isUnlocked ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {lvl.title}
                  </h3>

                  {/* Code Snippet Tag */}
                  <div>
                    <span className="inline-block bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-1.5 font-mono text-xs text-emerald-300 font-bold max-w-full truncate shadow-inner">
                      {lvl.codeSnippet}
                    </span>
                  </div>
                </div>

                {/* Prominent Action Button Area */}
                <div className="pt-3 border-t border-white/10 mt-3 shrink-0">
                  {lvl.isUnlocked ? (
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm tracking-wider uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2 active:scale-95">
                      <span>ИГРАТЬ</span>
                      <span className="text-base">▶</span>
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 bg-slate-900/80 border border-white/5 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 select-none uppercase tracking-wider">
                      <span>СКОРО ДОСТУПЕН</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SkinSelectModal
        isOpen={showSkinModal}
        onClose={() => setShowSkinModal(false)}
      />
    </div>
  );
};
