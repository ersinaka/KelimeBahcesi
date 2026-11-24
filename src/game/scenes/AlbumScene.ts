import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { soundManager } from '../audio/soundManager';
import { ANIMALS, AnimalData, getAnimalTextureKey } from '../data/animals';
import { TopBar } from '../objects/TopBar';

export class AlbumScene extends Scene {
    private cardsContainer!: GameObjects.Container;

    constructor() {
        super('AlbumScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // Background (Mobile Portrait 540x960)
        this.add.image(270, 480, 'farm_sky_bg');

        // Top Bar
        new TopBar(this, {
            showBack: true,
            onBack: () => {
                this.scene.start('FarmScene');
            }
        });

        // Header Title Card
        const titleCard = this.add.container(270, 95);
        const tBg = this.add.graphics();
        tBg.fillStyle(0xFFFFFF, 0.95);
        tBg.fillRoundedRect(-220, -22, 440, 44, 18);
        tBg.lineStyle(2, 0xD4A373, 1);
        tBg.strokeRoundedRect(-220, -22, 440, 44, 18);
        const unlockedCount = gameState.getActiveProfile().unlockedAnimalIds.length;
        const titleText = this.add.text(0, 0, `📖 Hayvan Albümü (${unlockedCount}/8 Kart)`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#6A3805',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        titleCard.add([tBg, titleText]);

        // Cards Grid (2 columns x 4 rows for mobile portrait)
        this.cardsContainer = this.add.container(0, 0);
        this.buildAlbumGrid();

        // Bottom stats bar
        const fedCount = gameState.getActiveProfile().fedAnimalIds.length;
        const btmBar = this.add.container(270, 895);
        const btmBg = this.add.graphics();
        btmBg.fillStyle(0xFFFFFF, 0.94);
        btmBg.fillRoundedRect(-230, -20, 460, 40, 16);
        btmBg.lineStyle(2, 0x83C5BE, 1);
        btmBg.strokeRoundedRect(-230, -20, 460, 40, 16);
        const btmText = this.add.text(0, 0, `🌟 Açılan: ${unlockedCount}/8 Kart  |  Yemi Bulunan: ${fedCount}/8`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
            color: '#2D6A4F',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        btmBar.add([btmBg, btmText]);
    }

    private buildAlbumGrid(): void {
        const profile = gameState.getActiveProfile();
        const startX = 140;
        const spacingX = 260;
        const startY = 195;
        const spacingY = 165;

        ANIMALS.forEach((animal, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const isUnlocked = profile.unlockedAnimalIds.includes(animal.id);
            const isFed = profile.fedAnimalIds.includes(animal.id);

            const card = this.add.container(x, y);

            // Card body (240x150)
            const cardBg = this.add.graphics();
            cardBg.fillStyle(isUnlocked ? 0xFFFFFF : 0xF8F9FA, 0.96);
            cardBg.fillRoundedRect(-120, -75, 240, 150, 20);
            cardBg.lineStyle(3, isUnlocked ? animal.bgColor : 0xCBD5E1, 1);
            cardBg.strokeRoundedRect(-120, -75, 240, 150, 20);
            card.add(cardBg);

            if (isUnlocked) {
                // Unlocked Animal Card (scaled for 512x512 full body)
                const sprite = this.add.image(-55, -2, getAnimalTextureKey(this, animal.id)).setScale(0.20);
                card.add(sprite);

                // Name
                const name = this.add.text(20, -38, animal.name, {
                    fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
                    fontSize: '19px',
                    color: '#2B2D42',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5);
                card.add(name);

                // Syllables
                const syls = this.add.text(20, -12, animal.syllables.join(' - '), {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '13px',
                    color: '#D47A00',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5);
                card.add(syls);

                // Target sounds & Feed badge
                const footerText = isFed ? `Yemi: ${animal.foodName} ${animal.foodEmoji}` : 'Yem aranıyor...';
                const feedBadge = this.add.text(20, 14, footerText, {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '11px',
                    color: isFed ? '#2D6A4F' : '#8D99AE',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5);
                card.add(feedBadge);

                const soundText = this.add.text(20, 36, `Ses: "${animal.soundText}"`, {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '11px',
                    color: '#64748B'
                }).setOrigin(0, 0.5);
                card.add(soundText);

                // Interactive tap to speak
                card.setSize(240, 150);
                card.setInteractive({ useHandCursor: true });
                card.on('pointerdown', () => {
                    this.tapCard(card, animal);
                });
            } else {
                // Locked Mystery Card
                const eggIcon = this.add.image(-50, 0, 'egg_intact').setScale(0.55).setAlpha(0.6);
                card.add(eggIcon);

                const lockText = this.add.text(20, -14, '???', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '24px',
                    color: '#94A3B8',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5);
                card.add(lockText);

                const hint = this.add.text(20, 18, 'Mini oyun oyna!', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '12px',
                    color: '#64748B'
                }).setOrigin(0, 0.5);
                card.add(hint);
            }

            // Animate card entrance
            card.setScale(0);
            this.tweens.add({
                targets: card,
                scaleX: 1,
                scaleY: 1,
                duration: 250,
                delay: index * 35,
                ease: 'Back.easeOut'
            });

            this.cardsContainer.add(card);
        });
    }

    private tapCard(card: GameObjects.Container, animal: AnimalData): void {
        soundManager.playTap();

        // Bounce
        this.tweens.add({
            targets: card,
            scaleX: 1.06,
            scaleY: 1.06,
            duration: 120,
            yoyo: true
        });

        // Speech
        soundManager.speak(`${animal.name}! ${animal.soundText}`);
    }
}
