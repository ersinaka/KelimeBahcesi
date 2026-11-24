import { Scene } from 'phaser';

export class TextureGenerator {
    /**
     * Helper to draw rounded rectangle paths safely across all browser canvas engines
     */
    public static drawRoundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number | number[] = 8
    ): void {
        let tl = 8, tr = 8, br = 8, bl = 8;
        if (typeof r === 'number') {
            tl = tr = br = bl = Math.min(r, w / 2, h / 2);
        } else if (Array.isArray(r)) {
            if (r.length === 4) {
                [tl, tr, br, bl] = r;
            } else if (r.length === 2) {
                tl = br = r[0];
                tr = bl = r[1];
            } else if (r.length === 1) {
                tl = tr = br = bl = r[0];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + w - tr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
        ctx.lineTo(x + w, y + h - br);
        ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        ctx.lineTo(x + bl, y + h);
        ctx.quadraticCurveTo(x, y + heightOrZero(h), x, y + h - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
        ctx.closePath();
    }

    /**
     * Generates all required vector/canvas textures for the game
     */
    public static generateAll(scene: Scene): void {
        const tm = scene.textures;

        if (tm.exists('farm_sky_bg')) {
            return; // Already generated
        }

        try {
            TextureGenerator.createSkyAndHills(scene);
            TextureGenerator.createFarmDecorations(scene);
            TextureGenerator.createPitirBird(scene);
            TextureGenerator.createAnimalTextures(scene);
            TextureGenerator.createFoodTextures(scene);
            TextureGenerator.createEggsAndParticles(scene);
            TextureGenerator.createUIElements(scene);
        } catch (e) {
            console.error('Error generating textures in TextureGenerator:', e);
        }
    }

    private static createCanvas(scene: Scene, key: string, width: number, height: number): CanvasRenderingContext2D {
        const texture = scene.textures.createCanvas(key, width, height);
        if (!texture) {
            throw new Error(`Failed to create canvas texture: ${key}`);
        }
        return texture.getContext();
    }

    private static updateCanvas(scene: Scene, key: string): void {
        const texture = scene.textures.get(key);
        if (texture && 'refresh' in texture) {
            (texture as unknown as { refresh: () => void }).refresh();
        }
    }

    private static createSkyAndHills(scene: Scene): void {
        // Sky & Meadow Background for Mobile Portrait (540x960)
        const ctxSky = TextureGenerator.createCanvas(scene, 'farm_sky_bg', 540, 960);
        const gradSky = ctxSky.createLinearGradient(0, 0, 0, 960);
        gradSky.addColorStop(0, '#BBE8FF'); // soft sky blue
        gradSky.addColorStop(0.35, '#E2F3FD'); // pale cream sky
        gradSky.addColorStop(0.50, '#D8F3DC'); // transition to meadow
        gradSky.addColorStop(1, '#95D5B2'); // vibrant soft grass green
        ctxSky.fillStyle = gradSky;
        ctxSky.fillRect(0, 0, 540, 960);

        // Distant gentle mountains / hills
        ctxSky.fillStyle = '#C7E9C0';
        ctxSky.beginPath();
        ctxSky.moveTo(0, 480);
        ctxSky.bezierCurveTo(140, 440, 260, 500, 380, 460);
        ctxSky.bezierCurveTo(460, 430, 500, 470, 540, 450);
        ctxSky.lineTo(540, 960);
        ctxSky.lineTo(0, 960);
        ctxSky.closePath();
        ctxSky.fill();

        // Main rolling green meadow hill
        ctxSky.fillStyle = '#74C69D';
        ctxSky.beginPath();
        ctxSky.moveTo(0, 520);
        ctxSky.bezierCurveTo(180, 480, 360, 540, 540, 500);
        ctxSky.lineTo(540, 960);
        ctxSky.lineTo(0, 960);
        ctxSky.closePath();
        ctxSky.fill();

        // Foreground soft meadow highlight
        ctxSky.fillStyle = '#52B788';
        ctxSky.beginPath();
        ctxSky.moveTo(0, 640);
        ctxSky.bezierCurveTo(200, 600, 400, 650, 540, 610);
        ctxSky.lineTo(540, 960);
        ctxSky.lineTo(0, 960);
        ctxSky.closePath();
        ctxSky.fill();

        TextureGenerator.updateCanvas(scene, 'farm_sky_bg');

        // Cloud Texture
        const ctxCloud = TextureGenerator.createCanvas(scene, 'cloud', 180, 80);
        ctxCloud.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctxCloud.beginPath();
        ctxCloud.arc(60, 50, 30, 0, Math.PI * 2);
        ctxCloud.arc(95, 35, 35, 0, Math.PI * 2);
        ctxCloud.arc(130, 48, 26, 0, Math.PI * 2);
        ctxCloud.arc(150, 55, 20, 0, Math.PI * 2);
        ctxCloud.arc(40, 55, 20, 0, Math.PI * 2);
        ctxCloud.closePath();
        ctxCloud.fill();
        TextureGenerator.updateCanvas(scene, 'cloud');

        // Sun Texture
        const ctxSun = TextureGenerator.createCanvas(scene, 'sun', 100, 100);
        ctxSun.fillStyle = '#FFF3B0';
        ctxSun.beginPath();
        ctxSun.arc(50, 50, 36, 0, Math.PI * 2);
        ctxSun.fill();
        ctxSun.fillStyle = '#FFE66D';
        ctxSun.beginPath();
        ctxSun.arc(50, 50, 28, 0, Math.PI * 2);
        ctxSun.fill();
        TextureGenerator.updateCanvas(scene, 'sun');
    }

    private static createFarmDecorations(scene: Scene): void {
        // Red Barn (Ahır) - 220x180
        const ctxBarn = TextureGenerator.createCanvas(scene, 'barn', 220, 180);
        // Base red wall
        ctxBarn.fillStyle = '#E07A5F';
        TextureGenerator.drawRoundRect(ctxBarn, 20, 60, 180, 110, [0, 0, 12, 12]);
        ctxBarn.fill();

        // White barn trim stripes
        ctxBarn.strokeStyle = '#FFFFFF';
        ctxBarn.lineWidth = 5;
        ctxBarn.strokeRect(25, 65, 170, 100);

        // Gambrel / peaked roof
        ctxBarn.fillStyle = '#C85A32';
        ctxBarn.beginPath();
        ctxBarn.moveTo(110, 10);
        ctxBarn.lineTo(215, 65);
        ctxBarn.lineTo(5, 65);
        ctxBarn.closePath();
        ctxBarn.fill();
        ctxBarn.strokeStyle = '#FFFFFF';
        ctxBarn.lineWidth = 6;
        ctxBarn.beginPath();
        ctxBarn.moveTo(5, 65);
        ctxBarn.lineTo(110, 10);
        ctxBarn.lineTo(215, 65);
        ctxBarn.stroke();

        // Barn Door
        ctxBarn.fillStyle = '#5A3E2B';
        TextureGenerator.drawRoundRect(ctxBarn, 75, 95, 70, 80, [15, 15, 0, 0]);
        ctxBarn.fill();
        // Door cross planks
        ctxBarn.strokeStyle = '#FFFFFF';
        ctxBarn.lineWidth = 4;
        ctxBarn.beginPath();
        ctxBarn.moveTo(78, 100);
        ctxBarn.lineTo(142, 170);
        ctxBarn.moveTo(142, 100);
        ctxBarn.lineTo(78, 170);
        ctxBarn.stroke();

        // Hay loft window
        ctxBarn.fillStyle = '#FFF3B0';
        ctxBarn.beginPath();
        ctxBarn.arc(110, 48, 16, 0, Math.PI * 2);
        ctxBarn.fill();
        ctxBarn.strokeStyle = '#C85A32';
        ctxBarn.lineWidth = 3;
        ctxBarn.stroke();

        TextureGenerator.updateCanvas(scene, 'barn');

        // Pond (Gölet) - 220x110
        const ctxPond = TextureGenerator.createCanvas(scene, 'pond', 220, 110);
        ctxPond.fillStyle = '#90E0EF';
        ctxPond.beginPath();
        ctxPond.ellipse(110, 55, 95, 45, 0, 0, Math.PI * 2);
        ctxPond.fill();
        ctxPond.strokeStyle = '#CAF0F8';
        ctxPond.lineWidth = 6;
        ctxPond.stroke();

        // Water ripple highlights
        ctxPond.strokeStyle = '#FFFFFF';
        ctxPond.lineWidth = 3;
        ctxPond.beginPath();
        ctxPond.arc(90, 45, 25, 0.2 * Math.PI, 0.8 * Math.PI);
        ctxPond.stroke();
        ctxPond.beginPath();
        ctxPond.arc(140, 65, 18, 0.3 * Math.PI, 0.7 * Math.PI);
        ctxPond.stroke();

        // Lily pads
        ctxPond.fillStyle = '#52B788';
        ctxPond.beginPath();
        ctxPond.ellipse(65, 60, 14, 8, 0.2, 0, Math.PI * 2);
        ctxPond.fill();
        ctxPond.fillStyle = '#FFCAD4';
        ctxPond.beginPath();
        ctxPond.arc(67, 58, 4, 0, Math.PI * 2);
        ctxPond.fill();
        TextureGenerator.updateCanvas(scene, 'pond');

        // Flower Garden (Çiçek Bahçesi) - 180x90
        const ctxGarden = TextureGenerator.createCanvas(scene, 'flower_garden', 180, 90);
        // Garden soil bed
        ctxGarden.fillStyle = '#7F5539';
        ctxGarden.beginPath();
        ctxGarden.ellipse(90, 65, 80, 22, 0, 0, Math.PI * 2);
        ctxGarden.fill();

        // Tulips & Daisies
        const flowerCols = ['#FF758F', '#FFB703', '#9D4EDD', '#F72585', '#FF9E00'];
        const flowerPos = [
            { x: 35, y: 48, c: flowerCols[0] },
            { x: 65, y: 38, c: flowerCols[1] },
            { x: 95, y: 32, c: flowerCols[2] },
            { x: 125, y: 42, c: flowerCols[3] },
            { x: 155, y: 52, c: flowerCols[4] }
        ];
        flowerPos.forEach(fl => {
            // Stem
            ctxGarden.strokeStyle = '#2D6A4F';
            ctxGarden.lineWidth = 3;
            ctxGarden.beginPath();
            ctxGarden.moveTo(fl.x, fl.y + 16);
            ctxGarden.lineTo(fl.x, fl.y + 35);
            ctxGarden.stroke();
            // Petals
            ctxGarden.fillStyle = fl.c;
            ctxGarden.beginPath();
            ctxGarden.arc(fl.x, fl.y + 10, 10, 0, Math.PI * 2);
            ctxGarden.fill();
            // Center
            ctxGarden.fillStyle = '#FFF3B0';
            ctxGarden.beginPath();
            ctxGarden.arc(fl.x, fl.y + 10, 4, 0, Math.PI * 2);
            ctxGarden.fill();
        });
        TextureGenerator.updateCanvas(scene, 'flower_garden');

        // Wooden Tree (Ağaç) - 150x200
        const ctxTree = TextureGenerator.createCanvas(scene, 'tree', 150, 200);
        // Trunk
        ctxTree.fillStyle = '#8B5E3C';
        TextureGenerator.drawRoundRect(ctxTree, 62, 90, 26, 105, [6, 6, 0, 0]);
        ctxTree.fill();
        // Canopy
        ctxTree.fillStyle = '#40916C';
        ctxTree.beginPath();
        ctxTree.arc(75, 75, 55, 0, Math.PI * 2);
        ctxTree.arc(45, 95, 38, 0, Math.PI * 2);
        ctxTree.arc(105, 95, 38, 0, Math.PI * 2);
        ctxTree.closePath();
        ctxTree.fill();
        // Lighter leafy highlights
        ctxTree.fillStyle = '#52B788';
        ctxTree.beginPath();
        ctxTree.arc(68, 65, 35, 0, Math.PI * 2);
        ctxTree.fill();
        TextureGenerator.updateCanvas(scene, 'tree');

        // Fence Segment (Çit) - 100x60
        const ctxFence = TextureGenerator.createCanvas(scene, 'fence', 100, 60);
        ctxFence.fillStyle = '#FDF0D5';
        ctxFence.strokeStyle = '#DDA15E';
        ctxFence.lineWidth = 2;
        // Horizontal rails
        ctxFence.fillRect(0, 18, 100, 8);
        ctxFence.strokeRect(0, 18, 100, 8);
        ctxFence.fillRect(0, 36, 100, 8);
        ctxFence.strokeRect(0, 36, 100, 8);
        // Pickets
        for (let i = 10; i < 100; i += 30) {
            ctxFence.beginPath();
            ctxFence.moveTo(i, 56);
            ctxFence.lineTo(i, 10);
            ctxFence.lineTo(i + 7, 2);
            ctxFence.lineTo(i + 14, 10);
            ctxFence.lineTo(i + 14, 56);
            ctxFence.closePath();
            ctxFence.fill();
            ctxFence.stroke();
        }
        TextureGenerator.updateCanvas(scene, 'fence');

        // Feed Storage (Yem Deposu / Silo) - 110x150
        const ctxSilo = TextureGenerator.createCanvas(scene, 'feed_silo', 110, 150);
        ctxSilo.fillStyle = '#DEAB90';
        TextureGenerator.drawRoundRect(ctxSilo, 25, 40, 60, 105, [0, 0, 8, 8]);
        ctxSilo.fill();
        ctxSilo.strokeStyle = '#BC6C25';
        ctxSilo.lineWidth = 3;
        ctxSilo.strokeRect(25, 40, 60, 105);
        // Dome roof
        ctxSilo.fillStyle = '#BC6C25';
        ctxSilo.beginPath();
        ctxSilo.arc(55, 40, 30, Math.PI, 0);
        ctxSilo.closePath();
        ctxSilo.fill();
        // Cute corn / grain icon on silo
        ctxSilo.fillStyle = '#FFE66D';
        ctxSilo.beginPath();
        ctxSilo.ellipse(55, 85, 12, 18, 0, 0, Math.PI * 2);
        ctxSilo.fill();
        TextureGenerator.updateCanvas(scene, 'feed_silo');

        // Butterfly - 40x40
        const ctxBfly = TextureGenerator.createCanvas(scene, 'butterfly', 40, 40);
        ctxBfly.fillStyle = '#FF9E00';
        // Left wings
        ctxBfly.beginPath();
        ctxBfly.ellipse(13, 14, 10, 7, -0.4, 0, Math.PI * 2);
        ctxBfly.fill();
        ctxBfly.beginPath();
        ctxBfly.ellipse(14, 25, 7, 5, -0.2, 0, Math.PI * 2);
        ctxBfly.fill();
        // Right wings
        ctxBfly.beginPath();
        ctxBfly.ellipse(27, 14, 10, 7, 0.4, 0, Math.PI * 2);
        ctxBfly.fill();
        ctxBfly.beginPath();
        ctxBfly.ellipse(26, 25, 7, 5, 0.2, 0, Math.PI * 2);
        ctxBfly.fill();
        // Body
        ctxBfly.fillStyle = '#5A3E2B';
        ctxBfly.beginPath();
        ctxBfly.ellipse(20, 20, 3, 10, 0, 0, Math.PI * 2);
        ctxBfly.fill();
        TextureGenerator.updateCanvas(scene, 'butterfly');
    }

    private static createPitirBird(scene: Scene): void {
        // Pıtır the guide bird: round friendly teal bird with straw hat (140x140)
        const ctx = TextureGenerator.createCanvas(scene, 'pitir', 140, 140);

        // Bird body (round teal)
        ctx.fillStyle = '#4EA8DE';
        ctx.beginPath();
        ctx.arc(70, 75, 42, 0, Math.PI * 2);
        ctx.fill();

        // Pale creamy belly
        ctx.fillStyle = '#E2F3FD';
        ctx.beginPath();
        ctx.arc(70, 85, 28, 0, Math.PI * 2);
        ctx.fill();

        // Left wing
        ctx.fillStyle = '#56CFE1';
        ctx.beginPath();
        ctx.ellipse(32, 78, 14, 24, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(108, 78, 14, 24, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Big friendly eyes
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.arc(58, 66, 6, 0, Math.PI * 2);
        ctx.arc(82, 66, 6, 0, Math.PI * 2);
        ctx.fill();

        // Eye sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(60, 64, 2.5, 0, Math.PI * 2);
        ctx.arc(84, 64, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Rosy cheeks
        ctx.fillStyle = 'rgba(255, 154, 162, 0.6)';
        ctx.beginPath();
        ctx.arc(48, 76, 7, 0, Math.PI * 2);
        ctx.arc(92, 76, 7, 0, Math.PI * 2);
        ctx.fill();

        // Golden beak
        ctx.fillStyle = '#FFAA00';
        ctx.beginPath();
        ctx.moveTo(64, 72);
        ctx.lineTo(76, 72);
        ctx.lineTo(70, 83);
        ctx.closePath();
        ctx.fill();

        // Straw Hat!
        // Hat brim
        ctx.fillStyle = '#FFE169';
        ctx.strokeStyle = '#DDA15E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(70, 42, 38, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hat crown
        ctx.fillStyle = '#FFE169';
        TextureGenerator.drawRoundRect(ctx, 50, 18, 40, 24, [8, 8, 2, 2]);
        ctx.fill();
        ctx.stroke();

        // Hat green ribbon
        ctx.fillStyle = '#52B788';
        ctx.fillRect(50, 36, 40, 6);

        // Tiny orange feet
        ctx.fillStyle = '#FFAA00';
        ctx.beginPath();
        ctx.arc(60, 116, 7, 0, Math.PI * 2);
        ctx.arc(80, 116, 7, 0, Math.PI * 2);
        ctx.fill();

        TextureGenerator.updateCanvas(scene, 'pitir');
    }

    private static createAnimalTextures(scene: Scene): void {
        // 1. Kedi (Cat) - 🐱
        const ctxKedi = TextureGenerator.createCanvas(scene, 'animal_kedi', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxKedi, '#FFD8BE', '#FFB085');
        // Ears
        ctxKedi.fillStyle = '#F3A683';
        ctxKedi.beginPath();
        ctxKedi.moveTo(50, 60); ctxKedi.lineTo(35, 18); ctxKedi.lineTo(75, 45); ctxKedi.closePath(); ctxKedi.fill();
        ctxKedi.beginPath();
        ctxKedi.moveTo(130, 60); ctxKedi.lineTo(145, 18); ctxKedi.lineTo(105, 45); ctxKedi.closePath(); ctxKedi.fill();
        // Inner ears pink
        ctxKedi.fillStyle = '#FFCAD4';
        ctxKedi.beginPath();
        ctxKedi.moveTo(52, 54); ctxKedi.lineTo(43, 27); ctxKedi.lineTo(70, 46); ctxKedi.closePath(); ctxKedi.fill();
        ctxKedi.beginPath();
        ctxKedi.moveTo(128, 54); ctxKedi.lineTo(137, 27); ctxKedi.lineTo(110, 46); ctxKedi.closePath(); ctxKedi.fill();
        // Head
        ctxKedi.fillStyle = '#F8B195';
        ctxKedi.beginPath();
        ctxKedi.arc(90, 95, 52, 0, Math.PI * 2);
        ctxKedi.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxKedi, 74, 88, 106, 88);
        // Pink nose & mouth
        ctxKedi.fillStyle = '#FF758F';
        ctxKedi.beginPath();
        ctxKedi.moveTo(86, 102); ctxKedi.lineTo(94, 102); ctxKedi.lineTo(90, 108); ctxKedi.closePath(); ctxKedi.fill();
        // Whiskers
        ctxKedi.strokeStyle = '#5A3E2B';
        ctxKedi.lineWidth = 2.5;
        ctxKedi.beginPath();
        ctxKedi.moveTo(60, 102); ctxKedi.lineTo(40, 98);
        ctxKedi.moveTo(60, 108); ctxKedi.lineTo(42, 114);
        ctxKedi.moveTo(120, 102); ctxKedi.lineTo(140, 98);
        ctxKedi.moveTo(120, 108); ctxKedi.lineTo(138, 114);
        ctxKedi.stroke();
        TextureGenerator.updateCanvas(scene, 'animal_kedi');

        // 2. Köpek (Dog) - 🐶
        const ctxKopek = TextureGenerator.createCanvas(scene, 'animal_kopek', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxKopek, '#F5EBE0', '#D4A373');
        // Head
        ctxKopek.fillStyle = '#E6CCB2';
        ctxKopek.beginPath();
        ctxKopek.arc(90, 95, 52, 0, Math.PI * 2);
        ctxKopek.fill();
        // Floppy Ears
        ctxKopek.fillStyle = '#B08968';
        ctxKopek.beginPath();
        ctxKopek.ellipse(44, 90, 18, 36, 0.25, 0, Math.PI * 2);
        ctxKopek.fill();
        ctxKopek.beginPath();
        ctxKopek.ellipse(136, 90, 18, 36, -0.25, 0, Math.PI * 2);
        ctxKopek.fill();
        // Snout
        ctxKopek.fillStyle = '#EDE0D4';
        ctxKopek.beginPath();
        ctxKopek.ellipse(90, 110, 24, 18, 0, 0, Math.PI * 2);
        ctxKopek.fill();
        // Black nose
        ctxKopek.fillStyle = '#222222';
        ctxKopek.beginPath();
        ctxKopek.arc(90, 104, 7, 0, Math.PI * 2);
        ctxKopek.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxKopek, 73, 85, 107, 85);
        // Pink tongue
        ctxKopek.fillStyle = '#FF758F';
        ctxKopek.beginPath();
        ctxKopek.arc(90, 120, 6, 0, Math.PI);
        ctxKopek.fill();
        TextureGenerator.updateCanvas(scene, 'animal_kopek');

        // 3. Kuzu (Lamb) - 🐑
        const ctxKuzu = TextureGenerator.createCanvas(scene, 'animal_kuzu', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxKuzu, '#E8F5E9', '#A3E4D7');
        // Fluffy fleece cloud circles
        ctxKuzu.fillStyle = '#FFFFFF';
        const kuzuClouds = [
            [90, 52, 28], [55, 68, 25], [125, 68, 25],
            [44, 102, 26], [136, 102, 26], [58, 134, 25],
            [122, 134, 25], [90, 142, 26]
        ];
        kuzuClouds.forEach(([x, y, r]) => {
            ctxKuzu.beginPath();
            ctxKuzu.arc(x, y, r, 0, Math.PI * 2);
            ctxKuzu.fill();
        });
        // Head
        ctxKuzu.fillStyle = '#FFE5D9';
        ctxKuzu.beginPath();
        ctxKuzu.ellipse(90, 98, 36, 42, 0, 0, Math.PI * 2);
        ctxKuzu.fill();
        // Droopy soft ears
        ctxKuzu.fillStyle = '#FCD5CE';
        ctxKuzu.beginPath();
        ctxKuzu.ellipse(45, 96, 12, 22, -0.4, 0, Math.PI * 2);
        ctxKuzu.fill();
        ctxKuzu.beginPath();
        ctxKuzu.ellipse(135, 96, 12, 22, 0.4, 0, Math.PI * 2);
        ctxKuzu.fill();
        // Eyes & rosy cheeks
        TextureGenerator.drawCuteEyes(ctxKuzu, 75, 94, 105, 94);
        TextureGenerator.drawCheeks(ctxKuzu, 65, 105, 115, 105);
        // Little smile
        ctxKuzu.strokeStyle = '#5A3E2B';
        ctxKuzu.lineWidth = 2.5;
        ctxKuzu.beginPath();
        ctxKuzu.arc(90, 115, 6, 0.2 * Math.PI, 0.8 * Math.PI);
        ctxKuzu.stroke();
        TextureGenerator.updateCanvas(scene, 'animal_kuzu');

        // 4. Tavuk (Chicken) - 🐔
        const ctxTavuk = TextureGenerator.createCanvas(scene, 'animal_tavuk', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxTavuk, '#FFF3CD', '#F6BD60');
        // Red Comb on top
        ctxTavuk.fillStyle = '#E63946';
        ctxTavuk.beginPath();
        ctxTavuk.arc(75, 42, 12, 0, Math.PI * 2);
        ctxTavuk.arc(90, 34, 15, 0, Math.PI * 2);
        ctxTavuk.arc(105, 42, 12, 0, Math.PI * 2);
        ctxTavuk.fill();
        // Body / Head
        ctxTavuk.fillStyle = '#FFFFFF';
        ctxTavuk.beginPath();
        ctxTavuk.arc(90, 96, 50, 0, Math.PI * 2);
        ctxTavuk.fill();
        // Red Wattle under beak
        ctxTavuk.fillStyle = '#E63946';
        ctxTavuk.beginPath();
        ctxTavuk.ellipse(90, 116, 7, 12, 0, 0, Math.PI * 2);
        ctxTavuk.fill();
        // Yellow Beak
        ctxTavuk.fillStyle = '#FFAA00';
        ctxTavuk.beginPath();
        ctxTavuk.moveTo(82, 94); ctxTavuk.lineTo(98, 94); ctxTavuk.lineTo(90, 108); ctxTavuk.closePath(); ctxTavuk.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxTavuk, 72, 84, 108, 84);
        TextureGenerator.updateCanvas(scene, 'animal_tavuk');

        // 5. İnek (Cow) - 🐮
        const ctxInek = TextureGenerator.createCanvas(scene, 'animal_inek', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxInek, '#EDF6F9', '#83C5BE');
        // Horns
        ctxInek.fillStyle = '#FFD166';
        ctxInek.beginPath();
        ctxInek.ellipse(56, 48, 8, 18, -0.4, 0, Math.PI * 2);
        ctxInek.fill();
        ctxInek.beginPath();
        ctxInek.ellipse(124, 48, 8, 18, 0.4, 0, Math.PI * 2);
        ctxInek.fill();
        // Head
        ctxInek.fillStyle = '#FFFFFF';
        ctxInek.beginPath();
        ctxInek.arc(90, 95, 52, 0, Math.PI * 2);
        ctxInek.fill();
        // Black cow patch
        ctxInek.fillStyle = '#3D405B';
        ctxInek.beginPath();
        ctxInek.arc(114, 76, 24, 0, Math.PI * 2);
        ctxInek.fill();
        // Ears
        ctxInek.fillStyle = '#FFFFFF';
        ctxInek.beginPath();
        ctxInek.ellipse(40, 85, 14, 24, -0.4, 0, Math.PI * 2);
        ctxInek.fill();
        ctxInek.fillStyle = '#FFCAD4';
        ctxInek.beginPath();
        ctxInek.ellipse(40, 85, 8, 16, -0.4, 0, Math.PI * 2);
        ctxInek.fill();
        ctxInek.fillStyle = '#3D405B';
        ctxInek.beginPath();
        ctxInek.ellipse(140, 85, 14, 24, 0.4, 0, Math.PI * 2);
        ctxInek.fill();
        // Big Pink Snout
        ctxInek.fillStyle = '#FFCAD4';
        ctxInek.beginPath();
        ctxInek.ellipse(90, 114, 30, 20, 0, 0, Math.PI * 2);
        ctxInek.fill();
        // Nostrils
        ctxInek.fillStyle = '#E07A5F';
        ctxInek.beginPath();
        ctxInek.arc(80, 114, 5, 0, Math.PI * 2);
        ctxInek.arc(100, 114, 5, 0, Math.PI * 2);
        ctxInek.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxInek, 72, 85, 108, 85);
        TextureGenerator.updateCanvas(scene, 'animal_inek');

        // 6. Ördek (Duck) - 🦆
        const ctxOrdek = TextureGenerator.createCanvas(scene, 'animal_ordek', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxOrdek, '#E0FBFC', '#48CAE4');
        // Head (Emerald Teal / Yellow)
        ctxOrdek.fillStyle = '#52B788';
        ctxOrdek.beginPath();
        ctxOrdek.arc(90, 92, 48, 0, Math.PI * 2);
        ctxOrdek.fill();
        // White neck ring
        ctxOrdek.fillStyle = '#FFFFFF';
        TextureGenerator.drawRoundRect(ctxOrdek, 66, 128, 48, 12, 6);
        ctxOrdek.fill();
        // Orange Bill
        ctxOrdek.fillStyle = '#FB8500';
        ctxOrdek.beginPath();
        ctxOrdek.ellipse(90, 105, 26, 14, 0, 0, Math.PI * 2);
        ctxOrdek.fill();
        // Nostrils on bill
        ctxOrdek.fillStyle = '#D90429';
        ctxOrdek.beginPath();
        ctxOrdek.arc(85, 102, 2.5, 0, Math.PI * 2);
        ctxOrdek.arc(95, 102, 2.5, 0, Math.PI * 2);
        ctxOrdek.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxOrdek, 73, 80, 107, 80);
        TextureGenerator.updateCanvas(scene, 'animal_ordek');

        // 7. At (Horse) - 🐴
        const ctxAt = TextureGenerator.createCanvas(scene, 'animal_at', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxAt, '#FFE5EC', '#F4ACB7');
        // Mane
        ctxAt.fillStyle = '#6F4E37';
        ctxAt.beginPath();
        ctxAt.ellipse(90, 48, 20, 26, 0, 0, Math.PI * 2);
        ctxAt.fill();
        // Head
        ctxAt.fillStyle = '#B07D62';
        ctxAt.beginPath();
        ctxAt.ellipse(90, 94, 40, 50, 0, 0, Math.PI * 2);
        ctxAt.fill();
        // Erect Ears
        ctxAt.fillStyle = '#8B5E3C';
        ctxAt.beginPath();
        ctxAt.moveTo(60, 60); ctxAt.lineTo(52, 25); ctxAt.lineTo(76, 48); ctxAt.closePath(); ctxAt.fill();
        ctxAt.beginPath();
        ctxAt.moveTo(120, 60); ctxAt.lineTo(128, 25); ctxAt.lineTo(104, 48); ctxAt.closePath(); ctxAt.fill();
        // White forehead blaze
        ctxAt.fillStyle = '#FFFFFF';
        ctxAt.beginPath();
        ctxAt.moveTo(90, 60); ctxAt.lineTo(96, 95); ctxAt.lineTo(84, 95); ctxAt.closePath(); ctxAt.fill();
        // Muzzle
        ctxAt.fillStyle = '#9C6644';
        ctxAt.beginPath();
        ctxAt.ellipse(90, 120, 26, 18, 0, 0, Math.PI * 2);
        ctxAt.fill();
        // Nostrils
        ctxAt.fillStyle = '#5A3E2B';
        ctxAt.beginPath();
        ctxAt.arc(80, 120, 4, 0, Math.PI * 2);
        ctxAt.arc(100, 120, 4, 0, Math.PI * 2);
        ctxAt.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxAt, 72, 85, 108, 85);
        TextureGenerator.updateCanvas(scene, 'animal_at');

        // 8. Tavşan (Rabbit) - 🐰
        const ctxTavsan = TextureGenerator.createCanvas(scene, 'animal_tavsan', 180, 180);
        TextureGenerator.drawRoundAvatarBase(ctxTavsan, '#FDE2E4', '#FB6F92');
        // Tall Ears
        ctxTavsan.fillStyle = '#FFFFFF';
        ctxTavsan.beginPath();
        ctxTavsan.ellipse(65, 38, 14, 38, -0.15, 0, Math.PI * 2);
        ctxTavsan.fill();
        ctxTavsan.beginPath();
        ctxTavsan.ellipse(115, 38, 14, 38, 0.15, 0, Math.PI * 2);
        ctxTavsan.fill();
        // Pink inner ears
        ctxTavsan.fillStyle = '#FFCAD4';
        ctxTavsan.beginPath();
        ctxTavsan.ellipse(65, 38, 7, 28, -0.15, 0, Math.PI * 2);
        ctxTavsan.fill();
        ctxTavsan.beginPath();
        ctxTavsan.ellipse(115, 38, 7, 28, 0.15, 0, Math.PI * 2);
        ctxTavsan.fill();
        // Head
        ctxTavsan.fillStyle = '#FFFFFF';
        ctxTavsan.beginPath();
        ctxTavsan.arc(90, 102, 48, 0, Math.PI * 2);
        ctxTavsan.fill();
        // Eyes
        TextureGenerator.drawCuteEyes(ctxTavsan, 73, 96, 107, 96);
        TextureGenerator.drawCheeks(ctxTavsan, 62, 108, 118, 108);
        // Pink nose (FIXED: correct context)
        ctxTavsan.fillStyle = '#FF758F';
        ctxTavsan.beginPath();
        ctxTavsan.moveTo(86, 106);
        ctxTavsan.lineTo(94, 106);
        ctxTavsan.lineTo(90, 112);
        ctxTavsan.closePath();
        ctxTavsan.fill();
        // Cute front teeth
        ctxTavsan.fillStyle = '#FFFFFF';
        ctxTavsan.strokeStyle = '#CCCCCC';
        ctxTavsan.lineWidth = 1;
        ctxTavsan.strokeRect(86, 116, 8, 8);
        ctxTavsan.fillRect(86, 116, 8, 8);
        TextureGenerator.updateCanvas(scene, 'animal_tavsan');
    }

    private static drawRoundAvatarBase(ctx: CanvasRenderingContext2D, bgHex: string, borderHex: string): void {
        ctx.fillStyle = bgHex;
        ctx.beginPath();
        ctx.arc(90, 90, 84, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = borderHex;
        ctx.lineWidth = 6;
        ctx.stroke();
    }

    private static drawCuteEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.arc(x1, y1, 6.5, 0, Math.PI * 2);
        ctx.arc(x2, y2, 6.5, 0, Math.PI * 2);
        ctx.fill();
        // Glint sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x1 + 2, y1 - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(x2 + 2, y2 - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    private static drawCheeks(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
        ctx.fillStyle = 'rgba(255, 140, 160, 0.55)';
        ctx.beginPath();
        ctx.arc(x1, y1, 8, 0, Math.PI * 2);
        ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    private static createFoodTextures(scene: Scene): void {
        // Süt (Milk)
        const ctxSut = TextureGenerator.createCanvas(scene, 'food_sut', 110, 110);
        ctxSut.fillStyle = '#FFFFFF';
        TextureGenerator.drawRoundRect(ctxSut, 35, 35, 40, 60, [8, 8, 12, 12]);
        ctxSut.fill();
        ctxSut.strokeStyle = '#A0C4FF';
        ctxSut.lineWidth = 4;
        ctxSut.stroke();
        // Blue cap
        ctxSut.fillStyle = '#3A86FF';
        TextureGenerator.drawRoundRect(ctxSut, 42, 22, 26, 14, 4);
        ctxSut.fill();
        // Milk label droplet
        ctxSut.fillStyle = '#70D6FF';
        ctxSut.beginPath();
        ctxSut.arc(55, 65, 8, 0, Math.PI * 2);
        ctxSut.fill();
        TextureGenerator.updateCanvas(scene, 'food_sut');

        // Kemik (Bone)
        const ctxKemik = TextureGenerator.createCanvas(scene, 'food_kemik', 110, 110);
        ctxKemik.fillStyle = '#FAF0E6';
        ctxKemik.strokeStyle = '#D4A373';
        ctxKemik.lineWidth = 3;
        // Bone center bar
        ctxKemik.fillRect(32, 47, 46, 16);
        ctxKemik.strokeRect(32, 47, 46, 16);
        // Bone knobs
        const knobs = [[28, 44], [28, 66], [82, 44], [82, 66]];
        knobs.forEach(([x, y]) => {
            ctxKemik.beginPath();
            ctxKemik.arc(x, y, 12, 0, Math.PI * 2);
            ctxKemik.fill();
            ctxKemik.stroke();
        });
        TextureGenerator.updateCanvas(scene, 'food_kemik');

        // Çimen (Grass)
        const ctxCimen = TextureGenerator.createCanvas(scene, 'food_cimen', 110, 110);
        ctxCimen.fillStyle = '#52B788';
        for (let i = 0; i < 5; i++) {
            ctxCimen.beginPath();
            ctxCimen.ellipse(35 + i * 10, 55, 6, 26, (i - 2) * 0.25, 0, Math.PI * 2);
            ctxCimen.fill();
        }
        TextureGenerator.updateCanvas(scene, 'food_cimen');

        // Mısır (Corn)
        const ctxMisir = TextureGenerator.createCanvas(scene, 'food_misir', 110, 110);
        ctxMisir.fillStyle = '#FFD166';
        ctxMisir.beginPath();
        ctxMisir.ellipse(55, 50, 16, 32, 0.1, 0, Math.PI * 2);
        ctxMisir.fill();
        ctxMisir.fillStyle = '#74C69D';
        ctxMisir.beginPath();
        ctxMisir.ellipse(42, 65, 10, 24, -0.4, 0, Math.PI * 2);
        ctxMisir.fill();
        ctxMisir.beginPath();
        ctxMisir.ellipse(68, 65, 10, 24, 0.4, 0, Math.PI * 2);
        ctxMisir.fill();
        TextureGenerator.updateCanvas(scene, 'food_misir');

        // Saman (Hay)
        const ctxSaman = TextureGenerator.createCanvas(scene, 'food_saman', 110, 110);
        ctxSaman.fillStyle = '#FFE6A7';
        TextureGenerator.drawRoundRect(ctxSaman, 25, 35, 60, 45, 8);
        ctxSaman.fill();
        ctxSaman.strokeStyle = '#DDA15E';
        ctxSaman.lineWidth = 4;
        ctxSaman.stroke();
        // Rope bindings
        ctxSaman.fillStyle = '#BC6C25';
        ctxSaman.fillRect(42, 35, 6, 45);
        ctxSaman.fillRect(62, 35, 6, 45);
        TextureGenerator.updateCanvas(scene, 'food_saman');

        // Marul (Lettuce)
        const ctxMarul = TextureGenerator.createCanvas(scene, 'food_marul', 110, 110);
        ctxMarul.fillStyle = '#70E000';
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctxMarul.beginPath();
            ctxMarul.ellipse(55 + Math.cos(angle) * 14, 55 + Math.sin(angle) * 14, 16, 20, angle, 0, Math.PI * 2);
            ctxMarul.fill();
        }
        ctxMarul.fillStyle = '#CCFF33';
        ctxMarul.beginPath();
        ctxMarul.arc(55, 55, 14, 0, Math.PI * 2);
        ctxMarul.fill();
        TextureGenerator.updateCanvas(scene, 'food_marul');

        // Elma (Apple)
        const ctxElma = TextureGenerator.createCanvas(scene, 'food_elma', 110, 110);
        ctxElma.fillStyle = '#E63946';
        ctxElma.beginPath();
        ctxElma.arc(46, 56, 22, 0, Math.PI * 2);
        ctxElma.arc(64, 56, 22, 0, Math.PI * 2);
        ctxElma.fill();
        // Brown stem
        ctxElma.strokeStyle = '#6F4E37';
        ctxElma.lineWidth = 4;
        ctxElma.beginPath();
        ctxElma.moveTo(55, 38);
        ctxElma.lineTo(55, 26);
        ctxElma.stroke();
        // Green leaf
        ctxElma.fillStyle = '#52B788';
        ctxElma.beginPath();
        ctxElma.ellipse(65, 28, 8, 4, 0.4, 0, Math.PI * 2);
        ctxElma.fill();
        TextureGenerator.updateCanvas(scene, 'food_elma');

        // Havuç (Carrot)
        const ctxHavuc = TextureGenerator.createCanvas(scene, 'food_havuc', 110, 110);
        // Green leafy top
        ctxHavuc.fillStyle = '#52B788';
        ctxHavuc.beginPath();
        ctxHavuc.ellipse(55, 24, 6, 14, 0, 0, Math.PI * 2);
        ctxHavuc.ellipse(47, 26, 5, 12, -0.3, 0, Math.PI * 2);
        ctxHavuc.ellipse(63, 26, 5, 12, 0.3, 0, Math.PI * 2);
        ctxHavuc.fill();
        // Orange carrot body
        ctxHavuc.fillStyle = '#FB8500';
        ctxHavuc.beginPath();
        ctxHavuc.moveTo(42, 36);
        ctxHavuc.lineTo(68, 36);
        ctxHavuc.lineTo(55, 88);
        ctxHavuc.closePath();
        ctxHavuc.fill();
        TextureGenerator.updateCanvas(scene, 'food_havuc');

        // Balık (Fish - distractor)
        const ctxBalik = TextureGenerator.createCanvas(scene, 'food_balik', 110, 110);
        ctxBalik.fillStyle = '#4EA8DE';
        ctxBalik.beginPath();
        ctxBalik.ellipse(52, 55, 24, 15, 0, 0, Math.PI * 2);
        ctxBalik.fill();
        ctxBalik.beginPath();
        ctxBalik.moveTo(74, 55);
        ctxBalik.lineTo(92, 40);
        ctxBalik.lineTo(92, 70);
        ctxBalik.closePath();
        ctxBalik.fill();
        TextureGenerator.updateCanvas(scene, 'food_balik');

        // Peynir (Cheese - distractor)
        const ctxPeynir = TextureGenerator.createCanvas(scene, 'food_peynir', 110, 110);
        ctxPeynir.fillStyle = '#FFD166';
        ctxPeynir.beginPath();
        ctxPeynir.moveTo(30, 75);
        ctxPeynir.lineTo(85, 75);
        ctxPeynir.lineTo(85, 38);
        ctxPeynir.closePath();
        ctxPeynir.fill();
        // Holes
        ctxPeynir.fillStyle = '#FFAA00';
        ctxPeynir.beginPath();
        ctxPeynir.arc(50, 68, 6, 0, Math.PI * 2);
        ctxPeynir.arc(70, 58, 5, 0, Math.PI * 2);
        ctxPeynir.arc(75, 70, 4, 0, Math.PI * 2);
        ctxPeynir.fill();
        TextureGenerator.updateCanvas(scene, 'food_peynir');
    }

    private static createEggsAndParticles(scene: Scene): void {
        // Intact Egg (120x150)
        const ctxEgg = TextureGenerator.createCanvas(scene, 'egg_intact', 120, 150);
        ctxEgg.fillStyle = '#FFF8E7';
        ctxEgg.beginPath();
        ctxEgg.ellipse(60, 80, 44, 56, 0, 0, Math.PI * 2);
        ctxEgg.fill();
        ctxEgg.strokeStyle = '#E6CCB2';
        ctxEgg.lineWidth = 5;
        ctxEgg.stroke();
        // Pastel decorative spots on egg
        ctxEgg.fillStyle = '#FFCAD4';
        ctxEgg.beginPath();
        ctxEgg.arc(48, 70, 6, 0, Math.PI * 2);
        ctxEgg.arc(74, 95, 7, 0, Math.PI * 2);
        ctxEgg.arc(55, 105, 5, 0, Math.PI * 2);
        ctxEgg.fill();
        TextureGenerator.updateCanvas(scene, 'egg_intact');

        // Cracked Egg (120x150)
        const ctxEggCrack = TextureGenerator.createCanvas(scene, 'egg_cracked', 120, 150);
        ctxEggCrack.fillStyle = '#FFF8E7';
        ctxEggCrack.beginPath();
        ctxEggCrack.ellipse(60, 80, 44, 56, 0, 0, Math.PI * 2);
        ctxEggCrack.fill();
        ctxEggCrack.strokeStyle = '#E6CCB2';
        ctxEggCrack.lineWidth = 5;
        ctxEggCrack.stroke();
        // Crack lines
        ctxEggCrack.strokeStyle = '#D4A373';
        ctxEggCrack.lineWidth = 4;
        ctxEggCrack.beginPath();
        ctxEggCrack.moveTo(60, 34);
        ctxEggCrack.lineTo(50, 55);
        ctxEggCrack.lineTo(72, 75);
        ctxEggCrack.lineTo(45, 95);
        ctxEggCrack.lineTo(65, 120);
        ctxEggCrack.stroke();
        TextureGenerator.updateCanvas(scene, 'egg_cracked');

        // Star Gold (60x60)
        const ctxStar = TextureGenerator.createCanvas(scene, 'star_gold', 60, 60);
        ctxStar.fillStyle = '#FFD166';
        ctxStar.strokeStyle = '#F77F00';
        ctxStar.lineWidth = 3;
        TextureGenerator.drawStarPath(ctxStar, 30, 30, 5, 26, 12);
        ctxStar.fill();
        ctxStar.stroke();
        TextureGenerator.updateCanvas(scene, 'star_gold');

        // Heart Red/Pink (50x50)
        const ctxHeart = TextureGenerator.createCanvas(scene, 'heart_pink', 50, 50);
        ctxHeart.fillStyle = '#FF5D8F';
        ctxHeart.beginPath();
        ctxHeart.moveTo(25, 18);
        ctxHeart.bezierCurveTo(25, 10, 12, 10, 12, 22);
        ctxHeart.bezierCurveTo(12, 32, 25, 42, 25, 45);
        ctxHeart.bezierCurveTo(25, 42, 38, 32, 38, 22);
        ctxHeart.bezierCurveTo(38, 10, 25, 10, 25, 18);
        ctxHeart.closePath();
        ctxHeart.fill();
        TextureGenerator.updateCanvas(scene, 'heart_pink');
    }

    private static drawStarPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    private static createUIElements(scene: Scene): void {
        // Rounded Card Frame (200x240)
        const ctxCard = TextureGenerator.createCanvas(scene, 'card_plate', 200, 240);
        ctxCard.fillStyle = '#FFFFFF';
        TextureGenerator.drawRoundRect(ctxCard, 8, 8, 184, 224, 24);
        ctxCard.fill();
        ctxCard.strokeStyle = '#E2E8F0';
        ctxCard.lineWidth = 5;
        ctxCard.stroke();
        TextureGenerator.updateCanvas(scene, 'card_plate');

        // Pill Button Plate (240x80)
        const ctxPill = TextureGenerator.createCanvas(scene, 'btn_pill', 240, 80);
        ctxPill.fillStyle = '#FFFFFF';
        TextureGenerator.drawRoundRect(ctxPill, 6, 6, 228, 68, 34);
        ctxPill.fill();
        ctxPill.strokeStyle = '#CBD5E1';
        ctxPill.lineWidth = 4;
        ctxPill.stroke();
        TextureGenerator.updateCanvas(scene, 'btn_pill');

        // Big Icon Check (80x80)
        const ctxCheck = TextureGenerator.createCanvas(scene, 'icon_check', 80, 80);
        ctxCheck.fillStyle = '#52B788';
        ctxCheck.beginPath();
        ctxCheck.arc(40, 40, 36, 0, Math.PI * 2);
        ctxCheck.fill();
        ctxCheck.strokeStyle = '#FFFFFF';
        ctxCheck.lineWidth = 7;
        ctxCheck.lineCap = 'round';
        ctxCheck.lineJoin = 'round';
        ctxCheck.beginPath();
        ctxCheck.moveTo(24, 40);
        ctxCheck.lineTo(35, 52);
        ctxCheck.lineTo(56, 28);
        ctxCheck.stroke();
        TextureGenerator.updateCanvas(scene, 'icon_check');

        // Big Icon Repeat (80x80)
        const ctxRep = TextureGenerator.createCanvas(scene, 'icon_repeat', 80, 80);
        ctxRep.fillStyle = '#4EA8DE';
        ctxRep.beginPath();
        ctxRep.arc(40, 40, 36, 0, Math.PI * 2);
        ctxRep.fill();
        ctxRep.strokeStyle = '#FFFFFF';
        ctxRep.lineWidth = 6;
        ctxRep.lineCap = 'round';
        ctxRep.beginPath();
        ctxRep.arc(40, 40, 20, 0.4 * Math.PI, 1.8 * Math.PI);
        ctxRep.stroke();
        // Arrow head
        ctxRep.fillStyle = '#FFFFFF';
        ctxRep.beginPath();
        ctxRep.moveTo(56, 30);
        ctxRep.lineTo(66, 36);
        ctxRep.lineTo(54, 42);
        ctxRep.closePath();
        ctxRep.fill();
        TextureGenerator.updateCanvas(scene, 'icon_repeat');

        // Icon Gear (60x60)
        const ctxGear = TextureGenerator.createCanvas(scene, 'icon_gear', 60, 60);
        ctxGear.fillStyle = '#8E9AAF';
        ctxGear.beginPath();
        ctxGear.arc(30, 30, 20, 0, Math.PI * 2);
        ctxGear.fill();
        // Gear teeth
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            ctxGear.fillRect(26 + Math.cos(a) * 20, 26 + Math.sin(a) * 20, 8, 8);
        }
        ctxGear.fillStyle = '#FFFFFF';
        ctxGear.beginPath();
        ctxGear.arc(30, 30, 8, 0, Math.PI * 2);
        ctxGear.fill();
        TextureGenerator.updateCanvas(scene, 'icon_gear');

        // Icon Album (60x60)
        const ctxAlb = TextureGenerator.createCanvas(scene, 'icon_album', 60, 60);
        ctxAlb.fillStyle = '#F3A683';
        TextureGenerator.drawRoundRect(ctxAlb, 10, 10, 40, 40, 8);
        ctxAlb.fill();
        ctxAlb.fillStyle = '#FFFFFF';
        ctxAlb.fillRect(20, 18, 20, 5);
        ctxAlb.fillRect(20, 28, 20, 5);
        ctxAlb.fillRect(20, 38, 14, 5);
        TextureGenerator.updateCanvas(scene, 'icon_album');

        // Icon Speaker (60x60)
        const ctxSpk = TextureGenerator.createCanvas(scene, 'icon_speaker', 60, 60);
        ctxSpk.fillStyle = '#52B788';
        TextureGenerator.drawRoundRect(ctxSpk, 6, 6, 48, 48, 12);
        ctxSpk.fill();
        ctxSpk.fillStyle = '#FFFFFF';
        // Speaker cone
        ctxSpk.beginPath();
        ctxSpk.moveTo(18, 24);
        ctxSpk.lineTo(26, 24);
        ctxSpk.lineTo(36, 16);
        ctxSpk.lineTo(36, 44);
        ctxSpk.lineTo(26, 36);
        ctxSpk.lineTo(18, 36);
        ctxSpk.closePath();
        ctxSpk.fill();
        // Sound waves
        ctxSpk.strokeStyle = '#FFFFFF';
        ctxSpk.lineWidth = 3;
        ctxSpk.beginPath();
        ctxSpk.arc(36, 30, 8, -0.6, 0.6);
        ctxSpk.stroke();
        TextureGenerator.updateCanvas(scene, 'icon_speaker');
    }
}

function heightOrZero(h: number): number {
    return h;
}
