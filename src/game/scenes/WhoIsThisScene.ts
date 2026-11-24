import * as Phaser from 'phaser';
import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { soundManager } from '../audio/soundManager';
import { AnimalData, ANIMALS, getAnimalTextureKey } from '../data/animals';
import { Pitir } from '../objects/Pitir';
import { TopBar } from '../objects/TopBar';
import { EggHatchModal } from '../objects/EggHatchModal';
import { CelebrationEffects } from '../utils/celebrationEffects';

export class WhoIsThisScene extends Scene {
    private topBar!: TopBar;
    private pitir!: Pitir;
    private currentRound: number = 0;
    private totalRounds: number = 5;
    private currentTargetAnimal!: AnimalData;
    private cardContainers: GameObjects.Container[] = [];
    private roundStarsContainer!: GameObjects.Container;
    private isWaitingForInput: boolean = false;

    constructor() {
        super('WhoIsThisScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // Background (Mobile Portrait 540x960)
        this.add.image(270, 480, 'farm_sky_bg');

        // Top Bar
        this.topBar = new TopBar(this, {
            showBack: true,
            onBack: () => {
                this.scene.start('FarmScene');
            }
        });

        // Guide Character: Pıtır (top left)
        this.pitir = new Pitir(this, 55, 120);

        // Round & Stars tracker
        const settings = gameState.getActiveProfile().settings;
        this.totalRounds = settings.roundsPerGame || 5;
        this.currentRound = 0;

        this.setupRoundIndicators();

        // Start first round
        this.startNextRound();
    }

    private setupRoundIndicators(): void {
        this.roundStarsContainer = this.add.container(270, 190);
        this.updateRoundStars();
    }

    private updateRoundStars(): void {
        this.roundStarsContainer.removeAll(true);

        const starSpacing = 42;
        const startX = -((this.totalRounds - 1) * starSpacing) / 2;

        for (let i = 0; i < this.totalRounds; i++) {
            const x = startX + i * starSpacing;
            const isCompleted = i < this.currentRound;

            const circle = this.add.circle(x, 0, 16, isCompleted ? 0xFFD166 : 0xFFFFFF, 0.9);
            circle.setStrokeStyle(2, isCompleted ? 0xF4A261 : 0xCBD5E1);

            const star = this.add.image(x, 0, 'star_gold').setScale(0.35);
            star.setAlpha(isCompleted ? 1 : 0.3);

            this.roundStarsContainer.add([circle, star]);
        }
    }

    private startNextRound(): void {
        if (this.currentRound >= this.totalRounds) {
            this.finishGame();
            return;
        }

        this.isWaitingForInput = true;
        this.clearCards();
        this.updateRoundStars();

        // Select target animal from active therapist pool
        const pool = gameState.getActiveAnimals();
        const randIndex = Phaser.Math.Between(0, pool.length - 1);
        this.currentTargetAnimal = pool[randIndex];

        // Determine card count for this round (per GDD: 2 cards in early rounds, then 3 cards)
        const therapistCardCount = gameState.getActiveProfile().settings.cardCount || 3;
        const cardsToShow = (therapistCardCount === 2 || this.currentRound < 2) ? 2 : 3;

        // Choose distractors
        const distractors = ANIMALS.filter(a => a.id !== this.currentTargetAnimal.id);
        const shuffledDistractors = Phaser.Utils.Array.Shuffle([...distractors]);
        const chosenCards = [this.currentTargetAnimal, ...shuffledDistractors.slice(0, cardsToShow - 1)];
        Phaser.Utils.Array.Shuffle(chosenCards);

        // Display Cards
        this.displayCards(chosenCards);

        // Pıtır instructions
        const prompt = `Bu kim, bulabilir misin? ${this.currentTargetAnimal.name}!`;
        this.pitir.say(prompt, prompt);
    }

    private displayCards(animals: AnimalData[]): void {
        const count = animals.length;
        const yPositions = count === 2 ? [380, 560] : [300, 475, 650];

        animals.forEach((animal, i) => {
            const cardY = yPositions[i];
            const container = this.add.container(270, cardY);

            // Card background plate (480x145 for mobile thumbs)
            const bg = this.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.98);
            bg.fillRoundedRect(-240, -72, 480, 145, 24);
            bg.fillStyle(animal.bgColor, 0.22);
            bg.fillRoundedRect(-240, -72, 480, 145, 24);
            bg.lineStyle(4, animal.bgColor, 1);
            bg.strokeRoundedRect(-240, -72, 480, 145, 24);
            container.add(bg);

            // Animal Illustration on left side
            const sprite = this.add.image(-140, 0, getAnimalTextureKey(this, animal.id)).setScale(0.25);
            container.add(sprite);

            // Animal Name in big friendly letters
            const nameText = this.add.text(15, -14, animal.name, {
                fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
                fontSize: '32px',
                color: '#2B2D42',
                fontStyle: 'bold',
                align: 'left'
            }).setOrigin(0, 0.5);
            container.add(nameText);

            // Syllables indicator (e.g. KE - Dİ)
            const sylText = this.add.text(15, 24, animal.syllables.join(' - '), {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '18px',
                color: '#D47A00',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            container.add(sylText);

            // Tap badge on right
            const tapCircle = this.add.circle(185, 0, 24, animal.bgColor, 0.4);
            const tapArrow = this.add.text(185, 0, '✓', {
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '22px',
                color: '#2D6A4F',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add([tapCircle, tapArrow]);

            container.setSize(480, 145);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerdown', () => {
                if (!this.isWaitingForInput) return;
                this.handleCardSelection(animal, container, sprite);
            });

            // Card entrance pop
            container.setScale(0);
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 350,
                delay: i * 80,
                ease: 'Back.easeOut'
            });

            this.cardContainers.push(container);
        });
    }

    private handleCardSelection(selectedAnimal: AnimalData, container: GameObjects.Container, sprite: GameObjects.Image): void {
        if (selectedAnimal.id === this.currentTargetAnimal.id) {
            // Correct Answer!
            this.isWaitingForInput = false;
            gameState.recordCorrect();
            this.topBar.refresh();

            // Sensory Feedback: Crisp "Bingg!" sound + Green Checkmark Badge + Confetti!
            soundManager.playSuccessBing();
            CelebrationEffects.triggerSuccessCelebration(this, container.x, container.y - 20);

            // Animal happy bounce
            this.tweens.add({
                targets: sprite,
                scaleX: 0.44,
                scaleY: 0.44,
                duration: 160,
                yoyo: true,
                repeat: 1
            });

            // Fly star to TopBar
            this.flyStarToTop(container.x, container.y);

            this.pitir.celebrate(`Aferin sana! Bu bir ${selectedAnimal.name}!`);

            this.currentRound++;

            // Wait 1.4s then advance
            this.time.delayedCall(1400, () => {
                this.startNextRound();
            });
        } else {
            // Gentle encouragement - NO RED COLOR, NO "YANLIŞ" TEXT per GDD!
            soundManager.playTryAgain();

            // Gentle card shake/wobble
            this.tweens.add({
                targets: container,
                x: container.x + 8,
                duration: 70,
                repeat: 3,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });

            this.pitir.encourage('Hadi tekrar deneyelim!');
        }
    }

    private flyStarToTop(startX: number, startY: number): void {
        const star = this.add.image(startX, startY, 'star_gold').setScale(0.8);
        this.tweens.add({
            targets: star,
            x: 165,
            y: 38,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 700,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                star.destroy();
                soundManager.playStar();
            }
        });
    }

    private clearCards(): void {
        this.cardContainers.forEach(c => c.destroy());
        this.cardContainers = [];
    }

    private finishGame(): void {
        gameState.recordGameCompleted();
        this.clearCards();
        this.updateRoundStars();

        // Check if an animal should hatch (per 5 rounds in GDD)
        const unlockedAnimal = gameState.unlockNextAnimal();

        if (unlockedAnimal) {
            // Trigger Egg Hatching Celebration!
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
            // All available animals already unlocked or full farm
            soundManager.playCelebrate();
            this.pitir.celebrate('Oyun tamamlandı! Harika bir iş çıkardın!');

            this.time.delayedCall(1800, () => {
                this.scene.start('FarmScene');
            });
        }
    }
}
