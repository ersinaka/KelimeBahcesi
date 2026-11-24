import * as Phaser from 'phaser';
import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { soundManager } from '../audio/soundManager';
import { AnimalData, FOODS, FoodData, getAnimalById, getAnimalTextureKey } from '../data/animals';
import { Pitir } from '../objects/Pitir';
import { TopBar } from '../objects/TopBar';
import { CelebrationEffects } from '../utils/celebrationEffects';

interface FoodCard {
    container: GameObjects.Container;
    food: FoodData;
    isCorrect: boolean;
    origX: number;
    origY: number;
}

export class WhatEatsScene extends Scene {
    private topBar!: TopBar;
    private pitir!: Pitir;
    private targetAnimal!: AnimalData;
    private currentRound: number = 0;
    private totalRounds: number = 3;
    private animalContainer!: GameObjects.Container;
    private animalSprite!: GameObjects.Image;
    private animalSpeechText!: GameObjects.Text;
    private foodCards: FoodCard[] = [];
    private isWaitingInput: boolean = false;

    constructor() {
        super('WhatEatsScene');
    }

    init(data: { targetAnimalId?: string }): void {
        const pool = gameState.getActiveAnimals();
        if (data && data.targetAnimalId) {
            const requested = getAnimalById(data.targetAnimalId);
            this.targetAnimal = requested || pool[0];
        } else {
            // Prefer unfed animals
            const unfed = pool.filter(a => !gameState.isAnimalFed(a.id));
            this.targetAnimal = unfed.length > 0 ? unfed[0] : pool[0];
        }
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

        this.totalRounds = Math.min(3, gameState.getActiveAnimals().length);
        this.currentRound = 0;

        // Build Animal Stage
        this.buildAnimalStage();

        // Setup Round
        this.setupRoundForAnimal(this.targetAnimal);
    }

    private buildAnimalStage(): void {
        this.animalContainer = this.add.container(270, 330);

        // Stage Pedestal Shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.12);
        shadow.fillEllipse(0, 80, 130, 28);
        this.animalContainer.add(shadow);

        // Animal Sprite (appropriately scaled for 512x512 full body)
        this.animalSprite = this.add.image(0, 0, getAnimalTextureKey(this, this.targetAnimal.id)).setScale(0.42);
        this.animalContainer.add(this.animalSprite);

        // Animal prompt bubble above head
        const bubbleBg = this.add.graphics();
        bubbleBg.fillStyle(0xFFFFFF, 0.96);
        bubbleBg.fillRoundedRect(-130, -135, 260, 48, 16);
        bubbleBg.lineStyle(2.5, 0xD8E2DC, 1);
        bubbleBg.strokeRoundedRect(-130, -135, 260, 48, 16);
        this.animalContainer.add(bubbleBg);

        this.animalSpeechText = this.add.text(0, -111, '', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#2B2D42',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.animalContainer.add(this.animalSpeechText);

        // Gentle breathing animation
        this.tweens.add({
            targets: this.animalSprite,
            scaleY: 0.44,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private setupRoundForAnimal(animal: AnimalData): void {
        this.targetAnimal = animal;
        this.isWaitingInput = true;
        this.clearFoodCards();

        // Update animal sprite
        this.animalSprite.setTexture(getAnimalTextureKey(this, animal.id));
        this.animalSpeechText.setText(`${animal.name} ne yer acaba?`);

        // Prompt
        this.pitir.say(
            `${animal.name} ne yer acaba? Yemi sürükle veya dokun!`,
            `${animal.name} ne yer acaba? Doğru yemi bulabilir misin?`
        );

        // Prepare 3 food options: 1 correct + 2 distractors
        const correctFood = FOODS[animal.foodId] || { id: animal.foodId, name: animal.foodName, emoji: animal.foodEmoji, color: 0xFFF3CD };
        const otherFoods = Object.values(FOODS).filter(f => f.id !== animal.foodId);
        const shuffledOthers = Phaser.Utils.Array.Shuffle([...otherFoods]);
        const foodChoices: FoodData[] = [correctFood, shuffledOthers[0], shuffledOthers[1]];
        Phaser.Utils.Array.Shuffle(foodChoices);

        // Create Food Cards at bottom
        this.displayFoodOptions(foodChoices, correctFood.id);
    }

    private displayFoodOptions(choices: FoodData[], correctFoodId: string): void {
        const spacing = 165;
        const startX = 270 - ((choices.length - 1) * spacing) / 2;
        const foodY = 620;

        choices.forEach((food, i) => {
            const fx = startX + i * spacing;
            const container = this.add.container(fx, foodY);

            // Card background (145x135 for mobile screens)
            const bg = this.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.98);
            bg.fillRoundedRect(-72, -67, 145, 135, 20);
            bg.lineStyle(3, 0xD8E2DC, 1);
            bg.strokeRoundedRect(-72, -67, 145, 135, 20);
            container.add(bg);

            // Food image
            const textureKey = `food_${food.id}`;
            const foodSprite = this.add.image(0, -12, this.textures.exists(textureKey) ? textureKey : 'food_cimen').setScale(0.80);
            container.add(foodSprite);

            // Food name text
            const nameTxt = this.add.text(0, 36, food.name, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '17px',
                color: '#2B2D42',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(nameTxt);

            container.setSize(145, 135);
            container.setInteractive({ useHandCursor: true });
            this.input.setDraggable(container);

            const isCorrect = food.id === correctFoodId;
            const foodCardItem: FoodCard = {
                container,
                food,
                isCorrect,
                origX: fx,
                origY: foodY
            };
            this.foodCards.push(foodCardItem);

            // Support BOTH Drag & Drop AND Direct Tap!
            container.on('pointerdown', () => {
                soundManager.playTap();
            });

            container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                if (!this.isWaitingInput) return;
                container.x = dragX;
                container.y = dragY;
            });

            container.on('dragend', () => {
                if (!this.isWaitingInput) return;
                // Check if dropped near the animal (within 180px of center x: 270, y: 330)
                const dist = Phaser.Math.Distance.Between(container.x, container.y, 270, 330);
                if (dist < 180) {
                    this.evaluateChoice(foodCardItem);
                } else {
                    // Snap back
                    this.tweens.add({
                        targets: container,
                        x: foodCardItem.origX,
                        y: foodCardItem.origY,
                        duration: 200,
                        ease: 'Back.easeOut'
                    });
                }
            });

            // Tap to feed (convenient accessibility alternative for small kids)
            container.on('pointerup', () => {
                if (!this.isWaitingInput) return;
                const dist = Phaser.Math.Distance.Between(container.x, container.y, foodCardItem.origX, foodCardItem.origY);
                if (dist < 10) {
                    this.evaluateChoice(foodCardItem);
                }
            });

            // Entrance animation
            container.setScale(0);
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 350,
                delay: i * 90,
                ease: 'Back.easeOut'
            });
        });
    }

    private evaluateChoice(card: FoodCard): void {
        if (!this.isWaitingInput) return;

        if (card.isCorrect) {
            // Correct Food!
            this.isWaitingInput = false;
            gameState.feedAnimal(this.targetAnimal.id);
            gameState.recordCorrect();
            this.topBar.refresh();

            // Sensory Feedback: Crisp "Bingg!" sound + Green Checkmark Badge + Confetti!
            soundManager.playSuccessBing();
            CelebrationEffects.triggerSuccessCelebration(this, card.container.x, card.container.y);

            // Animate food flying into animal mouth
            this.tweens.add({
                targets: card.container,
                x: 270,
                y: 330,
                scaleX: 0.2,
                scaleY: 0.2,
                alpha: 0,
                duration: 400,
                ease: 'Quad.easeInOut',
                onComplete: () => {
                    // Animal eating munch animation
                    this.playMunchAnimation();
                }
            });
        } else {
            // Incorrect food - Gentle encouragement per GDD!
            soundManager.playTryAgain();

            // Gentle wobble
            this.tweens.add({
                targets: card.container,
                x: card.origX + 10,
                duration: 70,
                repeat: 3,
                yoyo: true,
                onComplete: () => {
                    this.tweens.add({
                        targets: card.container,
                        x: card.origX,
                        y: card.origY,
                        duration: 200
                    });
                }
            });

            this.pitir.encourage('Bunu pek sevmiyorum sanırım, tekrar deneyelim!');
        }
    }

    private playMunchAnimation(): void {
        // Squash & stretch munch
        this.tweens.add({
            targets: this.animalSprite,
            scaleY: 0.9,
            scaleX: 1.25,
            duration: 120,
            repeat: 3,
            yoyo: true,
            onComplete: () => {
                soundManager.playHeart();
                this.spawnHearts();
                this.pitir.celebrate(`Ham ham! Çok lezzetli! ${this.targetAnimal.name} çok mutlu oldu!`);

                this.currentRound++;

                this.time.delayedCall(1800, () => {
                    if (this.currentRound >= this.totalRounds) {
                        this.finishGame();
                    } else {
                        // Pick another unfed or next animal
                        const pool = gameState.getActiveAnimals();
                        const nextCandidate = pool.find(a => !gameState.isAnimalFed(a.id)) || pool[(this.currentRound) % pool.length];
                        this.setupRoundForAnimal(nextCandidate);
                    }
                });
            }
        });
    }

    private spawnHearts(): void {
        for (let i = 0; i < 6; i++) {
            const h = this.add.image(270 + Phaser.Math.Between(-40, 40), 280, 'heart_pink').setScale(0.6);
            this.tweens.add({
                targets: h,
                y: 200 - i * 15,
                x: h.x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 1000 + i * 100,
                onComplete: () => h.destroy()
            });
        }
    }

    private clearFoodCards(): void {
        this.foodCards.forEach(fc => fc.container.destroy());
        this.foodCards = [];
    }

    private finishGame(): void {
        gameState.recordGameCompleted();
        soundManager.playCelebrate();
        this.pitir.celebrate('Harikasın! Hayvanların yemlerini buldun!');

        this.time.delayedCall(1600, () => {
            this.scene.start('FarmScene');
        });
    }
}
