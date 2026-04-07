import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../../shared/model/useGameStore';

export const EntryScreen = () => {
    const { enterSystem, isFullscreen } = useGameStore();
    const [isVisible, setIsVisible] = useState(true);
    const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
    const [isNoBtnEscaping, setIsNoBtnEscaping] = useState(false);
    
    // Typing effect state
    const fullText = 'ГОТОВ ЛИ ТЫ ПОЗНАТЬ ВСЕЛЕННУЮ PYTHON?';
    const [typingIndex, setTypingIndex] = useState(0);

    // Preload StartScreen image to prevent flicker
    useEffect(() => {
        const img = new Image();
        img.src = '/assets/Pyco.png';
    }, []);

    useEffect(() => {
        if (typingIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setTypingIndex(prev => prev + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [typingIndex]);

    const setLoading = useGameStore((state) => state.setLoading);

    const handleEnter = () => {
        setLoading(true);
        setIsVisible(false);
        setTimeout(() => {
            setLoading(false);
            enterSystem();
        }, 2000);
    };

    // Refined "Short Jump" logic for the NO button
    const handleNoHover = useCallback(() => {
        setIsNoBtnEscaping(true);
        
        // Jump relative to current position, but stay within a reasonable range
        const jumpDistance = 150;
        const angle = Math.random() * Math.PI * 2;
        
        setNoBtnPos(prev => {
            let newX = prev.x + Math.cos(angle) * jumpDistance;
            let newY = prev.y + Math.sin(angle) * jumpDistance;
            
            // Constrain to "eye-sight" range (e.g., +/- 300px from start)
            const limit = 300;
            if (Math.abs(newX) > limit) newX = (newX / Math.abs(newX)) * limit;
            if (Math.abs(newY) > limit) newY = (newY / Math.abs(newY)) * limit;
            
            return { x: newX, y: newY };
        });
    }, []);

    // Split text for styling (keeping the segments but relying on displayText for typing)
    const part1 = "ГОТОВ ЛИ ТЫ";
    const part2 = " ПОЗНАТЬ ВСЕЛЕННУЮ";
    const part3 = " PYTHON?";

    const getTypedSegment = (segment: string, startIdx: number) => {
        if (typingIndex <= startIdx) return "";
        return segment.substring(0, typingIndex - startIdx);
    };

    // Pre-generate stars outside the component to avoid impure Math.random() in render
    // Use an effect to regenerate stars on mount if we want variety, but outside call is pure
    const [stars] = useState(() => Array.from({ length: 40 }, () => ({
        width: (1 + Math.random() * 2) + 'px',
        height: (1 + Math.random() * 2) + 'px',
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 5 + 's',
        opacity: Math.random() * 0.4 + 0.2
    })));

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-1000 overflow-hidden ${isVisible ? 'opacity-100' : 'opacity-0'} ${isFullscreen ? 'p-0' : ''}`}>
            
            {/* Rich Background with Multiple Layers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Layer 1: Galaxy */}
                <img 
                    src="/assets/galactik.png" 
                    alt="Galactic Background" 
                    className={`w-full h-full object-cover opacity-30 animate-slow-spin-subtle transition-transform duration-700 ${isFullscreen ? 'scale-150' : 'scale-125'}`}
                />
                
                {/* Layer 2: Moving Mist */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-mist-move"></div>

                {/* Layer 3: Overlay Gradients for Depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.9)_100%)]"></div>

                {/* Stars and Comets Layer */}
                <div className="absolute inset-0">
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={`comet-${i}`}
                            className="absolute bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent w-[300px] h-[1px] animate-comet"
                            style={{
                                top: `${15 + i * 18}%`,
                                left: '-30%',
                                animationDelay: `${i * 3.5}s`,
                                animationDuration: `${6 + i}s`
                            }}
                        />
                    ))}
                    {stars.map((star, i) => (
                        <div 
                            key={`star-${i}`}
                            className="absolute bg-white rounded-full animate-flicker"
                            style={{
                                width: star.width,
                                height: star.height,
                                top: star.top,
                                left: star.left,
                                animationDelay: star.animationDelay,
                                opacity: star.opacity
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className={`relative z-10 w-full flex flex-col items-center transition-all duration-700 ${isFullscreen ? 'max-w-none px-0 h-screen justify-center' : 'max-w-5xl px-8'}`}>
                
                {/* Typing Text Wrapper */}
                <h1 className="text-xl md:text-5xl font-black text-white/90 text-center leading-tight tracking-tighter mb-24 uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    <span className="block mb-2">
                        {getTypedSegment(part1, 0)}
                    </span>
                    <span className="text-indigo-400">
                        {getTypedSegment(part2, part1.length)}
                    </span>
                    <br />
                    <span className="relative inline-block mt-6 px-4 py-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-yellow-300 animate-gradient-x hover:animate-flicker-strong cursor-default group">
                        {getTypedSegment(part3, part1.length + part2.length)}
                        <div className="absolute -inset-2 bg-yellow-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                        {/* Cursor for typing effect */}
                        {typingIndex < fullText.length && (
                            <span className="inline-block w-1 h-10 ml-1 bg-indigo-500 animate-blink align-middle"></span>
                        )}
                    </span>
                </h1>

                {/* Buttons Container */}
                <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full relative h-40">
                    {/* The "YES" Button */}
                    <button
                        onClick={handleEnter}
                        className="group relative px-28 py-10 bg-indigo-600/30 border-2 border-indigo-500/50 rounded-[2.5rem] backdrop-blur-2xl transition-all duration-300 hover:scale-110 hover:bg-indigo-600/50 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)]"
                    >
                        <span className="relative z-10 text-5xl font-black italic tracking-[0.2em] text-white">
                            ДА
                        </span>
                        <div className="absolute -inset-2 border border-white/10 rounded-[2.8rem] opacity-0 group-hover:opacity-100 transition-all duration-500 animate-ping-slow"></div>
                    </button>

                    {/* The "NO" Button with Precision Jumping */}
                    <button
                        onMouseEnter={handleNoHover}
                        style={{
                            transform: `translate(${noBtnPos.x}px, ${noBtnPos.y}px)`,
                            transition: isNoBtnEscaping ? 'transform 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none'
                        }}
                        className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md transition-all duration-300 opacity-60 hover:opacity-100 hover:bg-red-900/20 hover:border-red-500/30 active:scale-90"
                    >
                        <span className="relative z-10 text-xl font-bold italic tracking-widest text-white/50 group-hover:text-red-300 transition-colors uppercase">
                            Нет
                        </span>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 italic">
                            Не в этот раз! 😉
                        </div>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slow-spin-subtle {
                    from { transform: scale(1.25) rotate(0deg); }
                    to { transform: scale(1.25) rotate(5deg); }
                }
                @keyframes mist-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 1000px 1000px; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes flicker-strong {
                    0%, 100% { text-shadow: 0 0 15px rgba(250, 204, 21, 0.6); transform: scale(1); }
                    50% { text-shadow: 0 0 40px rgba(250, 204, 21, 1), 0 0 60px rgba(250, 204, 21, 0.5); transform: scale(1.05); }
                }
                @keyframes comet {
                    0% { transform: translateX(-100%) translateY(0) rotate(-10deg); opacity: 0; }
                    10% { opacity: 1; }
                    40% { transform: translateX(400%) translateY(150px) rotate(-10deg); opacity: 0; }
                    100% { opacity: 0; }
                }
                .animate-slow-spin-subtle {
                    animation: slow-spin-subtle 30s infinite alternate ease-in-out;
                }
                .animate-mist-move {
                    animation: mist-move 60s linear infinite;
                }
                .animate-blink {
                    animation: blink 0.8s infinite;
                }
                .hover\\:animate-flicker-strong:hover {
                    animation: flicker-strong 0.1s infinite;
                }
                .animate-comet {
                    animation: comet 12s infinite linear;
                }
                .animate-gradient-x {
                    background-size: 200% 100%;
                    animation: gradient-x 3s linear infinite;
                }
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.3); opacity: 0; }
                }
                .animate-ping-slow {
                    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};
