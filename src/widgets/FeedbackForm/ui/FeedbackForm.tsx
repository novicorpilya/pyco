import { useState } from 'react';

interface FeedbackFormProps {
    onSubmit: () => void;
}

export const FeedbackForm = ({ onSubmit }: FeedbackFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, name, comment })
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(onSubmit, 2500);
            } else {
                throw new Error('Упс! Не удалось отправить отзыв. Попробуй позже!');
            }
        } catch (err) {
            console.error('Feedback error:', err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="text-6xl mb-4 animate-bounce">✨</div>
                <h3 className="text-2xl font-bold text-amber-300 mb-2">Спасибо за отзыв!</h3>
                <p className="text-slate-400">Твоё мнение делает игру лучше!</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left py-4 animate-in slide-in-from-bottom duration-700">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-center">Как тебе игра?</h3>

                {/* Star Rating */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="text-4xl transition-all duration-300 transform hover:scale-125 hover:rotate-12"
                        >
                            <span className={star <= (hoverRating || rating) ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-600 grayscale opacity-50'}>
                                ⭐
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm text-center animate-shake">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="relative group">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Твоё имя"
                        maxLength={50}
                        className="w-full bg-slate-800/80 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:border-amber-500 outline-none transition-all"
                    />
                    <div className="absolute top-4 right-6 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">👤</div>
                </div>

                <div className="relative group">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Твои пожелания или идеи для игры..."
                        rows={3}
                        maxLength={1000}
                        className="w-full bg-slate-800/80 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:border-amber-500 outline-none transition-all resize-none"
                    />
                    <div className="absolute top-4 right-6 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">📝</div>
                </div>
            </div>

            <button 
                type="submit"
                disabled={rating === 0 || loading}
                className={`w-full py-5 font-black rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] transform active:scale-95 ${
                    rating > 0 && !loading
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:shadow-amber-500/30' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale'
                }`}
            >
                {loading ? 'Отправляем... 📡' : (rating > 0 ? 'Отправить Мастеру ✨' : 'Поставь оценку! ⭐')}
            </button>
        </form>
    );
};
