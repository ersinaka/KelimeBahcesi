import * as Phaser from 'phaser';
import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { soundManager } from '../audio/soundManager';
import { AnimalData, getAnimalTextureKey } from '../data/animals';
import { Pitir } from '../objects/Pitir';
import { TopBar } from '../objects/TopBar';
import { EggHatchModal } from '../objects/EggHatchModal';
import { CelebrationEffects } from '../utils/celebrationEffects';

export class RepeatScene extends Scene {
    private topBar!: TopBar;
    private pitir!: Pitir;
    private currentRound: number = 0;
    private totalRounds: number = 3;
    private currentAnimalIndex: number = 0;
    private animalsList: AnimalData[] = [];
    private currentAnimal!: AnimalData;

    // Repetition counter per animal (target: 3)
    private repCount: number = 0;
    private readonly targetReps: number = 3;

    // UI elements
    private animalContainer!: GameObjects.Container;
    private animalSprite!: GameObjects.Image;
    private nameText!: GameObjects.Text;
    private syllablesContainer!: GameObjects.Container;
    private repStars: GameObjects.Image[] = [];
    private correctBtn!: GameObjects.Container;
    private retryBtn!: GameObjects.Container;

    constructor() {
        super('RepeatScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // Background
        this.add.image(512, 384, 'farm_sky_bg');

        // Top Bar
        this.topBar = new TopBar(this, {
            showBack: true,
            onBack: () => {
                this.scene.start('FarmScene');
            }
        });

        // Guide Character: Pıtır (top left)
        this.pitir = new Pitir(this, 75, 145);

        // Load active animal pool
        const pool = gameState.getActiveAnimals();
        this.animalsList = Phaser.Utils.Array.Shuffle([...pool]);

        const settings = gameState.getActiveProfile().settings;
        this.totalRounds = Math.min(settings.roundsPerGame || 5, this.animalsList.length);
        this.currentRound = 0;
        this.currentAnimalIndex = 0;

        // Build main display cards
        this.buildMainCard();

        // Start first animal
        this.showAnimal(this.animalsList[this.currentAnimalIndex]);
    }

    private buildMainCard(): void {
        // Center Card Container
        this.animalContainer = this.add.container(512, 310);

        // Card backdrop (360x350)
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0xFFFFFF, 0.98);
        cardBg.fillRoundedRect(-180, -175, 360, 350, 26);
        cardBg.lineStyle(5, 0xE2E8F0, 1);
        cardBg.strokeRoundedRect(-180, -175, 360, 350, 26);
        this.animalContainer.add(cardBg);

        // Animal Sprite (appropriately scaled for 512x512 full body)
        this.animalSprite = this.add.image(0, -45, 'animal_kedi').setScale(0.46);
        this.animalContainer.add(this.animalSprite);

        // Speaker icon beside animal to hear pronunciation
        const speakerBtn = this.add.container(135, -125);
        const spkCircle = this.add.circle(0, 0, 22, 0x52B788);
        const spkImg = this.add.image(0, 0, 'icon_speaker').setScale(0.5);
        speakerBtn.add([spkCircle, spkImg]);
        speakerBtn.setSize(44, 44);
        speakerBtn.setInteractive({ useHandCursor: true });
        speakerBtn.on('pointerdown', () => {
            soundManager.playTap();
            this.speakCurrentAnimal();
        });
        this.animalContainer.add(speakerBtn);

        // Animal Name Text
        this.nameText = this.add.text(0, 65, '', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '32px',
            color: '#2B2D42'
        }).setOrigin(0.5);
        this.animalContainer.add(this.nameText);

        // Syllables Chips Container
        this.syllablesContainer = this.add.container(0, 115);
        this.animalContainer.add(this.syllablesContainer);

        // Repetition 3 Star Indicators (below card at y=520)
        const starsBox = this.add.container(512, 520);
        const repLabel = this.add.text(0, -28, '3 Kere Tekrar Edelim: ', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#4A5568'
        }).setOrigin(0.5);
        starsBox.add(repLabel);

        this.repStars = [];
        [-50, 0, 50].forEach(x => {
            const circle = this.add.circle(x, 8, 20, 0xFFFFFF, 0.95);
            circle.setStrokeStyle(2, 0xCBD5E1);
            const star = this.add.image(x, 8, 'star_gold').setScale(0.4).setAlpha(0.25);
            starsBox.add([circle, star]);
            this.repStars.push(star);
        });

        // Two Big Buttons Underneath (min 120x120px / 220x65px per GDD):
        // 1. "Doğru söyledi ✓" (Therapist or parent taps)
        this.correctBtn = this.add.container(650, 620);
        const corBg = this.add.graphics();
        corBg.fillStyle(0x52B788, 1);
        corBg.fillRoundedRect(-110, -32, 220, 64, 32);
        corBg.lineStyle(3, 0x2D6A4F, 1);
        corBg.strokeRoundedRect(-110, -32, 220, 64, 32);
        const corLabel = this.add.text(0, 0, 'Doğru söyledi  ✓', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.correctBtn.add([corBg, corLabel]);
        this.correctBtn.setSize(220, 64);
        this.correctBtn.setInteractive({ useHandCursor: true });
        this.correctBtn.on('pointerdown', () => this.handleCorrectRepeat());

        // 2. "Tekrar deneyelim ↻"
        this.retryBtn = this.add.container(370, 620);
        const retBg = this.add.graphics();
        retBg.fillStyle(0xFFE5D9, 1);
        retBg.fillRoundedRect(-110, -32, 220, 64, 32);
        retBg.lineStyle(3, 0xF3A683, 1);
        retBg.strokeRoundedRect(-110, -32, 220, 64, 32);
        const retLabel = this.add.text(0, 0, 'Tekrar deneyelim  ↻', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '19px',
            color: '#6A3805'
        }).setOrigin(0.5);
        this.retryBtn.add([retBg, retLabel]);
        this.retryBtn.setSize(220, 64);
        this.retryBtn.setInteractive({ useHandCursor: true });
        this.retryBtn.on('pointerdown', () => this.handleRetryRepeat());
    }

    private showAnimal(animal: AnimalData): void {
        this.currentAnimal = animal;
        this.repCount = 0;
        this.updateRepStarsVisual();

        // Update card visual
        this.animalSprite.setTexture(getAnimalTextureKey(this, animal.id));
        this.nameText.setText(animal.name);

        // Syllable chips
        this.syllablesContainer.removeAll(true);
        const syls = animal.syllables;
        const spacing = 70;
        const startX = -((syls.length - 1) * spacing) / 2;

        syls.forEach((s, idx) => {
            const chip = this.add.container(startX + idx * spacing, 0);
            const chipBg = this.add.graphics();
            chipBg.fillStyle(0xFFF3CD, 1);
            chipBg.fillRoundedRect(-28, -14, 56, 28, 14);
            chipBg.lineStyle(2, 0xF6BD60, 1);
            chipBg.strokeRoundedRect(-28, -14, 56, 28, 14);
            const chipTxt = this.add.text(0, 0, s, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '16px',
                color: '#6A3805'
            }).setOrigin(0.5);
            chip.add([chipBg, chipTxt]);
            this.syllablesContainer.add(chip);
        });

        // Prompt
        this.speakCurrentAnimal();
    }

    private speakCurrentAnimal(): void {
        const text = `Hadi söyleyelim: ${this.currentAnimal.name}!`;
        this.pitir.say(text, `${this.currentAnimal.name}! Hadi sen de söyle!`);
    }

    private handleCorrectRepeat(): void {
        this.repCount++;
        gameState.recordRepeat();
        this.topBar.refresh();

        // Sensory Feedback: Crisp "Bingg!" sound + Green Checkmark Badge + Confetti!
        soundManager.playSuccessBing();
        const starX = 512 + (this.repCount - 2) * 50;
        CelebrationEffects.triggerSuccessCelebration(this, starX, 520);

        this.updateRepStarsVisual();

        // Bounce animal happily
        this.tweens.add({
            targets: this.animalSprite,
            scaleX: 0.52,
            scaleY: 0.52,
            duration: 150,
            yoyo: true
        });

        if (this.repCount >= this.targetReps) {
            // Target 3 repetitions reached!
            soundManager.playCelebrate();
            this.pitir.celebrate(`Aferin sana! ${this.currentAnimal.name} kelimesini 3 kez söyledin!`);

            this.currentRound++;
            this.currentAnimalIndex++;

            this.time.delayedCall(1600, () => {
                if (this.currentRound >= this.totalRounds || this.currentAnimalIndex >= this.animalsList.length) {
                    this.finishGame();
                } else {
                    this.showAnimal(this.animalsList[this.currentAnimalIndex]);
                }
            });
        } else {
            this.pitir.say(`Harika! ${this.repCount} oldu, devam edelim!`);
        }
    }

    private handleRetryRepeat(): void {
        soundManager.playTryAgain();

        // Gentle nod
        this.tweens.add({
            targets: this.animalSprite,
            angle: { from: -4, to: 4 },
            duration: 90,
            repeat: 2,
            yoyo: true
        });

        this.pitir.encourage('Hadi tekrar deneyelim, sen yapabilirsin!');
    }

    private updateRepStarsVisual(): void {
        this.repStars.forEach((star, index) => {
            const isLit = index < this.repCount;
            star.setAlpha(isLit ? 1 : 0.25);
            if (isLit) {
                star.setScale(0.5);
                this.tweens.add({
                    targets: star,
                    scaleX: 0.4,
                    scaleY: 0.4,
                    duration: 200
                });
            }
        });
    }

    private finishGame(): void {
        gameState.recordGameCompleted();

        // Check if animal unlocks
        const unlockedAnimal = gameState.unlockNextAnimal();

        if (unlockedAnimal) {
            new EggHatchModal(this, {
                animal: unlockedAnimal,
                onFindFood: (animal) => {
                    this.scene.start('WhatEatsScene', { targetAnimalId: animal.id });
                },
                onGoToFarm: () => {
                    this.scene.start('FarmScene');
                }
            });
        } else {
            soundManager.playCelebrate();
            this.pitir.celebrate('Bütün tekrarları tamamladın! Harikasın!');
            this.time.delayedCall(1800, () => {
                this.scene.start('FarmScene');
            });
        }
    }
}
