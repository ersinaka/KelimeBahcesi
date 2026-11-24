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

        // 1. Pastoral Farm Landscape Background
        this.add.image(512, 384, 'farm_sky_bg');

        // Drifting Clouds
        this.createClouds();

        // Sun
        const sun = this.add.image(910, 130, 'sun');
        this.tweens.add({
            targets: sun,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Fluttering Butterflies
        this.createButterflies();

        // Farm elements: Trees and Feed Silo
        this.add.image(80, 470, 'tree').setScale(0.9);
        this.add.image(960, 450, 'tree').setScale(0.85);
        this.add.image(930, 520, 'feed_silo');

        // Wooden picket fence along back pasture
        for (let x = 30; x < 1024; x += 95) {
            this.add.image(x, 480, 'fence').setScale(0.95);
        }

        // 2. Unlocked Decors based on animal count:
        // 3 hayvanda ahır, 6 hayvanda gölet, 8 hayvanda çiçek bahçesi
        this.createDynamicDecors();

        // 3. Wandering Animals or Starter Egg
        this.setupFarmInhabitants();

        // 4. Mini-Game Gateways / Portals (Bottom region)
        this.createMiniGamePortals();

        // 5. Guide Character: Pıtır (Placed in top-left sky, away from pasture & portals)
        this.pitir = new Pitir(this, 75, 145);
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
            { x: 200, y: 110, s: 0.8, speed: 18000 },
            { x: 580, y: 130, s: 1.0, speed: 22000 },
            { x: 880, y: 95, s: 0.7, speed: 16000 }
        ];

        cloudPositions.forEach(c => {
            const cloud = this.add.image(c.x, c.y, 'cloud').setScale(c.s).setAlpha(0.9);
            this.clouds.push(cloud);
            this.tweens.add({
                targets: cloud,
                x: 1080,
                duration: c.speed,
                ease: 'Linear',
                repeat: -1,
                onRepeat: () => {
                    cloud.x = -100;
                }
            });
        });
    }

    private createButterflies(): void {
        const bfly1 = this.add.image(280, 430, 'butterfly').setScale(0.8);
        const bfly2 = this.add.image(750, 480, 'butterfly').setScale(0.7);
        this.butterflies.push(bfly1, bfly2);

        [bfly1, bfly2].forEach((bf, i) => {
            this.tweens.add({
                targets: bf,
                x: bf.x + (i === 0 ? 80 : -60),
                y: bf.y + (i === 0 ? -40 : -30),
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
            this.add.image(220, 440, 'barn');
            // Gentle decorative smoke/star on barn
            const star = this.add.image(220, 340, 'star_gold').setScale(0.4);
            this.tweens.add({
                targets: star,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 1500,
                yoyo: true,
                repeat: -1
            });
        }

        // 6 hayvanda gölet (Pond at 6+ animals)
        if (unlockedCount >= 6) {
            this.add.image(520, 480, 'pond');
        }

        // 8 hayvanda çiçek bahçesi (Flower Garden at 8 animals)
        if (unlockedCount >= 8) {
            this.add.image(810, 470, 'flower_garden');
        }
    }

    private setupFarmInhabitants(): void {
        const profile = gameState.getActiveProfile();
        const unlockedIds = profile.unlockedAnimalIds;

        if (unlockedIds.length === 0) {
            // Initial Empty Farm: A gentle rocking egg on nest with signpost
            const eggContainer = this.add.container(512, 530);

            // Straw nest
            const nest = this.add.graphics();
            nest.fillStyle(0xDDA15E, 0.9);
            nest.fillEllipse(0, 30, 90, 30);
            eggContainer.add(nest);

            const starterEgg = this.add.image(0, 0, 'egg_intact').setScale(0.9);
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
            signBg.fillRoundedRect(390, 580, 244, 42, 14);
            signBg.lineStyle(3, 0xD4A373, 1);
            signBg.strokeRoundedRect(390, 580, 244, 42, 14);
            this.add.text(512, 601, 'İlk Yumurtan Burada! 🐣', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '18px',
                color: '#6A3805'
            }).setOrigin(0.5);

            eggContainer.setSize(90, 90);
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

        // Wandering Unlocked Animals
        const availableSlots = [
            { x: 230, y: 530 },
            { x: 380, y: 510 },
            { x: 540, y: 540 },
            { x: 690, y: 515 },
            { x: 820, y: 535 },
            { x: 300, y: 560 },
            { x: 460, y: 565 },
            { x: 620, y: 560 }
        ];

        unlockedIds.forEach((id, index) => {
            const animal = getAnimalById(id);
            if (!animal) return;

            const slot = availableSlots[index % availableSlots.length];
            const container = this.add.container(slot.x, slot.y);

            // Shadow
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.12);
            shadow.fillEllipse(0, 42, 60, 18);
            container.add(shadow);

            // Animal Sprite (scaled for 512x512 full body)
            const sprite = this.add.image(0, -10, getAnimalTextureKey(this, animal.id)).setScale(0.26);
            container.add(sprite);

            // Feed Badge if Animal is fed!
            let foodBadge: GameObjects.Container | undefined;
            if (profile.fedAnimalIds.includes(animal.id)) {
                foodBadge = this.add.container(26, -50);
                const fBg = this.add.circle(0, 0, 15, 0xFFF3B0);
                fBg.setStrokeStyle(2, 0xF6BD60);
                const fImg = this.add.image(0, 0, `food_${animal.foodId}`).setScale(0.32);
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

            container.setSize(80, 80);
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
        const portalY = 660;

        // 3 Mini-Games with big touch-friendly pill buttons (min 120x120px area)
        const portals = [
            {
                id: 'WhoIsThisScene',
                title: 'Bu Kim?',
                sub: 'Dinle & Bul',
                emoji: '👂',
                x: 370,
                color: 0x90E0EF,
                borderColor: 0x0077B6,
                textColor: 0x03045E
            },
            {
                id: 'RepeatScene',
                title: 'Tekrar Et!',
                sub: 'Söyle & Kazan',
                emoji: '🗣️',
                x: 600,
                color: 0xFFCAD4,
                borderColor: 0xD90429,
                textColor: 0x590D22
            },
            {
                id: 'WhatEatsScene',
                title: 'Ne Yer?',
                sub: 'Yemini Bul',
                emoji: '🥕',
                x: 830,
                color: 0xD8F3DC,
                borderColor: 0x2D6A4F,
                textColor: 0x081C15
            }
        ];

        portals.forEach(p => {
            const btn = this.add.container(p.x, portalY);

            // Card body (190x95)
            const bg = this.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.96);
            bg.fillRoundedRect(-95, -45, 190, 90, 22);
            bg.fillStyle(p.color, 0.45);
            bg.fillRoundedRect(-95, -45, 190, 90, 22);
            bg.lineStyle(4, p.borderColor, 1);
            bg.strokeRoundedRect(-95, -45, 190, 90, 22);
            btn.add(bg);

            // Portal Emoji & Icon
            const emojiText = this.add.text(-50, -4, p.emoji, {
                fontSize: '36px'
            }).setOrigin(0.5);
            btn.add(emojiText);

            // Portal Title
            const title = this.add.text(12, -14, p.title, {
                fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
                fontSize: '22px',
                color: `#${p.textColor.toString(16).padStart(6, '0')}`
            }).setOrigin(0.5, 0.5);
            btn.add(title);

            // Portal Subtitle
            const sub = this.add.text(12, 16, p.sub, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '15px',
                color: '#555B6E'
            }).setOrigin(0.5, 0.5);
            btn.add(sub);

            btn.setSize(190, 90);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                soundManager.playTap();
                this.tweens.add({
                    targets: btn,
                    scaleX: 0.94,
                    scaleY: 0.94,
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
                y: portalY - 4,
                duration: 1600 + Math.random() * 500,
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
                'Çiftliğimize hoş geldin! Hadi bir oyun seçelim ve ilk hayvanımızı kazanalım!',
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
            const banner = this.add.container(512, 180);
            const bBg = this.add.graphics();
            bBg.fillStyle(0xFFD166, 0.95);
            bBg.fillRoundedRect(-220, -35, 440, 70, 24);
            bBg.lineStyle(4, 0xF4A261, 1);
            bBg.strokeRoundedRect(-220, -35, 440, 70, 24);
            const bTxt = this.add.text(0, 0, '🌟 Çiftlik Tamamlandı! Harikasın! 🌟', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '22px',
                color: '#6A3805'
            }).setOrigin(0.5);
            banner.add([bBg, bTxt]);

            this.tweens.add({
                targets: banner,
                scaleX: 1.05,
                scaleY: 1.05,
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
                    wa.targetX = Phaser.Math.Between(200, 850);
                    wa.targetY = Phaser.Math.Between(510, 570);
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
                        wa.sprite.setScale(-0.26, 0.26);
                    } else {
                        wa.sprite.setScale(0.26, 0.26);
                    }
                }
            }
        });
    }
}
