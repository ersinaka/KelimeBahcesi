import * as Phaser from 'phaser';
import { Scene, GameObjects } from 'phaser';
import { soundManager } from '../audio/soundManager';

export class Pitir extends GameObjects.Container {
    private birdSprite: GameObjects.Image;
    private bubbleContainer: GameObjects.Container;
    private bubbleBg: GameObjects.Graphics;
    private bubbleText: GameObjects.Text;
    private speakerBtn: GameObjects.Container;
    private currentSpokenText: string = '';
    private bounceTween?: Phaser.Tweens.Tween;

    constructor(scene: Scene, x: number, y: number, showBubble: boolean = true) {
        super(scene, x, y);

        // Bird Sprite
        this.birdSprite = scene.add.image(0, 0, 'pitir');
        this.birdSprite.setScale(0.72);
        this.add(this.birdSprite);

        // Gentle breathing / idle bobbing
        this.bounceTween = scene.tweens.add({
            targets: this.birdSprite,
            y: -5,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Speech Bubble
        this.bubbleContainer = scene.add.container(50, -20);
        this.add(this.bubbleContainer);

        this.bubbleBg = scene.add.graphics();
        this.bubbleContainer.add(this.bubbleBg);

        this.bubbleText = scene.add.text(18, -4, '', {
            fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", sans-serif',
            fontSize: '19px',
            color: '#2B2D42',
            wordWrap: { width: 300 },
            align: 'left'
        }).setOrigin(0, 0.5);
        this.bubbleContainer.add(this.bubbleText);

        // Speaker / Listen Again Button
        this.speakerBtn = scene.add.container(350, -4);
        const spkBg = scene.add.circle(0, 0, 18, 0x52B788);
        const spkIcon = scene.add.image(0, 0, 'icon_speaker').setScale(0.45);
        this.speakerBtn.add([spkBg, spkIcon]);
        this.speakerBtn.setSize(38, 38);
        this.speakerBtn.setInteractive({ useHandCursor: true });
        this.speakerBtn.on('pointerdown', () => {
            soundManager.playTap();
            if (this.currentSpokenText) {
                this.hop();
                soundManager.speak(this.currentSpokenText);
            }
        });
        this.bubbleContainer.add(this.speakerBtn);

        this.birdSprite.setInteractive({ useHandCursor: true });
        this.birdSprite.on('pointerdown', () => {
            soundManager.playBounce();
            this.hop();
            if (this.currentSpokenText) {
                soundManager.speak(this.currentSpokenText);
            }
        });

        if (!showBubble) {
            this.bubbleContainer.setVisible(false);
        }

        scene.add.existing(this);
    }

    private drawBubble(width: number, height: number): void {
        this.bubbleBg.clear();

        // Shadow
        this.bubbleBg.fillStyle(0x000000, 0.08);
        this.bubbleBg.fillRoundedRect(4, -height / 2 + 4, width, height, 18);

        // Bubble body
        this.bubbleBg.fillStyle(0xFFFFFF, 0.96);
        this.bubbleBg.fillRoundedRect(0, -height / 2, width, height, 18);
        this.bubbleBg.lineStyle(3, 0xBEE1E6, 1);
        this.bubbleBg.strokeRoundedRect(0, -height / 2, width, height, 18);

        // Bubble pointer tail towards Pıtır
        this.bubbleBg.fillStyle(0xFFFFFF, 0.96);
        this.bubbleBg.beginPath();
        this.bubbleBg.moveTo(2, -2);
        this.bubbleBg.lineTo(-14, 8);
        this.bubbleBg.lineTo(12, 14);
        this.bubbleBg.closePath();
        this.bubbleBg.fill();
        this.bubbleBg.lineStyle(3, 0xBEE1E6, 1);
        this.bubbleBg.beginPath();
        this.bubbleBg.moveTo(2, -2);
        this.bubbleBg.lineTo(-14, 8);
        this.bubbleBg.lineTo(12, 14);
        this.bubbleBg.stroke();
    }

    public say(text: string, spokenText?: string, onComplete?: () => void): void {
        this.currentSpokenText = spokenText || text;
        this.bubbleContainer.setVisible(true);
        this.bubbleText.setText(text);

        const bounds = this.bubbleText.getBounds();
        const bubbleWidth = Math.max(260, bounds.width + 80);
        const bubbleHeight = Math.max(64, bounds.height + 26);

        this.drawBubble(bubbleWidth, bubbleHeight);
        this.speakerBtn.setX(bubbleWidth - 30);

        // Bubble pop-in animation
        this.bubbleContainer.setScale(0.8);
        this.bubbleContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: this.bubbleContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 250,
            ease: 'Back.easeOut'
        });

        this.hop();
        soundManager.speak(this.currentSpokenText, onComplete);
    }

    public hop(): void {
        this.scene.tweens.add({
            targets: this.birdSprite,
            scaleY: 0.75,
            scaleX: 0.95,
            duration: 120,
            yoyo: true,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.birdSprite,
                    y: -24,
                    duration: 180,
                    yoyo: true,
                    ease: 'Quad.easeOut'
                });
            }
        });
    }

    public celebrate(text: string = 'Harikasın!'): void {
        this.say(text);
        soundManager.playChime();

        // Little happy wiggle
        this.scene.tweens.add({
            targets: this.birdSprite,
            angle: { from: -12, to: 12 },
            duration: 150,
            repeat: 3,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.birdSprite.angle = 0;
            }
        });
    }

    public encourage(text: string = 'Hadi tekrar deneyelim!'): void {
        this.say(text);
        soundManager.playTryAgain();

        // Gentle nod
        this.scene.tweens.add({
            targets: this.birdSprite,
            y: 8,
            duration: 180,
            repeat: 1,
            yoyo: true
        });
    }

    public hideBubble(): void {
        this.bubbleContainer.setVisible(false);
    }

    public destroy(fromScene?: boolean): void {
        if (this.bounceTween) {
            this.bounceTween.stop();
        }
        super.destroy(fromScene);
    }
}
