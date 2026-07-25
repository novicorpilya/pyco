import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Инициализация ядра...');

  const messages = [
    'Инициализация ядра...',
    'Архитектура циклов...',
    'Распределение мудрости...',
    'Компиляция реальности...',
    'Оптимизация маны...',
    'Создание сущностей...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev >= 100 ? 100 : prev + 3;
        if (next >= 100) {
          setTimeout(() => {
            useGameStore.getState().setLoading(false);
          }, 150);
        }
        if (Math.floor(next / 20) !== Math.floor(prev / 20)) {
          setStatusText(messages[Math.floor(next / 20) % messages.length]);
        }
        return next;
      });
    }, 30);

    // Safety fallback: Ensure loading screen disappears after 1.5 seconds max
    const safetyTimer = setTimeout(() => {
      useGameStore.getState().setLoading(false);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px]"></div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        
        {/* The Core Visualizer */}
        <div className="relative mb-16 group">
          {/* Main Glowing Orb */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-400 to-purple-500 flex items-center justify-center shadow-[0_0_60px_-10px_rgba(99,102,241,0.6)] z-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] animate-pulse"></div>
            <img src="/favicon.png" alt="PYCO" className="w-16 h-16 z-30 drop-shadow-lg rounded-lg" />
          </div>

          {/* Outer Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-indigo-500/20 rounded-full animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-t-2 border-indigo-400/40 rounded-full animate-spin-slow"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-purple-500/10 rounded-full animate-reverse-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-b border-purple-400/30 rounded-full animate-reverse-spin-slow opacity-50"></div>
          
          {/* Floating Accents */}
          <div className="absolute -top-4 -right-4 w-4 h-4 bg-blue-400 rounded-full blur-[2px] animate-float"></div>
          <div className="absolute -bottom-8 -left-2 w-3 h-3 bg-purple-400 rounded-full blur-[2px] animate-float delay-700"></div>
        </div>

        {/* Text Area */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-4xl font-extrabold tracking-tight text-white inline-flex items-center gap-3">
            PYCO
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
          </h2>
          <div className="flex flex-col items-center">
            <div className="h-4 flex items-center">
              <span className="text-slate-400 text-xs font-mono tracking-wider animate-pulse uppercase">
                {statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Container (Glassmorphic) */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>

          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">
              Загрузка мира
            </span>
            <span className="text-lg font-black text-white font-mono">
              {progress}<span className="text-xs text-indigo-400 ml-1">%</span>
            </span>
          </div>

          {/* Bar Wrapper */}
          <div className="w-full h-3 bg-slate-950/50 rounded-full overflow-hidden p-[2px] border border-white/5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 rounded-full relative transition-all duration-300 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            >
              {/* Shine Effect */}
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-1/2 blur-sm"></div>
              
              {/* Particle trail (simplified) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[4px] animate-pulse"></div>
            </div>
          </div>

          <div className="mt-4 flex gap-1 items-center justify-center">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 w-full rounded-full transition-colors duration-500 ${
                  progress >= (i + 1) * 10 ? 'bg-indigo-500' : 'bg-white/5'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes reverse-spin-slow {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-reverse-spin-slow {
          animation: reverse-spin-slow 15s linear infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
