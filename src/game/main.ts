import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { LoginScene } from './scenes/LoginScene';
import { HubScene } from './scenes/HubScene';
import { MainMenu } from './scenes/MainMenu';
import { FarmScene } from './scenes/FarmScene';
import { WhoIsThisScene } from './scenes/WhoIsThisScene';
import { RepeatScene } from './scenes/RepeatScene';
import { WhatEatsScene } from './scenes/WhatEatsScene';
import { AlbumScene } from './scenes/AlbumScene';
import { TherapistScene } from './scenes/TherapistScene';
import { AUTO, Game, Scale } from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 540,
    height: 960,
    parent: 'game-container',
    backgroundColor: '#BBE8FF',
    dom: {
        createContainer: true
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        LoginScene,
        HubScene,
        MainMenu,
        FarmScene,
        WhoIsThisScene,
        RepeatScene,
        WhatEatsScene,
        AlbumScene,
        TherapistScene
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
