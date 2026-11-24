import { Scene, GameObjects } from 'phaser';
import { gameState } from '../state/gameState';
import { soundManager } from '../audio/soundManager';
import { ANIMALS, ALL_TARGET_SOUNDS } from '../data/animals';

export class TherapistScene extends Scene {
    private mainContainer!: GameObjects.Container;
    private soundChips: Map<string, GameObjects.Container> = new Map();
    private animalChips: Map<string, GameObjects.Container> = new Map();
    private roundsChips: Map<number, GameObjects.Container> = new Map();
    private cardChips: Map<number, GameObjects.Container> = new Map();
    private speedChips: Map<number, GameObjects.Container> = new Map();
    private audioToggleBtn!: GameObjects.Container;
    private profileBtns: Map<string, GameObjects.Container> = new Map();
    private summaryText!: GameObjects.Text;

    constructor() {
        super('TherapistScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // Darkened background backdrop (Mobile Portrait 540x960)
        const backdrop = this.add.graphics();
        backdrop.fillStyle(0x0F172A, 0.75);
        backdrop.fillRect(0, 0, 540, 960);

        // Center Panel (500x910)
        this.mainContainer = this.add.container(270, 480);

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0xFFFFFF, 0.98);
        panelBg.fillRoundedRect(-250, -455, 500, 910, 24);
        panelBg.lineStyle(3, 0x64748B, 0.8);
        panelBg.strokeRoundedRect(-250, -455, 500, 910, 24);
        this.mainContainer.add(panelBg);

        // Header Title
        const header = this.add.text(0, -425, '⚙️ Terapist Kontrol Paneli', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '21px',
            color: '#1E293B',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.mainContainer.add(header);

        // Subtitle / Privacy notice (per GDD: "Kişisel veri tutulmaz")
        const sub = this.add.text(0, -398, 'Hedefleri yapılandırın. Veriler yalnızca bu cihazda tutulur.', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '12px',
            color: '#64748B'
        }).setOrigin(0.5);
        this.mainContainer.add(sub);

        // Build Sections
        this.buildProfileSection();
        this.buildTargetSoundsSection();
        this.buildAnimalsToggleSection();
        this.buildGameSettingsSection();
        this.buildSessionSummarySection();

        // Close / Save Button at Bottom
        const saveBtn = this.add.container(0, 420);
        const sBg = this.add.graphics();
        sBg.fillStyle(0x52B788, 1);
        sBg.fillRoundedRect(-225, -24, 450, 48, 24);
        sBg.lineStyle(2, 0x2D6A4F, 1);
        sBg.strokeRoundedRect(-225, -24, 450, 48, 24);
        const sTxt = this.add.text(0, 0, 'Kaydet ve Oyuna Dön ✓', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        saveBtn.add([sBg, sTxt]);
        saveBtn.setSize(450, 48);
        saveBtn.setInteractive({ useHandCursor: true });
        saveBtn.on('pointerdown', () => {
            soundManager.playTap();
            gameState.save();
            this.scene.start('FarmScene');
        });
        this.mainContainer.add(saveBtn);
    }

    private buildProfileSection(): void {
        const yLbl = -368;
        const lbl = this.add.text(-230, yLbl, 'Aktif Profil:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '15px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lbl);

        const profiles = ['Profil 1', 'Profil 2', 'Profil 3'];
        profiles.forEach((pid, i) => {
            const btn = this.add.container(-140 + i * 140, -342);
            this.drawChip(btn, pid, gameState.currentProfileId === pid, 115, 30);
            btn.setSize(115, 30);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                gameState.switchProfile(pid);
                this.scene.restart();
            });
            this.mainContainer.add(btn);
            this.profileBtns.set(pid, btn);
        });
    }

    private buildTargetSoundsSection(): void {
        const yLbl = -312;
        const lbl = this.add.text(-230, yLbl, 'Hedef Sesler:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '15px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lbl);

        const settings = gameState.getActiveProfile().settings;

        // "Tümü" option
        const allBtn = this.add.container(-165, -284);
        const isAll = !settings.selectedTargetSounds || settings.selectedTargetSounds.length === 0;
        this.drawChip(allBtn, 'Tüm Sesler', isAll, 95, 28);
        allBtn.setSize(95, 28);
        allBtn.setInteractive({ useHandCursor: true });
        allBtn.on('pointerdown', () => {
            soundManager.playTap();
            settings.selectedTargetSounds = [];
            this.refreshTargetSoundChips();
        });
        this.mainContainer.add(allBtn);
        this.soundChips.set('all', allBtn);

        // Sound options across 2 rows
        const soundCoords = [
            { x: -65, y: -284 },
            { x: 10, y: -284 },
            { x: 85, y: -284 },
            { x: 160, y: -284 },
            { x: -165, y: -248 },
            { x: -90, y: -248 },
            { x: -15, y: -248 },
            { x: 60, y: -248 }
        ];

        ALL_TARGET_SOUNDS.forEach((item, i) => {
            const pos = soundCoords[i] || { x: 0, y: -248 };
            const btn = this.add.container(pos.x, pos.y);
            const isSelected = settings.selectedTargetSounds.includes(item.sound);
            this.drawChip(btn, `/${item.sound}/`, isSelected, 56, 28);
            btn.setSize(56, 28);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                const idx = settings.selectedTargetSounds.indexOf(item.sound);
                if (idx > -1) {
                    settings.selectedTargetSounds.splice(idx, 1);
                } else {
                    settings.selectedTargetSounds.push(item.sound);
                }
                this.refreshTargetSoundChips();
            });
            this.mainContainer.add(btn);
            this.soundChips.set(item.sound, btn);
        });
    }

    private refreshTargetSoundChips(): void {
        const settings = gameState.getActiveProfile().settings;
        const isAll = settings.selectedTargetSounds.length === 0;

        const allBtn = this.soundChips.get('all');
        if (allBtn) this.drawChip(allBtn, 'Tüm Sesler', isAll, 95, 28);

        ALL_TARGET_SOUNDS.forEach(item => {
            const btn = this.soundChips.get(item.sound);
            if (btn) {
                const isSelected = settings.selectedTargetSounds.includes(item.sound);
                this.drawChip(btn, `/${item.sound}/`, isSelected, 56, 28);
            }
        });
    }

    private buildAnimalsToggleSection(): void {
        const yLbl = -215;
        const lbl = this.add.text(-230, yLbl, 'Aktif Hayvanlar:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '15px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lbl);

        const settings = gameState.getActiveProfile().settings;

        ANIMALS.forEach((animal, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = col === 0 ? -115 : 115;
            const ay = -186 + row * 34;
            const btn = this.add.container(x, ay);
            const isEnabled = settings.enabledAnimalIds.includes(animal.id);

            this.drawChip(btn, `${animal.emoji} ${animal.name}`, isEnabled, 215, 28);
            btn.setSize(215, 28);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                const idx = settings.enabledAnimalIds.indexOf(animal.id);
                if (idx > -1) {
                    if (settings.enabledAnimalIds.length > 1) {
                        settings.enabledAnimalIds.splice(idx, 1);
                    }
                } else {
                    settings.enabledAnimalIds.push(animal.id);
                }
                const updated = settings.enabledAnimalIds.includes(animal.id);
                this.drawChip(btn, `${animal.emoji} ${animal.name}`, updated, 215, 28);
            });
            this.mainContainer.add(btn);
            this.animalChips.set(animal.id, btn);
        });
    }

    private buildGameSettingsSection(): void {
        const settings = gameState.getActiveProfile().settings;

        // Tur Sayısı (Rounds: 3, 5, 8)
        const yRounds = -45;
        const lblRounds = this.add.text(-230, yRounds, 'Tur Sayısı:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblRounds);

        [3, 5, 8].forEach((r, i) => {
            const btn = this.add.container(-45 + i * 75, yRounds);
            this.drawChip(btn, `${r} Tur`, settings.roundsPerGame === r, 68, 28);
            btn.setSize(68, 28);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                settings.roundsPerGame = r;
                [3, 5, 8].forEach(v => {
                    const b = this.roundsChips.get(v);
                    if (b) this.drawChip(b, `${v} Tur`, v === r, 68, 28);
                });
            });
            this.mainContainer.add(btn);
            this.roundsChips.set(r, btn);
        });

        // Kart Sayısı (Cards: 2, 3)
        const yCards = -10;
        const lblCards = this.add.text(-230, yCards, 'Kart Sayısı:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblCards);

        [2, 3].forEach((c, i) => {
            const btn = this.add.container(-45 + i * 80, yCards);
            this.drawChip(btn, `${c} Kart`, settings.cardCount === c, 72, 28);
            btn.setSize(72, 28);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                settings.cardCount = c;
                [2, 3].forEach(v => {
                    const b = this.cardChips.get(v);
                    if (b) this.drawChip(b, `${v} Kart`, v === c, 72, 28);
                });
            });
            this.mainContainer.add(btn);
            this.cardChips.set(c, btn);
        });

        // Konuşma Hızı
        const ySpeed = 25;
        const lblSpeed = this.add.text(-230, ySpeed, 'Konuşma Hızı:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblSpeed);

        const speeds = [
            { rate: 0.75, label: 'Yavaş' },
            { rate: 1.0, label: 'Normal' }
        ];
        speeds.forEach((s, i) => {
            const btn = this.add.container(-45 + i * 80, ySpeed);
            const isSelected = Math.abs(settings.speechRate - s.rate) < 0.1;
            this.drawChip(btn, s.label, isSelected, 72, 28);
            btn.setSize(72, 28);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                settings.speechRate = s.rate;
                speeds.forEach(sp => {
                    const b = this.speedChips.get(sp.rate);
                    if (b) this.drawChip(b, sp.label, sp.rate === s.rate, 72, 28);
                });
            });
            this.mainContainer.add(btn);
            this.speedChips.set(s.rate, btn);
        });

        // Ses Açık/Kapalı
        const yAudio = 60;
        const lblAudio = this.add.text(-230, yAudio, 'Ses Durumu:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
            color: '#334155',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblAudio);

        this.audioToggleBtn = this.add.container(20, yAudio);
        this.drawChip(this.audioToggleBtn, settings.soundEnabled ? 'Ses: Açık 🔊' : 'Ses: Kapalı 🔇', settings.soundEnabled, 140, 28);
        this.audioToggleBtn.setSize(140, 28);
        this.audioToggleBtn.setInteractive({ useHandCursor: true });
        this.audioToggleBtn.on('pointerdown', () => {
            soundManager.playTap();
            settings.soundEnabled = !settings.soundEnabled;
            this.drawChip(this.audioToggleBtn, settings.soundEnabled ? 'Ses: Açık 🔊' : 'Ses: Kapalı 🔇', settings.soundEnabled, 140, 28);
        });
        this.mainContainer.add(this.audioToggleBtn);
    }

    private buildSessionSummarySection(): void {
        const y = 95;

        // Session Box (460x175)
        const box = this.add.graphics();
        box.fillStyle(0xF8FAFC, 1);
        box.fillRoundedRect(-230, y, 460, 175, 18);
        box.lineStyle(2, 0xE2E8F0, 1);
        box.strokeRoundedRect(-230, y, 460, 175, 18);
        this.mainContainer.add(box);

        const title = this.add.text(-215, y + 20, '📊 Bugünkü Seans Özeti', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '16px',
            color: '#1E293B',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(title);

        this.summaryText = this.add.text(-215, y + 42, '', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '13px',
            color: '#475569',
            lineSpacing: 6
        });
        this.mainContainer.add(this.summaryText);
        this.updateSummaryText();

        // Reset Session Button
        const resetBtn = this.add.container(0, y + 140);
        const rBg = this.add.graphics();
        rBg.fillStyle(0xFEE2E2, 1);
        rBg.fillRoundedRect(-85, -16, 170, 32, 16);
        rBg.lineStyle(1.5, 0xFCA5A5, 1);
        rBg.strokeRoundedRect(-85, -16, 170, 32, 16);
        const rTxt = this.add.text(0, 0, 'Seansı Sıfırla ↻', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '13px',
            color: '#991B1B',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        resetBtn.add([rBg, rTxt]);
        resetBtn.setSize(170, 32);
        resetBtn.setInteractive({ useHandCursor: true });
        resetBtn.on('pointerdown', () => {
            soundManager.playTap();
            gameState.resetSessionStats();
            this.updateSummaryText();
        });
        this.mainContainer.add(resetBtn);
    }

    private updateSummaryText(): void {
        const stats = gameState.getActiveProfile().todayStats;
        this.summaryText.setText(
            `Tarih: ${stats.date}\n• Doğru Tanıma: ${stats.correctCount} adet\n• Artikülasyon Tekrarı: ${stats.repeatCount} kez\n• Tamamlanan Oyun: ${stats.gamesCompleted} tur\n• Kazanılan Yıldız: ${stats.starsEarned} ⭐`
        );
    }

    private drawChip(container: GameObjects.Container, label: string, isSelected: boolean, width: number, height: number): void {
        container.removeAll(true);

        const bg = this.add.graphics();
        bg.fillStyle(isSelected ? 0x0EA5E9 : 0xF1F5F9, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
        bg.lineStyle(2, isSelected ? 0x0284C7 : 0xCBD5E1, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, height / 2);

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '13px',
            color: isSelected ? '#FFFFFF' : '#334155',
            fontStyle: isSelected ? 'bold' : 'normal'
        }).setOrigin(0.5);

        container.add([bg, text]);
    }
}
