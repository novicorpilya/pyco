import { useEffect, useRef } from 'react';
import { Game } from 'phaser';
import { GameConfig } from '../../../entities/game';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import { useGameStore } from '../../../shared/model/useGameStore';

export const GameContainer = () => {
    const game = useRef<Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { damage, addXp, isStarted } = useGameStore();
    const gameInitialized = useRef(false);

    useEffect(() => {
        // Only initialize Phaser when isStarted is true
        if (isStarted && !gameInitialized.current && containerRef.current) {
            gameInitialized.current = true;
            game.current = new Game({
                ...GameConfig,
                parent: containerRef.current
            });
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = null;
                gameInitialized.current = false;
            }
        };
    }, [isStarted]);

    useEffect(() => {
        const onTakeDamage = (amount: number) => damage(amount);
        const onGainXp = (amount: number) => addXp(amount);

        EventBus.on('take-damage', onTakeDamage);
        EventBus.on('gain-xp', onGainXp);

        return () => {
            EventBus.off('take-damage', onTakeDamage);
            EventBus.off('gain-xp', onGainXp);
        };
    }, [damage, addXp]);

    return (
        <div 
            id="game-container" 
            ref={containerRef} 
            className="w-full h-full bg-black overflow-hidden"
        >
            {/* Phaser will inject the canvas here */}
        </div>
    );
};
