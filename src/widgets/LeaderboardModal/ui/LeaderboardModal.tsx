import React, { useState } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { leaderboard } = useGameStore();
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  if (!isOpen) return null;

  const filteredEntries = filterLevel === 'all'
    ? leaderboard
    : leaderboard.filter(e => e.levelId === filterLevel);

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/40 rounded-[2.5rem] shadow-[0_0_80px_rgba(245,158,11,0.25)] p-8 flex flex-col max-h-[85vh] text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
                Таблица Лидеров PYCO
              </h2>
              <p className="text-xs text-slate-400 font-medium">Рейтинг лучших питонистов и результаты заездов</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/15 transition-all text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterLevel === 'all'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            Все уровни
          </button>
          <button
            onClick={() => setFilterLevel(0)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterLevel === 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            Уровень 0 (Старт)
          </button>
          <button
            onClick={() => setFilterLevel(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterLevel === 1
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            Уровень 1 (Переменные)
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium italic text-sm">
              Пока нет сохраненных рекордов. Будь первым, кто завоюет Кубок! 🚀
            </div>
          ) : (
            filteredEntries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                    idx === 0 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                    idx === 1 ? 'bg-slate-400/30 text-slate-200 border border-slate-400/50' :
                    idx === 2 ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50' :
                    'bg-white/5 text-slate-400'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{entry.playerName}</h4>
                    <span className="text-[10px] text-slate-400">Уровень {entry.levelId} • {entry.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-xs font-bold text-slate-300">⏱️ {Math.floor(entry.completionTimeSeconds / 60)}m {entry.completionTimeSeconds % 60}s</div>
                    <div className="text-[10px] text-amber-400 font-bold">🪙 {entry.coinsCollected} монет</div>
                  </div>
                  <div className="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 text-amber-300 font-black text-xs">
                    {entry.score} XP
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
