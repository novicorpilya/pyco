import { useGameStore, type SkinType } from '../../../shared/model/useGameStore';

interface SkinItem {
  id: SkinType;
  title: string;
  description: string;
  icon: string;
  requiredLevelId: number;
}

const SKINS_LIST: SkinItem[] = [
  {
    id: 'default',
    title: 'Костюм Пилота',
    description: 'Стандартный защитный скафандр космонавта PYCO.',
    icon: '🧑‍🚀',
    requiredLevelId: -1, // Always available
  },
  {
    id: 'bronze_armor',
    title: 'Бронзовая Броня',
    description: 'Позолоченный бронзовый доспех за победу над Наставником.',
    icon: '🥉',
    requiredLevelId: 0,
  },
  {
    id: 'cyan_aura',
    title: 'Неоновая Аура Кода',
    description: 'Сияющий магический шлейф из частиц (#22d3ee) при движении.',
    icon: '👑',
    requiredLevelId: 1,
  },
  {
    id: 'gold_cloak',
    title: 'Золотой Плащ Каньона',
    description: 'Легендарная аура Магистра Каньонов Разветвлений.',
    icon: '🥇',
    requiredLevelId: 2,
  },
];

interface SkinSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkinSelectModal = ({ isOpen, onClose }: SkinSelectModalProps) => {
  const { completedLevelIds, equippedSkin, setEquippedSkin } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative bg-slate-900 border-2 border-indigo-500/50 rounded-[36px] shadow-[0_0_50px_rgba(99,102,241,0.25)] max-w-lg w-full p-6 text-center my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-indigo-200 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
              🛡️ Гардероб Скинов
            </h2>
            <p className="text-xs text-slate-400 font-medium">Выбери экипировку или ауру для своего космонавта</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center font-bold text-lg transition-all active:scale-95 border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {SKINS_LIST.map((skin) => {
            const isUnlocked = skin.requiredLevelId === -1 || completedLevelIds.includes(skin.requiredLevelId);
            const isEquipped = equippedSkin === skin.id;

            return (
              <div 
                key={skin.id}
                onClick={() => {
                  if (isUnlocked) {
                    setEquippedSkin(skin.id);
                  }
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isEquipped 
                    ? 'bg-indigo-600/30 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                    : isUnlocked 
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600' 
                      : 'bg-slate-950/50 border-slate-800/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl border border-white/10 shrink-0">
                  {skin.icon}
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide">{skin.title}</h3>
                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Экипировано
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{skin.description}</p>
                </div>

                <div className="shrink-0">
                  {isEquipped ? (
                    <span className="text-lg text-cyan-400 font-bold">✓</span>
                  ) : isUnlocked ? (
                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 text-xs font-bold text-white rounded-xl transition-all">
                      Надеть
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                      🔒 Ур. {skin.requiredLevelId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-wider text-xs italic"
        >
          Готово
        </button>
      </div>
    </div>
  );
};
