import * as Phaser from 'phaser';
import StartGame from './game/main';

// Expose Phaser globally so any scene / utility referencing Phaser.* at runtime has full access
(window as unknown as { Phaser: typeof Phaser }).Phaser = Phaser;

document.addEventListener('DOMContentLoaded', () => {
    StartGame('game-container');
});
