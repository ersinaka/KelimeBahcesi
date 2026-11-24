import { Scene } from 'phaser';
import { getAnimalTextureKey } from '../data/animals';
import { soundManager } from '../audio/soundManager';
import { Pitir } from '../objects/Pitir';

export class MainMenu extends Scene {
    private pitir!: Pitir;

    constructor() {
        super('MainMenu');
    }

    create(): void {
        // Pastel Meadow Background
        this.add.image(512, 384, 'farm_sky_bg');

        // Drifting Clouds
        const c1 = this.add.image(220, 120, 'cloud').setScale(0.85).setAlpha(0.9);
        const c2 = this.add.image(780, 100, 'cloud').setScale(0.75).setAlpha(0.9);
        this.tweens.add({
            targets: c1,
            x: 1080,
            duration: 20000,
            repeat: -1,
            onRepeat: () => { c1.x = -100; }
        });
        this.tweens.add({
            targets: c2,
            x: 1080,
            duration: 18000,
            repeat: -1,
            onRepeat: () => { c2.x = -100; }
        });

        // Sun
        this.add.image(910, 130, 'sun');

        // Back to Hub Portal button
        const hubBtn = this.add.container(940, 42);
        const hBg = this.add.graphics();
        hBg.fillStyle(0xFFFFFF, 0.95);
        hBg.fillRoundedRect(-50, -18, 100, 36, 18);
        hBg.lineStyle(2, 0x83C5BE, 1);
        hBg.strokeRoundedRect(-50, -18, 100, 36, 18);
        const hTxt = this.add.text(0, 0, '🏠 Portal', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '15px',
            color: '#006D77'
        }).setOrigin(0.5);
        hubBtn.add([hBg, hTxt]);
        hubBtn.setSize(100, 36);
        hubBtn.setInteractive({ useHandCursor: true });
        hubBtn.on('pointerdown', () => {
            soundManager.playTap();
            this.scene.start('HubScene');
        });

        // Main Title Card Banner
        const titleContainer = this.add.container(512, 230);
        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(0xFFFFFF, 0.96);
        bannerBg.fillRoundedRect(-290, -80, 580, 160, 32);
        bannerBg.lineStyle(6, 0x83C5BE, 1);
        bannerBg.strokeRoundedRect(-290, -80, 580, 160, 32);
        titleContainer.add(bannerBg);

        // Title Text
        const title = this.add.text(0, -25, 'Kelime Bahçesi 🌱', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '52px',
            color: '#2D6A4F',
            stroke: '#E8F5E9',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        titleContainer.add(title);

        // Subtitle - "Her kelime, çiftliğime yeni bir arkadaş getiriyor." (from GDD)
        const sub = this.add.text(0, 35, '"Her kelime, çiftliğime yeni bir arkadaş getiriyor."', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#D47A00',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5);
        titleContainer.add(sub);

        // Gentle floating of title
        this.tweens.add({
            targets: titleContainer,
            y: 220,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Farm animals preview full body illustrations
        const previewAnimals = ['kedi', 'kopek', 'tavsan', 'kuzu'];
        previewAnimals.forEach((id, i) => {
            const x = 200 + i * 210;
            const y = 445;
            const spr = this.add.image(x, y, getAnimalTextureKey(this, id)).setScale(0.28);
            this.tweens.add({
                targets: spr,
                y: y - 10,
                duration: 1200 + i * 250,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Big Friendly "Oyuna Başla" Button (min 260x80px)
        const playBtn = this.add.container(512, 590);
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x52B788, 1);
        btnBg.fillRoundedRect(-140, -40, 280, 80, 40);
        btnBg.lineStyle(4, 0x2D6A4F, 1);
        btnBg.strokeRoundedRect(-140, -40, 280, 80, 40);

        const btnText = this.add.text(0, 0, 'Çiftliğe Başla 🏡', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        playBtn.add([btnBg, btnText]);
        playBtn.setSize(280, 80);
        playBtn.setInteractive({ useHandCursor: true });

        playBtn.on('pointerdown', () => {
            soundManager.playTap();
            this.tweens.add({
                targets: playBtn,
                scaleX: 0.92,
                scaleY: 0.92,
                duration: 90,
                yoyo: true,
                onComplete: () => {
                    this.scene.start('FarmScene');
                }
            });
        });

        // Gentle pulse on play button
        this.tweens.add({
            targets: playBtn,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Pıtır the guide character (top-left sky)
        this.pitir = new Pitir(this, 75, 145);
        this.pitir.say(
            'Merhaba! Ben Pıtır! Çiftliğimizde oynamaya hazır mısın?',
            'Merhaba! Ben Pıtır! Kelime Bahçesine hoş geldin! Hadi başlayalım!'
        );
    }
}
