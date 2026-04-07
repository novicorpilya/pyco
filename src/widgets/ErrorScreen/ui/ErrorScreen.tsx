import React from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';

interface ErrorScreenProps {
  type: '404' | '500';
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ type, onRetry }) => {
  const { setError, reset } = useGameStore();

  const handleBack = () => {
    setError(null);
    reset();
  };

  const config = {
    '404': {
      title: 'Упс! Проход закрыт',
      message: 'Похоже, рыцарь заблудился в бесконечных циклах. Страница, которую вы ищете, растворилась в пустоте.',
      code: '404',
      button: 'Вернуться в начало',
      gradient: 'from-indigo-600 via-purple-600 to-indigo-700',
    },
    '500': {
      title: 'Критический сбой',
      message: 'Магическая энергия перегружена! Наши големы споткнулись об аномалию в коде. Попробуйте перезагрузить реальность.',
      code: '500',
      button: 'Перезагрузить',
      gradient: 'from-red-600 via-rose-600 to-red-700',
    }
  };

  const { title, message, code, button, gradient } = config[type];

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[140px] animate-pulse delay-700`}></div>
        
        {/* Animated Particles / Noise */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        {/* Error Code Large Display */}
        <div className="relative mb-12 select-none group">
          <div className={`text-[180px] font-black leading-none opacity-5 group-hover:opacity-10 transition-opacity duration-1000 ${type === '500' ? 'text-red-500' : 'text-indigo-500'}`}>
            {code}
          </div>
          <div className={`absolute inset-0 flex items-center justify-center text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl`}>
            {code}
          </div>
          
          {/* Glitch Effect Element */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden mix-blend-overlay">
            <div className="w-full h-1 bg-white/30 absolute animate-glitch-line"></div>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
          {title}
        </h2>
        
        <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-sm">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button 
            onClick={onRetry || (() => window.location.reload())}
            className={`flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r ${gradient} text-white font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all duration-300 relative border border-white/20 overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">{button}</span>
          </button>
          
          <button 
            onClick={handleBack}
            className="flex-1 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
          >
            В главное меню
          </button>
        </div>
        

      </div>

      <style>{`
        @keyframes glitch-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-glitch-line {
          animation: glitch-line 4s linear infinite;
        }
      `}</style>
    </div>
  );
};
