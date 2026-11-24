import { Scene, GameObjects } from 'phaser';

export class CelebrationEffects {
    /**
     * Creates a colorful burst of cheerful confetti particles (autism & sensory friendly)
     */
    public static spawnConfetti(scene: Scene, x: number, y: number, count: number = 24): void {
        const colors = [
            0xFFD166, // warm gold
            0xFF758F, // sweet pink
            0x4EA8DE, // sky blue
            0x52B788, // soft green
            0xF4A261, // peach
            0x9D4EDD, // soft purple
            0x06D6A0  // mint
        ];

        for (let i = 0; i < count; i++) {
            const color = colors[i % colors.length];
            const size = Phaser.Math.Between(7, 14);
            const isCircle = Math.random() < 0.45;

            let particle: GameObjects.Shape;
            if (isCircle) {
                particle = scene.add.circle(x, y, size / 2, color);
            } else {
                particle = scene.add.rectangle(x, y, size, size * 0.7, color);
            }

            // Radial velocity
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(90, 220);
            const targetX = x + Math.cos(angle) * speed;
            const targetY = y + Math.sin(angle) * speed + Phaser.Math.Between(20, 60); // gentle gravity drift

            scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                angle: Phaser.Math.Between(-360, 360),
                scaleX: { from: 1, to: 0.2 },
                scaleY: { from: 1, to: 0.2 },
                alpha: { from: 1, to: 0 },
                duration: Phaser.Math.Between(650, 1000),
                ease: 'Quad.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Spawns an animated cheerful green checkmark badge (✓) that pops with joy
     */
    public static spawnSuccessBadge(scene: Scene, x: number, y: number): GameObjects.Container {
        const container = scene.add.container(x, y);

        // Circular green badge with white border
        const badgeBg = scene.add.circle(0, 0, 34, 0x52B788);
        badgeBg.setStrokeStyle(4, 0xFFFFFF);

        // Bright checkmark icon
        const checkIcon = scene.add.image(0, 0, 'icon_check').setScale(0.75);

        container.add([badgeBg, checkIcon]);
        container.setScale(0);

        // Bouncy pop-in animation
        scene.tweens.add({
            targets: container,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 220,
            ease: 'Back.easeOut',
            onComplete: () => {
                scene.tweens.add({
                    targets: container,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    y: y - 18,
                    alpha: 0,
                    delay: 450,
                    duration: 400,
                    ease: 'Sine.easeIn',
                    onComplete: () => {
                        container.destroy();
                    }
                });
            }
        });

        return container;
    }

    /**
     * Combined celebration trigger: Checkmark badge + Confetti burst
     */
    public static triggerSuccessCelebration(scene: Scene, x: number, y: number): void {
        CelebrationEffects.spawnSuccessBadge(scene, x, y);
        CelebrationEffects.spawnConfetti(scene, x, y, 22);
    }
}
