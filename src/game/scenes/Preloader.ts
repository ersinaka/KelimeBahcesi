import { Scene } from 'phaser';
import { TextureGenerator } from '../utils/textureGenerator';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload(): void {
        this.load.on('loaderror', () => {
            // Silently ignore optional asset misses
        });

        const animalIds = ['kedi', 'kopek', 'kuzu', 'tavuk', 'inek', 'ordek', 'at', 'tavsan'];
        animalIds.forEach(id => {
            this.load.image(`custom_animal_${id}`, `assets/animals/${id}.png`);
        });
    }

    create(): void {
        TextureGenerator.generateAll(this);
        // Start Super App login flow
        this.scene.start('LoginScene');
    }
}
