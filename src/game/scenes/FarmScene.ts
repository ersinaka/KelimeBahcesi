import * as Phaser from 'phaser';
import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { soundManager } from '../audio/soundManager';
import { AnimalData, getAnimalById, getAnimalTextureKey } from '../data/animals';
import { Pitir } from '../objects/Pitir';
import { TopBar } from '../objects/TopBar';
import { CelebrationEffects } from '../utils/celebrationEffects';

interface WanderingAnimal {
    container: GameObjects.Container;
    animal: AnimalData;
    targetX: number;
    targetY: number;
    speed: number;
    isMoving: boolean;
    sprite: GameObjects.Image;
    foodBadge?: GameObjects.Container;
}

export class FarmScene extends Scene {
    private pitir!: Pitir;
    private wanderingAnimals: WanderingAnimal[] = [];
    private clouds: GameObjects.Image[] = [];
    private butterflies: GameObjects.Image[] = [];

    constructor() {
        super('FarmScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // 1. Pastoral Farm Landscape Background (Mobile Portrait 540x960)
        this.add.image(270, 480, 'farm_sky_bg');

        // Drifting Clouds
        this.createClouds();

        // Sun
        const sun = this.add.image(470, 95, 'sun').setScale(0.85);
        this.tweens.add({
            targets: sun,
            scaleX: 0.92,
            scaleY: 0.92,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Fluttering Butterflies
        this.createButterflies();

        // Farm elements: Trees and Feed Silo
        this.add.image(40, 410, 'tree').setScale(0.65);
        this.add.image(500, 400, 'tree').setScale(0.65);
        this.add.image(470, 330, 'feed_silo').setScale(0.65);

        // Wooden picket fence along back pasture
        for (let x = 15; x < 540; x += 75) {
            this.add.image(x, 545, 'fence').setScale(0.75);
        }

        // 2. Unlocked Decors based on animal count:
        // 3 hayvanda ahır, 6 hayvanda gölet, 8 hayvanda çiçek bahçesi
        this.createDynamicDecors();

        // 3. Wandering Animals or Starter Egg
        this.setupFarmInhabitants();

        // 4. Mini-Game Gateways / Portals (Bottom region for mobile thumbs)
        this.createMiniGamePortals();

        // 5. Guide Character: Pıtır (Placed in top-left sky)
        this.pitir = new Pitir(this, 55, 120);
        this.setupPitirDialogue();

        // 6. Top Bar (Header with stars, profile, album, therapist hold button)
        new TopBar(this, {
            showBack: false,
            showAlbum: true,
            onAlbum: () => {
                this.scene.start('AlbumScene');
            },
            showTherapist: true,
            onTherapist: () => {
                this.scene.start('TherapistScene');
            }
        });

        // 7. Check if full collection reached (8 animals & 8 foods)
        this.checkGrandCelebration();
    }

    private createClouds(): void {
        const cloudPositions = [
            { x: 120, y: 95, s: 0.65, speed: 18000 },
            { x: 340, y: 110, s: 0.75, speed: 22000 },
            { x: 490, y: 85, s: 0.55, speed: 16000 }
        ];

        cloudPositions.forEach(c => {
            const cloud = this.add.image(c.x, c.y, 'cloud').setScale(c.s).setAlpha(0.9);
            this.clouds.push(cloud);
            this.tweens.add({
                targets: cloud,
                x: 600,
                duration: c.speed,
                ease: 'Linear',
                repeat: -1,
                onRepeat: () => {
                    cloud.x = -80;
                }
            });
        });
    }

    private createButterflies(): void {
        const bfly1 = this.add.image(160, 380, 'butterfly').setScale(0.7);
        const bfly2 = this.add.image(420, 420, 'butterfly').setScale(0.65);
        this.butterflies.push(bfly1, bfly2);

        [bfly1, bfly2].forEach((bf, i) => {
            this.tweens.add({
                targets: bf,
                x: bf.x + (i === 0 ? 50 : -45),
                y: bf.y + (i === 0 ? -30 : -25),
                scaleX: { from: bf.scaleX, to: -bf.scaleX },
                duration: 1800 + i * 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    private createDynamicDecors(): void {
        const unlockedCount = gameState.getActiveProfile().unlockedAnimalIds.length;

        // 3 hayvanda ahır (Barn at 3+ animals)
        if (unlockedCount >= 3) {
            this.add.image(105, 335, 'barn').setScale(0.65);
            // Gentle decorative star on barn
            const star = this.add.image(105, 270, 'star_gold').setScale(0.35);
            this.tweens.add({
                targets: star,
                scaleX: 0.45,
                scaleY: 0.45,
                duration: 1500,
                yoyo: true,
                repeat: -1
            });
        }

        // 6 hayvanda gölet (Pond at 6+ animals)
        if (unlockedCount >= 6) {
            this.add.image(400, 420, 'pond').setScale(0.65);
        }

        // 8 hayvanda çiçek bahçesi (Flower Garden at 8 animals)
        if (unlockedCount >= 8) {
            this.add.image(110, 450, 'flower_garden').setScale(0.65);
        }
    }

    private setupFarmInhabitants(): void {
        const profile = gameState.getActiveProfile();
        const unlockedIds = profile.unlockedAnimalIds;

        if (unlockedIds.length === 0) {
            // Initial Empty Farm: A gentle rocking egg on nest with signpost
            const eggContainer = this.add.container(270, 420);

            // Straw nest
            const nest = this.add.graphics();
            nest.fillStyle(0xDDA15E, 0.9);
            nest.fillEllipse(0, 24, 75, 24);
            eggContainer.add(nest);

            const starterEgg = this.add.image(0, 0, 'egg_intact').setScale(0.75);
            eggContainer.add(starterEgg);

            // Gentle rocking
            this.tweens.add({
                targets: starterEgg,
                angle: { from: -8, to: 8 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Signpost
            const signBg = this.add.graphics();
            signBg.fillStyle(0xFFF3CD, 0.95);
            signBg.fillRoundedRect(160, 470, 220, 36, 14);
            signBg.lineStyle(2, 0xD4A373, 1);
            signBg.strokeRoundedRect(160, 470, 220, 36, 14);
            this.add.text(270, 488, 'İlk Yumurtan Burada! 🐣', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '15px',
                color: '#6A3805',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            eggContainer.setSize(80, 80);
            eggContainer.setInteractive({ useHandCursor: true });
            eggContainer.on('pointerdown', () => {
                soundManager.playCrack();
                this.pitir.say(
                    'Mini oyun oynayarak bu yumurtayı çatlatabilirsin! Hadi başlayalım!',
                    'Mini oyun oynayarak bu yumurtayı çatlatabilirsin! Aşağıdaki oyunlardan birini seç!'
                );
            });
            return;
        }

        // Wandering Unlocked Animals in portrait pasture
        const availableSlots = [
            { x: 180, y: 360 },
            { x: 340, y: 350 },
            { x: 130, y: 440 },
            { x: 270, y: 430 },
            { x: 410, y: 440 },
            { x: 190, y: 495 },
            { x: 330, y: 500 },
            { x: 270, y: 370 }
        ];

        unlockedIds.forEach((id, index) => {
            const animal = getAnimalById(id);
            if (!animal) return;

            const slot = availableSlots[index % availableSlots.length];
            const container = this.add.container(slot.x, slot.y);

            // Shadow
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.12);
            shadow.fillEllipse(0, 34, 48, 14);
            container.add(shadow);

            // Animal Sprite (scaled for 512x512 full body)
            const sprite = this.add.image(0, -8, getAnimalTextureKey(this, animal.id)).setScale(0.22);
            container.add(sprite);

            // Feed Badge if Animal is fed!
            let foodBadge: GameObjects.Container | undefined;
            if (profile.fedAnimalIds.includes(animal.id)) {
                foodBadge = this.add.container(22, -40);
                const fBg = this.add.circle(0, 0, 13, 0xFFF3B0);
                fBg.setStrokeStyle(2, 0xF6BD60);
                const fImg = this.add.image(0, 0, `food_${animal.foodId}`).setScale(0.26);
                foodBadge.add([fBg, fImg]);
                container.add(foodBadge);

                // Gentle pulsing of food badge
                this.tweens.add({
                    targets: foodBadge,
                    scaleX: 1.15,
                    scaleY: 1.15,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }

            container.setSize(70, 70);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerdown', () => {
                this.tapAnimal(container, animal, sprite);
            });

            const wanderer: WanderingAnimal = {
                container,
                animal,
                targetX: slot.x,
                targetY: slot.y,
                speed: Phaser.Math.Between(15, 25),
                isMoving: false,
                sprite,
                foodBadge
            };
            this.wanderingAnimals.push(wanderer);
        });
    }

    private tapAnimal(container: GameObjects.Container, animal: AnimalData, sprite: GameObjects.Image): void {
        soundManager.playSuccessBing();
        CelebrationEffects.triggerSuccessCelebration(this, container.x, container.y - 30);

        this.tweens.add({
            targets: sprite,
            scaleX: sprite.scaleX * 1.15,
            duration: 150,
            yoyo: true
        });

        // Happy bounce animation
        this.tweens.add({
            targets: container,
            y: container.y - 28,
            duration: 180,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Heart floating up
                const heart = this.add.image(container.x, container.y - 45, 'heart_pink').setScale(0.6);
                soundManager.playHeart();
                this.tweens.add({
                    targets: heart,
                    y: container.y - 85,
                    alpha: 0,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 1000,
                    onComplete: () => heart.destroy()
                });
            }
        });

        // Animal vocalization and guide interaction
        const isFed = gameState.getActiveProfile().fedAnimalIds.includes(animal.id);
        if (isFed) {
            this.pitir.say(
                `${animal.name}: "${animal.soundText}" Karnım tok, çok mutluyum!`,
                `${animal.name}! ${animal.soundText}`
            );
        } else {
            this.pitir.say(
                `${animal.name}: "${animal.soundText}" Acaba benim yemimi bulabilir misin?`,
                `${animal.name}! ${animal.soundText} Acaba ne yerim?`
            );
        }
    }

    private createMiniGamePortals(): void {
        // 3 Mini-Games with big mobile touch-friendly wide cards
        const portals = [
            {
                id: 'WhoIsThisScene',
                title: 'Bu Kim? 🔍',
                sub: 'Dinle ve Doğru Hayvanı Bul',
                emoji: '👂',
                y: 630,
                color: 0x90E0EF,
                borderColor: 0x0077B6,
                textColor: 0x03045E
            },
            {
                id: 'RepeatScene',
                title: 'Tekrar Et! 🗣️',
                sub: 'Hayvan Adını Birlikte Söyleyelim',
                emoji: '📢',
                y: 725,
                color: 0xFFCAD4,
                borderColor: 0xD90429,
                textColor: 0x590D22
            },
            {
                id: 'WhatEatsScene',
                title: 'Ne Yer? 🥕',
                sub: 'Hayvanların Sevdiği Yemi Bul',
                emoji: '🌾',
                y: 820,
                color: 0xD8F3DC,
                borderColor: 0x2D6A4F,
                textColor: 0x081C15
            }
        ];

        portals.forEach(p => {
            const btn = this.add.container(270, p.y);

            // Card body (490x76)
            const bg = this.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.96);
            bg.fillRoundedRect(-245, -38, 490, 76, 20);
            bg.fillStyle(p.color, 0.45);
            bg.fillRoundedRect(-245, -38, 490, 76, 20);
            bg.lineStyle(3, p.borderColor, 1);
            bg.strokeRoundedRect(-245, -38, 490, 76, 20);
            btn.add(bg);

            // Left Emoji
            const emojiText = this.add.text(-200, 0, p.emoji, {
                fontSize: '32px'
            }).setOrigin(0.5);
            btn.add(emojiText);

            // Title
            const title = this.add.text(-160, -12, p.title, {
                fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
                fontSize: '20px',
                color: `#${p.textColor.toString(16).padStart(6, '0')}`,
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            btn.add(title);

            // Subtitle
            const sub = this.add.text(-160, 14, p.sub, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '13px',
                color: '#475569'
            }).setOrigin(0, 0.5);
            btn.add(sub);

            // Right "Oyna ▶" Pill
            const playPill = this.add.graphics();
            playPill.fillStyle(p.borderColor, 1);
            playPill.fillRoundedRect(145, -16, 85, 32, 16);
            const playText = this.add.text(187, 0, 'Oyna ▶', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '13px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            btn.add([playPill, playText]);

            btn.setSize(490, 76);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                soundManager.playTap();
                this.tweens.add({
                    targets: btn,
                    scaleX: 0.96,
                    scaleY: 0.96,
                    duration: 80,
                    yoyo: true,
                    onComplete: () => {
                        this.scene.start(p.id);
                    }
                });
            });

            // Gentle idle hover breathe
            this.tweens.add({
                targets: btn,
                y: p.y - 3,
                duration: 1800 + Math.random() * 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    private setupPitirDialogue(): void {
        const unlocked = gameState.getActiveProfile().unlockedAnimalIds.length;
        if (unlocked === 0) {
            this.pitir.say(
                'Çiftliğimize hoş geldin! Hadi bir oyun seç ve ilk hayvanını kazan!',
                'Kelime Bahçesine hoş geldin! Aşağıdaki oyunlardan birini seç!'
            );
        } else if (unlocked < 8) {
            this.pitir.say(
                `Harika bir çiftlik! ${unlocked} arkadaşımız var. Yeni hayvanlar bulalım mı?`,
                `Çiftliğimizde ${unlocked} arkadaşımız var. Hadi yeni bir oyun oynayalım!`
            );
        } else {
            this.pitir.say(
                'Tüm hayvanları topladın! Çiftliğimiz cıvıl cıvıl ve çok mutlu!',
                'Tebrikler! Tüm hayvanları topladın! Kelime Bahçesi harika görünüyor!'
            );
        }
    }

    private checkGrandCelebration(): void {
        const profile = gameState.getActiveProfile();
        if (profile.unlockedAnimalIds.length >= 8 && profile.fedAnimalIds.length >= 8) {
            // Grand celebration banner
            const banner = this.add.container(270, 190);
            const bBg = this.add.graphics();
            bBg.fillStyle(0xFFD166, 0.95);
            bBg.fillRoundedRect(-180, -28, 360, 56, 20);
            bBg.lineStyle(3, 0xF4A261, 1);
            bBg.strokeRoundedRect(-180, -28, 360, 56, 20);
            const bTxt = this.add.text(0, 0, '🌟 Çiftlik Tamamlandı! Harikasın! 🌟', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '17px',
                color: '#6A3805',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            banner.add([bBg, bTxt]);

            this.tweens.add({
                targets: banner,
                scaleX: 1.04,
                scaleY: 1.04,
                duration: 1200,
                yoyo: true,
                repeat: -1
            });
        }
    }

    update(_time: number, delta: number): void {
        // Slow gentle wandering for unlocked animals on pasture
        this.wanderingAnimals.forEach(wa => {
            if (!wa.isMoving) {
                // Occasionally pick a new target position
                if (Math.random() < 0.005) {
                    wa.targetX = Phaser.Math.Between(100, 440);
                    wa.targetY = Phaser.Math.Between(360, 510);
                    wa.isMoving = true;
                }
            } else {
                const dx = wa.targetX - wa.container.x;
                const dy = wa.targetY - wa.container.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 4) {
                    wa.isMoving = false;
                } else {
                    const step = (wa.speed * delta) / 1000;
                    wa.container.x += (dx / dist) * step;
                    wa.container.y += (dy / dist) * step;

                    // Face movement direction
                    if (dx > 0) {
                        wa.sprite.setScale(-0.22, 0.22);
                    } else {
                        wa.sprite.setScale(0.22, 0.22);
                    }
                }
            }
        });
    }
}
