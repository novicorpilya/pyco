import { AUTO, Scale } from 'phaser';
import type { Types } from 'phaser';
import { LevelOneScene } from '../../level';

// Phaser game configuration
export const GameConfig: Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#028af8',
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
        parent: 'game-container'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 600 },
            debug: false // Set to true for development
        }
    },
    scene: [
        LevelOneScene
    ]
};
