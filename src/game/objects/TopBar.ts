import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { authState } from '../state/authState';
import { soundManager } from '../audio/soundManager';

export interface TopBarConfig {
    showBack?: boolean;
    onBack?: () => void;
    showAlbum?: boolean;
    onAlbum?: () => void;
    showHub?: boolean;
    onHub?: () => void;
    showTherapist?: boolean;
    onTherapist?: () => void;
}

export class TopBar extends GameObjects.Container {
    private starText: GameObjects.Text;
    private profileText: GameObjects.Text;
    private holdProgressGfx?: GameObjects.Graphics;
    private holdTimer?: Phaser.Time.TimerEvent;
    private holdStartTime: number = 0;
    private holdDuration: number = 3000; // 3 seconds per GDD requirement
    private isHolding: boolean = false;
    private holdRingRadius: number = 26;
    private gearPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(scene: Scene, config: TopBarConfig = {}) {
        super(scene, 0, 0);

        // Header pastel pill banner background
        const bg = scene.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.88);
        bg.fillRoundedRect(16, 12, 992, 60, 20);
        bg.lineStyle(2, 0xD8E2DC, 0.9);
        bg.strokeRoundedRect(16, 12, 992, 60, 20);
        this.add(bg);

        // 1. Back button (optional)
        if (config.showBack) {
            const backBtn = scene.add.container(52, 42);
            const backCircle = scene.add.circle(0, 0, 22, 0xFFE5D9);
            backCircle.setStrokeStyle(2, 0xF3A683);
            const backText = scene.add.text(0, -1, '◀', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '22px',
                color: '#D4A373'
            }).setOrigin(0.5);
            backBtn.add([backCircle, backText]);
            backBtn.setSize(44, 44);
            backBtn.setInteractive({ useHandCursor: true });
            backBtn.on('pointerdown', () => {
                soundManager.playTap();
                if (config.onBack) config.onBack();
            });
            this.add(backBtn);
        }

        // Title / Game Name
        const titleText = scene.add.text(config.showBack ? 95 : 45, 42, 'Kelime Bahçesi 🌱', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '24px',
            color: '#2D6A4F'
        }).setOrigin(0, 0.5);
        this.add(titleText);

        // User / Profile Badge
        this.profileText = scene.add.text(320, 42, `👤 ${authState.getUsername()}`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#1E293B'
        }).setOrigin(0, 0.5);
        this.add(this.profileText);

        // Star Counter Badge
        const starContainer = scene.add.container(530, 42);
        const starBg = scene.add.graphics();
        starBg.fillStyle(0xFFF3B0, 0.95);
        starBg.fillRoundedRect(-15, -18, 105, 36, 18);
        starBg.lineStyle(2, 0xFFD166, 1);
        starBg.strokeRoundedRect(-15, -18, 105, 36, 18);
        const starIcon = scene.add.image(2, 0, 'star_gold').setScale(0.5);
        this.starText = scene.add.text(28, 0, `${gameState.getActiveProfile().stars}`, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '19px',
            color: '#D47A00'
        }).setOrigin(0, 0.5);
        starContainer.add([starBg, starIcon, this.starText]);
        this.add(starContainer);

        // Super App Hub Portal Button (returns to game selection)
        if (config.showHub !== false) {
            const hubBtn = scene.add.container(685, 42);
            const hubBg = scene.add.graphics();
            hubBg.fillStyle(0xEDF6F9, 0.95);
            hubBg.fillRoundedRect(-15, -18, 100, 36, 18);
            hubBg.lineStyle(2, 0x83C5BE, 1);
            hubBg.strokeRoundedRect(-15, -18, 100, 36, 18);
            const hubLabel = scene.add.text(35, 0, '🏠 Portal', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '16px',
                color: '#006D77'
            }).setOrigin(0.5);
            hubBtn.add([hubBg, hubLabel]);
            hubBtn.setSize(100, 36);
            hubBtn.setInteractive({ useHandCursor: true });
            hubBtn.on('pointerdown', () => {
                soundManager.playTap();
                if (config.onHub) {
                    config.onHub();
                } else {
                    scene.scene.start('HubScene');
                }
            });
            this.add(hubBtn);
        }

        // Album Button (optional)
        if (config.showAlbum) {
            const albumBtn = scene.add.container(820, 42);
            const albBg = scene.add.graphics();
            albBg.fillStyle(0xFFE5D9, 0.95);
            albBg.fillRoundedRect(-15, -18, 100, 36, 18);
            albBg.lineStyle(2, 0xF4ACB7, 1);
            albBg.strokeRoundedRect(-15, -18, 100, 36, 18);
            const albIcon = scene.add.image(2, 0, 'icon_album').setScale(0.45);
            const albLabel = scene.add.text(26, 0, 'Albüm', {
                fontFamily: 'Fredoka, Quicksand, sans-serif',
                fontSize: '17px',
                color: '#B56576'
            }).setOrigin(0, 0.5);
            albumBtn.add([albBg, albIcon, albLabel]);
            albumBtn.setSize(100, 36);
            albumBtn.setInteractive({ useHandCursor: true });
            albumBtn.on('pointerdown', () => {
                soundManager.playTap();
                if (config.onAlbum) config.onAlbum();
            });
            this.add(albumBtn);
        }

        // Therapist Gear Button with 3-second hold guard
        if (config.showTherapist) {
            this.gearPos = { x: 960, y: 42 };
            const gearBtn = scene.add.container(this.gearPos.x, this.gearPos.y);

            const gearCircle = scene.add.circle(0, 0, 22, 0xEDF2F4);
            gearCircle.setStrokeStyle(2, 0x8D99AE);
            const gearIcon = scene.add.image(0, 0, 'icon_gear').setScale(0.55);
            gearBtn.add([gearCircle, gearIcon]);
            gearBtn.setSize(44, 44);
            gearBtn.setInteractive({ useHandCursor: true });

            this.holdProgressGfx = scene.add.graphics();
            this.add(this.holdProgressGfx);

            gearBtn.on('pointerdown', () => {
                this.startHold(config.onTherapist);
            });

            const cancelHold = () => {
                this.cancelHold();
            };

            gearBtn.on('pointerup', cancelHold);
            gearBtn.on('pointerout', cancelHold);

            this.add(gearBtn);
        }

        scene.add.existing(this);
    }

    private startHold(onComplete?: () => void): void {
        this.isHolding = true;
        this.holdStartTime = this.scene.time.now;
        soundManager.playTap();

        if (this.holdTimer) {
            this.holdTimer.remove();
        }

        // Update hold visual ring
        this.holdTimer = this.scene.time.addEvent({
            delay: 30,
            repeat: -1,
            callback: () => {
                if (!this.isHolding) return;
                const elapsed = this.scene.time.now - this.holdStartTime;
                const progress = Math.min(1, elapsed / this.holdDuration);

                if (this.holdProgressGfx) {
                    this.holdProgressGfx.clear();
                    // Draw outer holding arc
                    this.holdProgressGfx.lineStyle(5, 0x52B788, 1);
                    this.holdProgressGfx.beginPath();
                    this.holdProgressGfx.arc(
                        this.gearPos.x,
                        this.gearPos.y,
                        this.holdRingRadius,
                        -Math.PI / 2,
                        -Math.PI / 2 + Math.PI * 2 * progress
                    );
                    this.holdProgressGfx.strokePath();
                }

                if (progress >= 1) {
                    this.cancelHold();
                    soundManager.playChime();
                    if (onComplete) onComplete();
                }
            }
        });
    }

    private cancelHold(): void {
        this.isHolding = false;
        if (this.holdTimer) {
            this.holdTimer.remove();
            this.holdTimer = undefined;
        }
        if (this.holdProgressGfx) {
            this.holdProgressGfx.clear();
        }
    }

    public refresh(): void {
        this.starText.setText(`${gameState.getActiveProfile().stars}`);
        this.profileText.setText(`👤 ${authState.getUsername()}`);
    }

    public destroy(fromScene?: boolean): void {
        this.cancelHold();
        super.destroy(fromScene);
    }
}
