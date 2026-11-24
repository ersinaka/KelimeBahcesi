import * as Phaser from 'phaser';
import { Scene, GameObjects } from 'phaser';
import { AnimalData, getAnimalTextureKey } from '../data/animals';
import { soundManager } from '../audio/soundManager';
import { CelebrationEffects } from '../utils/celebrationEffects';

export interface EggHatchModalOptions {
    animal: AnimalData;
    onFindFood: (animal: AnimalData) => void;
    onGoToFarm: () => void;
}

export class EggHatchModal extends GameObjects.Container {
    private backdrop: GameObjects.Graphics;
    private modalBox: GameObjects.Container;
    private eggSprite: GameObjects.Image;
    private animalSprite: GameObjects.Image;
    private titleText: GameObjects.Text;
    private syllableText: GameObjects.Text;
    private buttonsContainer: GameObjects.Container;
    private animal: AnimalData;

    constructor(scene: Scene, options: EggHatchModalOptions) {
        super(scene, 0, 0);
        this.animal = options.animal;

        // Semi-transparent backdrop for Mobile Portrait (540x960)
        this.backdrop = scene.add.graphics();
        this.backdrop.fillStyle(0x2B2D42, 0.65);
        this.backdrop.fillRect(0, 0, 540, 960);
        this.add(this.backdrop);

        // Center Modal Container
        this.modalBox = scene.add.container(270, 480);
        this.add(this.modalBox);

        // Dialog background card
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0xFFFFFF, 0.98);
        cardBg.fillRoundedRect(-230, -240, 460, 480, 26);
        cardBg.lineStyle(4, 0x83C5BE, 1);
        cardBg.strokeRoundedRect(-230, -240, 460, 480, 26);
        this.modalBox.add(cardBg);

        // Top Banner / Title
        this.titleText = scene.add.text(0, -190, 'Yumurta Çatlıyor! 🐣', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '26px',
            color: '#2D6A4F',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.modalBox.add(this.titleText);

        // Egg Sprite
        this.eggSprite = scene.add.image(0, -45, 'egg_intact').setScale(1.1);
        this.modalBox.add(this.eggSprite);

        // Animal Sprite (initially hidden)
        this.animalSprite = scene.add.image(0, -45, getAnimalTextureKey(scene, this.animal.id)).setScale(0);
        this.animalSprite.setVisible(false);
        this.modalBox.add(this.animalSprite);

        // Syllable text (initially hidden)
        this.syllableText = scene.add.text(0, 65, '', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '24px',
            color: '#D47A00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.syllableText.setVisible(false);
        this.modalBox.add(this.syllableText);

        // Action Buttons (initially hidden)
        this.buttonsContainer = scene.add.container(0, 150);
        this.buttonsContainer.setVisible(false);
        this.modalBox.add(this.buttonsContainer);

        // Button 1: "Yemini Bul"
        const foodBtn = scene.add.container(0, -32);
        const foodBg = scene.add.graphics();
        foodBg.fillStyle(0xFFD166, 1);
        foodBg.fillRoundedRect(-180, -26, 360, 52, 26);
        foodBg.lineStyle(2, 0xF4A261, 1);
        foodBg.strokeRoundedRect(-180, -26, 360, 52, 26);
        const foodLabel = scene.add.text(0, 0, `Yemini Bul ${this.animal.foodEmoji}`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '19px',
            color: '#6A3805',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        foodBtn.add([foodBg, foodLabel]);
        foodBtn.setSize(360, 52);
        foodBtn.setInteractive({ useHandCursor: true });
        foodBtn.on('pointerdown', () => {
            soundManager.playTap();
            this.destroy();
            options.onFindFood(this.animal);
        });
        this.buttonsContainer.add(foodBtn);

        // Button 2: "Çiftliğe Git"
        const farmBtn = scene.add.container(0, 34);
        const farmBg = scene.add.graphics();
        farmBg.fillStyle(0x83C5BE, 1);
        farmBg.fillRoundedRect(-180, -24, 360, 48, 24);
        farmBg.lineStyle(2, 0x006D77, 1);
        farmBg.strokeRoundedRect(-180, -24, 360, 48, 24);
        const farmLabel = scene.add.text(0, 0, 'Çiftliğe Dön 🚜', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#004346',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        farmBtn.add([farmBg, farmLabel]);
        farmBtn.setSize(360, 48);
        farmBtn.setInteractive({ useHandCursor: true });
        farmBtn.on('pointerdown', () => {
            soundManager.playTap();
            this.destroy();
            options.onGoToFarm();
        });
        this.buttonsContainer.add(farmBtn);

        scene.add.existing(this);

        // Start hatching sequence
        this.playHatchSequence();
    }

    private playHatchSequence(): void {
        // Step 1: Egg wobbles
        this.scene.tweens.add({
            targets: this.eggSprite,
            angle: { from: -14, to: 14 },
            duration: 160,
            repeat: 7,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Step 2: Egg cracks
                soundManager.playCrack();
                this.eggSprite.setTexture('egg_cracked');

                this.scene.time.delayedCall(400, () => {
                    // Step 3: Burst open and reveal animal
                    soundManager.playSuccessBing();
                    soundManager.playCelebrate();
                    CelebrationEffects.spawnConfetti(this.scene, 512, 350, 30);
                    this.spawnBurstParticles();

                    // Hide egg, pop up animal
                    this.eggSprite.setVisible(false);
                    this.animalSprite.setVisible(true);

                    this.scene.tweens.add({
                        targets: this.animalSprite,
                        scaleX: 0.44,
                        scaleY: 0.44,
                        duration: 500,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            // Announce animal name and syllables
                            this.titleText.setText(`Yeni Arkadaş: ${this.animal.name}! 🎉`);
                            this.syllableText.setText(this.animal.syllables.join(' - '));
                            this.syllableText.setVisible(true);
                            this.buttonsContainer.setVisible(true);

                            soundManager.speak(
                                `Tebrikler! Çiftliğe yeni bir arkadaş geldi: ${this.animal.name}!`
                            );
                        }
                    });
                });
            }
        });
    }

    private spawnBurstParticles(): void {
        for (let i = 0; i < 14; i++) {
            const angle = (i * Math.PI * 2) / 14;
            const dist = Phaser.Math.Between(70, 160);
            const star = this.scene.add.image(512, 350, 'star_gold').setScale(Phaser.Math.FloatBetween(0.4, 0.8));
            this.scene.tweens.add({
                targets: star,
                x: 512 + Math.cos(angle) * dist,
                y: 350 + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 900,
                ease: 'Quad.easeOut',
                onComplete: () => star.destroy()
            });
        }
    }
}
