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
        this.add.image(270, 480, 'farm_sky_bg');

        // Drifting Clouds
        const c1 = this.add.image(120, 100, 'cloud').setScale(0.7).setAlpha(0.9);
        const c2 = this.add.image(420, 80, 'cloud').setScale(0.6).setAlpha(0.9);
        this.tweens.add({ targets: c1, x: 600, duration: 18000, repeat: -1, onRepeat: () => { c1.x = -80; } });
        this.tweens.add({ targets: c2, x: 600, duration: 15000, repeat: -1, onRepeat: () => { c2.x = -80; } });

        // Sun
        this.add.image(470, 95, 'sun').setScale(0.85);

        // Platform Top Bar
        this.buildHubTopBar();

        // Pıtır in top-left
        this.pitir = new Pitir(this, 55, 120);
        this.pitir.say(
            `Hoş geldin ${authState.getUsername()}! Oynamak istediğin oyunu seç!`,
            `Gelişim Bahçesine hoş geldin ${authState.getUsername()}! Oynamak istediğin oyunu seç!`
        );

        // Section Title: "Oyun Portalı"
        const portalHeader = this.add.container(270, 190);
        const pBg = this.add.graphics();
        pBg.fillStyle(0xFFFFFF, 0.95);
        pBg.fillRoundedRect(-180, -22, 360, 44, 18);
        pBg.lineStyle(2, 0x83C5BE, 1);
        pBg.strokeRoundedRect(-180, -22, 360, 44, 18);
        const pTxt = this.add.text(0, 0, '🎮 Terapi ve Gelişim Portalı', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '19px',
            color: '#2D6A4F',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        portalHeader.add([pBg, pTxt]);

        // Build Game Cards Grid (1 Active + 3 Upcoming)
        this.buildGameGrid();
    }

    private buildHubTopBar(): void {
        const topBar = this.add.container(0, 0);

        // Background banner (520x56)
        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.95);
        bg.fillRoundedRect(10, 10, 520, 56, 18);
        bg.lineStyle(2, 0xD8E2DC, 0.9);
        bg.strokeRoundedRect(10, 10, 520, 56, 18);
        topBar.add(bg);

        // Brand
        const titleText = this.add.text(26, 38, 'Gelişim Bahçesi 🌈', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '17px',
            color: '#2D6A4F',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        topBar.add(titleText);

        // User badge
        const userText = this.add.text(230, 38, `👤 ${authState.getUsername()}`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
            color: '#1E293B',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        topBar.add(userText);

        // Logout Button
        const logoutBtn = this.add.container(400, 38);
        const lBg = this.add.graphics();
        lBg.fillStyle(0xFEE2E2, 1);
        lBg.fillRoundedRect(-42, -14, 84, 28, 14);
        lBg.lineStyle(1.5, 0xFCA5A5, 1);
        lBg.strokeRoundedRect(-42, -14, 84, 28, 14);
        const lTxt = this.add.text(0, 0, 'Çıkış 🚪', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '13px',
            color: '#991B1B',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        logoutBtn.add([lBg, lTxt]);
        logoutBtn.setSize(84, 28);
        logoutBtn.setInteractive({ useHandCursor: true });
        logoutBtn.on('pointerdown', () => {
            soundManager.playTap();
            authState.logout();
            this.scene.start('LoginScene');
        });
        topBar.add(logoutBtn);

        // Therapist Settings Button (hold 3s)
        const gearBtn = this.add.container(490, 38);
        const gearCircle = this.add.circle(0, 0, 18, 0xEDF2F4);
        gearCircle.setStrokeStyle(2, 0x8D99AE);
        const gearIcon = this.add.image(0, 0, 'icon_gear').setScale(0.46);
        gearBtn.add([gearCircle, gearIcon]);
        gearBtn.setSize(36, 36);
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
                x: 270,
                y: 290,
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
                x: 270,
                y: 440,
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
                x: 270,
                y: 590,
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
                x: 270,
                y: 740,
                color: 0xF1F5F9,
                borderColor: 0xCBD5E1,
                previewTexture: 'custom_animal_kuzu'
            }
        ];

        games.forEach((game, index) => {
            const card = this.add.container(game.x, game.y);

            // Card background (490x135)
            const bg = this.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.98);
            bg.fillRoundedRect(-245, -67, 490, 135, 20);

            // Gray background for inactive games, pastel tint for active game
            bg.fillStyle(game.isActive ? game.color : 0xF1F5F9, game.isActive ? 0.5 : 0.9);
            bg.fillRoundedRect(-245, -67, 490, 135, 20);

            bg.lineStyle(game.isActive ? 3.5 : 2, game.isActive ? game.borderColor : 0xCBD5E1, 1);
            bg.strokeRoundedRect(-245, -67, 490, 135, 20);
            card.add(bg);

            // Status Badge
            const badgeBg = this.add.graphics();
            badgeBg.fillStyle(game.badgeColor, 1);
            badgeBg.fillRoundedRect(-230, -57, game.isActive ? 95 : 85, 22, 11);
            const badgeText = this.add.text(game.isActive ? -182 : -187, -46, game.badge, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '11px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add([badgeBg, badgeText]);

            // Title (Muted slate gray if inactive)
            const title = this.add.text(-230, -22, game.title, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '20px',
                color: game.isActive ? '#1E293B' : '#64748B',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            card.add(title);

            // Subtitle
            const sub = this.add.text(-230, 2, game.sub, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '13px',
                color: game.isActive ? '#475569' : '#94A3B8'
            }).setOrigin(0, 0.5);
            card.add(sub);

            // Description
            const desc = this.add.text(-230, 26, game.desc, {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '11px',
                color: game.isActive ? '#64748B' : '#94A3B8',
                wordWrap: { width: 320 }
            }).setOrigin(0, 0.5);
            card.add(desc);

            // Right Preview Avatar (Grayscale tinted if inactive)
            const texKey = this.textures.exists(game.previewTexture) ? game.previewTexture : 'animal_kedi';
            const preview = this.add.image(180, 0, texKey).setScale(0.20);
            if (!game.isActive) {
                preview.setTint(0x94A3B8);
                preview.setAlpha(0.55);
            }
            card.add(preview);

            if (game.isActive) {
                // Interactive Play Button
                const btn = this.add.container(-50, 48);
                const bBg = this.add.graphics();
                bBg.fillStyle(0x52B788, 1);
                bBg.fillRoundedRect(-80, -14, 160, 28, 14);
                bBg.lineStyle(1.5, 0x2D6A4F, 1);
                bBg.strokeRoundedRect(-80, -14, 160, 28, 14);
                const bTxt = this.add.text(0, 0, 'Oyuna Başla 🚜', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                btn.add([bBg, bTxt]);
                card.add(btn);

                card.setSize(490, 135);
                card.setInteractive({ useHandCursor: true });
                card.on('pointerdown', () => {
                    soundManager.playSuccessBing();
                    this.scene.start('FarmScene');
                });

                card.on('pointerover', () => {
                    this.tweens.add({
                        targets: card,
                        scaleX: 1.02,
                        scaleY: 1.02,
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
                lockPill.fillRoundedRect(-115, 34, 120, 26, 13);
                const lockTxt = this.add.text(-55, 47, '🔒 Çok Yakında', {
                    fontFamily: 'Fredoka, Quicksand, sans-serif',
                    fontSize: '12px',
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
                duration: 280,
                delay: index * 60,
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
