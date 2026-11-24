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

        // Background
        this.add.image(512, 384, 'farm_sky_bg');

        // Top Bar
        new TopBar(this, {
            showBack: true,
            onBack: () => {
                this.scene.start('FarmScene');
            }
        });

        // Header Title Card
        const titleCard = this.add.container(512, 105);
        const tBg = this.add.graphics();
        tBg.fillStyle(0xFFFFFF, 0.95);
        tBg.fillRoundedRect(-220, -25, 440, 50, 20);
        tBg.lineStyle(3, 0xD4A373, 1);
        tBg.strokeRoundedRect(-220, -25, 440, 50, 20);
        const unlockedCount = gameState.getActiveProfile().unlockedAnimalIds.length;
        const titleText = this.add.text(0, 0, `📖 Hayvan Albümü (${unlockedCount}/8 Kart)`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '22px',
            color: '#6A3805'
        }).setOrigin(0.5);
        titleCard.add([tBg, titleText]);

        // Cards Grid (4 columns x 2 rows)
        this.cardsContainer = this.add.container(0, 0);
        this.buildAlbumGrid();
    }

    private buildAlbumGrid(): void {
        const profile = gameState.getActiveProfile();
        const startX = 180;
        const spacingX = 220;
        const startY = 240;
        const spacingY = 260;

        ANIMALS.forEach((animal, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const isUnlocked = profile.unlockedAnimalIds.includes(animal.id);
            const isFed = profile.fedAnimalIds.includes(animal.id);

            const card = this.add.container(x, y);

            // Card body (190x230)
            const cardBg = this.add.graphics();
            cardBg.fillStyle(isUnlocked ? 0xFFFFFF : 0xF8F9FA, 0.96);
            cardBg.fillRoundedRect(-95, -115, 190, 230, 20);
            cardBg.lineStyle(4, isUnlocked ? animal.bgColor : 0xCBD5E1, 1);
            cardBg.strokeRoundedRect(-95, -115, 190, 230, 20);
            card.add(cardBg);

            if (isUnlocked) {
                // Unlocked Animal Card (scaled for 512x512 full body)
                const sprite = this.add.image(0, -36, getAnimalTextureKey(this, animal.id)).setScale(0.30);
                card.add(sprite);

                // Name
                const name = this.add.text(0, 44, animal.name, {
                    fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
                    fontSize: '22px',
                    color: '#2B2D42'
                }).setOrigin(0.5);
                card.add(name);

                // Syllables
                const syls = this.add.text(0, 70, animal.syllables.join(' - '), {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '15px',
                    color: '#D47A00'
                }).setOrigin(0.5);
                card.add(syls);

                // Target sounds & Feed badge
                const footerText = isFed ? `Yemi: ${animal.foodName} ${animal.foodEmoji}` : 'Yem aranıyor...';
                const feedBadge = this.add.text(0, 94, footerText, {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '13px',
                    color: isFed ? '#2D6A4F' : '#8D99AE'
                }).setOrigin(0.5);
                card.add(feedBadge);

                // Interactive tap to speak
                card.setSize(190, 230);
                card.setInteractive({ useHandCursor: true });
                card.on('pointerdown', () => {
                    this.tapCard(card, animal);
                });
            } else {
                // Locked Mystery Card
                const eggIcon = this.add.image(0, -25, 'egg_intact').setScale(0.65).setAlpha(0.6);
                card.add(eggIcon);

                const lockText = this.add.text(0, 48, '???', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '26px',
                    color: '#94A3B8'
                }).setOrigin(0.5);
                card.add(lockText);

                const hint = this.add.text(0, 80, 'Mini oyun oyna!', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '14px',
                    color: '#64748B'
                }).setOrigin(0.5);
                card.add(hint);
            }

            // Animate card entrance
            card.setScale(0);
            this.tweens.add({
                targets: card,
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                delay: index * 40,
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
