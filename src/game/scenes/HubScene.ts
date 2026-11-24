import { Scene } from 'phaser';
import { authState } from '../state/authState';
import { soundManager } from '../audio/soundManager';
import { Pitir } from '../objects/Pitir';

export class HubScene extends Scene {
    private pitir!: Pitir;

    constructor() {
        super('HubScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // Sky & Meadow Background
        this.add.image(512, 384, 'farm_sky_bg');

        // Drifting Clouds
        const c1 = this.add.image(200, 110, 'cloud').setScale(0.85).setAlpha(0.9);
        const c2 = this.add.image(800, 95, 'cloud').setScale(0.75).setAlpha(0.9);
        this.tweens.add({ targets: c1, x: 1080, duration: 20000, repeat: -1, onRepeat: () => { c1.x = -100; } });
        this.tweens.add({ targets: c2, x: 1080, duration: 18000, repeat: -1, onRepeat: () => { c2.x = -100; } });

        // Sun
        this.add.image(910, 130, 'sun');

        // Platform Top Bar
        this.buildHubTopBar();

        // Pıtır in top-left
        this.pitir = new Pitir(this, 75, 145);
        this.pitir.say(
            `Hoş geldin ${authState.getUsername()}! Oynamak istediğin oyunu seçebilirsin!`,
            `Gelişim Bahçesine hoş geldin ${authState.getUsername()}! Oynamak istediğin oyunu seç!`
        );

        // Section Title: "Oyun Portalı"
        const portalHeader = this.add.container(512, 220);
        const pBg = this.add.graphics();
        pBg.fillStyle(0xFFFFFF, 0.95);
        pBg.fillRoundedRect(-220, -26, 440, 52, 20);
        pBg.lineStyle(3, 0x83C5BE, 1);
        pBg.strokeRoundedRect(-220, -26, 440, 52, 20);
        const pTxt = this.add.text(0, 0, '🎮 Terapi ve Gelişim Oyunları', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '24px',
            color: '#2D6A4F'
        }).setOrigin(0.5);
        portalHeader.add([pBg, pTxt]);

        // Build Game Cards Grid (1 Active + 3 Upcoming)
        this.buildGameGrid();
    }

    private buildHubTopBar(): void {
        const topBar = this.add.container(0, 0);

        // Background banner
        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.95);
        bg.fillRoundedRect(16, 12, 992, 60, 20);
        bg.lineStyle(2, 0xD8E2DC, 0.9);
        bg.strokeRoundedRect(16, 12, 992, 60, 20);
        topBar.add(bg);

        // Brand
        const titleText = this.add.text(45, 42, 'Gelişim Bahçesi 🌈', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '24px',
            color: '#2D6A4F'
        }).setOrigin(0, 0.5);
        topBar.add(titleText);

        // User badge
        const userText = this.add.text(380, 42, `👤 ${authState.getUsername()}`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#1E293B'
        }).setOrigin(0, 0.5);
        topBar.add(userText);

        // Logout Button
        const logoutBtn = this.add.container(830, 42);
        const lBg = this.add.graphics();
        lBg.fillStyle(0xFEE2E2, 1);
        lBg.fillRoundedRect(-55, -16, 110, 32, 16);
        lBg.lineStyle(2, 0xFCA5A5, 1);
        lBg.strokeRoundedRect(-55, -16, 110, 32, 16);
        const lTxt = this.add.text(0, 0, 'Çıkış Yap 🚪', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '15px',
            color: '#991B1B'
        }).setOrigin(0.5);
        logoutBtn.add([lBg, lTxt]);
        logoutBtn.setSize(110, 32);
        logoutBtn.setInteractive({ useHandCursor: true });
        logoutBtn.on('pointerdown', () => {
            soundManager.playTap();
            authState.logout();
            this.scene.start('LoginScene');
        });
        topBar.add(logoutBtn);

        // Therapist Settings Button (hold 3s)
        const gearBtn = this.add.container(960, 42);
        const gearCircle = this.add.circle(0, 0, 20, 0xEDF2F4);
        gearCircle.setStrokeStyle(2, 0x8D99AE);
        const gearIcon = this.add.image(0, 0, 'icon_gear').setScale(0.5);
        gearBtn.add([gearCircle, gearIcon]);
        gearBtn.setSize(40, 40);
        gearBtn.setInteractive({ useHandCursor: true });
        gearBtn.on('pointerdown', () => {
            soundManager.playTap();
            this.scene.start('TherapistScene');
        });
        topBar.add(gearBtn);
    }

    private buildGameGrid(): void {
        const games = [
            {
                id: 'kelime_bahcesi',
                title: 'Kelime Bahçesi 🌱',
                sub: 'Sevimli Hayvan Çiftliği (4-7 Yaş)',
                desc: 'Dinleme, artikülasyon ve anlamsal kategori eşleme.',
                badge: '● AKTİF OYUN',
                badgeColor: 0x52B788,
                isActive: true,
                x: 320,
                y: 385,
                color: 0xE8F8F5,
                borderColor: 0x52B788,
                previewTexture: 'custom_animal_kedi'
            },
            {
                id: 'hece_adasi',
                title: 'Hece Adası 🏝️',
                sub: 'Hece Farkındalığı & Ritim',
                desc: 'Kelimeleri hecelerine ayırma ve ritimle yaprak toplama.',
                badge: '🔒 YAKINDA',
                badgeColor: 0x94A3B8,
                isActive: false,
                x: 700,
                y: 385,
                color: 0xF1F5F9,
                borderColor: 0xCBD5E1,
                previewTexture: 'custom_animal_kopek'
            },
            {
                id: 'ses_treni',
                title: 'Ses Treni 🚂',
                sub: 'Fonolojik Farkındalık',
                desc: 'Başlangıç ve bitiş hedef seslerini vagona yükleme.',
                badge: '🔒 YAKINDA',
                badgeColor: 0x94A3B8,
                isActive: false,
                x: 320,
                y: 575,
                color: 0xF1F5F9,
                borderColor: 0xCBD5E1,
                previewTexture: 'custom_animal_tavsan'
            },
            {
                id: 'cumle_ormani',
                title: 'Cümle Ormanı 🌳',
                sub: 'Cümle Kurma & İfade Edici Dil',
                desc: 'Özne, nesne ve eylem kartlarıyla eğlenceli cümleler kurma.',
                badge: '🔒 YAKINDA',
                badgeColor: 0x94A3B8,
                isActive: false,
                x: 700,
                y: 575,
                color: 0xF1F5F9,
                borderColor: 0xCBD5E1,
                previewTexture: 'custom_animal_kuzu'
            }
        ];

        games.forEach((game, index) => {
            const card = this.add.container(game.x, game.y);

            // Card background (350x156)
            const bg = this.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.98);
            bg.fillRoundedRect(-175, -78, 350, 156, 22);

            // Gray background for inactive games, pastel tint for active game
            bg.fillStyle(game.isActive ? game.color : 0xF1F5F9, game.isActive ? 0.5 : 0.9);
            bg.fillRoundedRect(-175, -78, 350, 156, 22);

            bg.lineStyle(game.isActive ? 4 : 2, game.isActive ? game.borderColor : 0xCBD5E1, 1);
            bg.strokeRoundedRect(-175, -78, 350, 156, 22);
            card.add(bg);

            // Status Badge
            const badgeBg = this.add.graphics();
            badgeBg.fillStyle(game.badgeColor, 1);
            badgeBg.fillRoundedRect(-160, -68, game.isActive ? 105 : 95, 24, 12);
            const badgeText = this.add.text(game.isActive ? -108 : -112, -56, game.badge, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '12px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add([badgeBg, badgeText]);

            // Title (Muted slate gray if inactive)
            const title = this.add.text(-160, -32, game.title, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '22px',
                color: game.isActive ? '#1E293B' : '#64748B',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            card.add(title);

            // Subtitle
            const sub = this.add.text(-160, -6, game.sub, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '14px',
                color: game.isActive ? '#475569' : '#94A3B8'
            }).setOrigin(0, 0.5);
            card.add(sub);

            // Description
            const desc = this.add.text(-160, 20, game.desc, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '12px',
                color: game.isActive ? '#64748B' : '#94A3B8',
                wordWrap: { width: 215 }
            }).setOrigin(0, 0.5);
            card.add(desc);

            // Right Preview Avatar (Grayscale tinted if inactive)
            const texKey = this.textures.exists(game.previewTexture) ? game.previewTexture : 'animal_kedi';
            const preview = this.add.image(115, 0, texKey).setScale(0.22);
            if (!game.isActive) {
                preview.setTint(0x94A3B8);
                preview.setAlpha(0.55);
            }
            card.add(preview);

            if (game.isActive) {
                // Interactive Play Button
                const btn = this.add.container(-60, 52);
                const bBg = this.add.graphics();
                bBg.fillStyle(0x52B788, 1);
                bBg.fillRoundedRect(-85, -16, 170, 32, 16);
                bBg.lineStyle(2, 0x2D6A4F, 1);
                bBg.strokeRoundedRect(-85, -16, 170, 32, 16);
                const bTxt = this.add.text(0, 0, 'Oyuna Başla 🚜', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '15px',
                    color: '#FFFFFF'
                }).setOrigin(0.5);
                btn.add([bBg, bTxt]);
                card.add(btn);

                card.setSize(350, 156);
                card.setInteractive({ useHandCursor: true });
                card.on('pointerdown', () => {
                    soundManager.playSuccessBing();
                    this.scene.start('FarmScene');
                });

                card.on('pointerover', () => {
                    this.tweens.add({
                        targets: card,
                        scaleX: 1.025,
                        scaleY: 1.025,
                        duration: 150,
                        ease: 'Sine.easeOut'
                    });
                });

                card.on('pointerout', () => {
                    this.tweens.add({
                        targets: card,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 150,
                        ease: 'Sine.easeOut'
                    });
                });
            } else {
                // Inactive lock tag with muted pill background
                const lockPill = this.add.graphics();
                lockPill.fillStyle(0xE2E8F0, 1);
                lockPill.fillRoundedRect(-140, 38, 130, 28, 14);
                const lockTxt = this.add.text(-75, 52, '🔒 Çok Yakında', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '13px',
                    color: '#64748B',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                card.add([lockPill, lockTxt]);
                card.setAlpha(0.8);
            }

            // Staggered pop-in animation on scene load
            card.setScale(0);
            this.tweens.add({
                targets: card,
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                delay: index * 80,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Only start subtle idle float AFTER pop-in completes, for the active game
                    if (game.isActive) {
                        this.tweens.add({
                            targets: card,
                            y: game.y - 4,
                            duration: 2000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            });
        });
    }
}
