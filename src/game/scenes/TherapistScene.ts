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

        // Darkened background backdrop
        const backdrop = this.add.graphics();
        backdrop.fillStyle(0x1E293B, 0.7);
        backdrop.fillRect(0, 0, 1024, 768);

        // Center Panel (940x690)
        this.mainContainer = this.add.container(512, 384);

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0xFFFFFF, 0.98);
        panelBg.fillRoundedRect(-470, -345, 940, 690, 24);
        panelBg.lineStyle(4, 0x64748B, 0.8);
        panelBg.strokeRoundedRect(-470, -345, 940, 690, 24);
        this.mainContainer.add(panelBg);

        // Header Title
        const header = this.add.text(0, -305, '⚙️ Dil ve Konuşma Terapisti Paneli', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '26px',
            color: '#1E293B'
        }).setOrigin(0.5);
        this.mainContainer.add(header);

        // Subtitle / Privacy notice (per GDD: "Kişisel veri tutulmaz")
        const sub = this.add.text(0, -275, 'Terapötik hedefleri yapılandırın. Kişisel veri tutulmaz, veriler sadece bu cihazdadır.', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '14px',
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
        const saveBtn = this.add.container(0, 305);
        const sBg = this.add.graphics();
        sBg.fillStyle(0x52B788, 1);
        sBg.fillRoundedRect(-140, -24, 280, 48, 24);
        sBg.lineStyle(2, 0x2D6A4F, 1);
        sBg.strokeRoundedRect(-140, -24, 280, 48, 24);
        const sTxt = this.add.text(0, 0, 'Kaydet ve Oyuna Dön ✓', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        saveBtn.add([sBg, sTxt]);
        saveBtn.setSize(280, 48);
        saveBtn.setInteractive({ useHandCursor: true });
        saveBtn.on('pointerdown', () => {
            soundManager.playTap();
            gameState.save();
            this.scene.start('FarmScene');
        });
        this.mainContainer.add(saveBtn);
    }

    private buildProfileSection(): void {
        const y = -240;
        const lbl = this.add.text(-440, y, 'Aktif Profil:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#334155'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lbl);

        const profiles = ['Profil 1', 'Profil 2', 'Profil 3'];
        profiles.forEach((pid, i) => {
            const btn = this.add.container(-310 + i * 115, y);
            this.drawChip(btn, pid, gameState.currentProfileId === pid, 105, 36);
            btn.setSize(105, 36);
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
        const y = -180;
        const lbl = this.add.text(-440, y, 'Hedef Sesler:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#334155'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lbl);

        const settings = gameState.getActiveProfile().settings;

        // "Tümü" option
        const allBtn = this.add.container(-300, y);
        const isAll = !settings.selectedTargetSounds || settings.selectedTargetSounds.length === 0;
        this.drawChip(allBtn, 'Tüm Sesler', isAll, 95, 34);
        allBtn.setSize(95, 34);
        allBtn.setInteractive({ useHandCursor: true });
        allBtn.on('pointerdown', () => {
            soundManager.playTap();
            settings.selectedTargetSounds = [];
            this.refreshTargetSoundChips();
        });
        this.mainContainer.add(allBtn);
        this.soundChips.set('all', allBtn);

        // Sound options
        ALL_TARGET_SOUNDS.forEach((item, i) => {
            const x = -190 + i * 70;
            const btn = this.add.container(x, y);
            const isSelected = settings.selectedTargetSounds.includes(item.sound);
            this.drawChip(btn, `/${item.sound}/`, isSelected, 60, 34);
            btn.setSize(60, 34);
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
        if (allBtn) this.drawChip(allBtn, 'Tüm Sesler', isAll, 95, 34);

        ALL_TARGET_SOUNDS.forEach(item => {
            const btn = this.soundChips.get(item.sound);
            if (btn) {
                const isSelected = settings.selectedTargetSounds.includes(item.sound);
                this.drawChip(btn, `/${item.sound}/`, isSelected, 60, 34);
            }
        });
    }

    private buildAnimalsToggleSection(): void {
        const y = -115;
        const lbl = this.add.text(-440, y, 'Aktif Hayvanlar:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#334155'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lbl);

        const settings = gameState.getActiveProfile().settings;

        ANIMALS.forEach((animal, i) => {
            const x = -300 + (i % 4) * 190;
            const ay = y + Math.floor(i / 4) * 44;
            const btn = this.add.container(x, ay);
            const isEnabled = settings.enabledAnimalIds.includes(animal.id);

            this.drawChip(btn, `${animal.emoji} ${animal.name}`, isEnabled, 175, 36);
            btn.setSize(175, 36);
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
                this.drawChip(btn, `${animal.emoji} ${animal.name}`, updated, 175, 36);
            });
            this.mainContainer.add(btn);
            this.animalChips.set(animal.id, btn);
        });
    }

    private buildGameSettingsSection(): void {
        const y = -10;
        const settings = gameState.getActiveProfile().settings;

        // Tur Sayısı (Rounds: 3, 5, 8)
        const lblRounds = this.add.text(-440, y, 'Tur Sayısı:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#334155'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblRounds);

        [3, 5, 8].forEach((r, i) => {
            const btn = this.add.container(-310 + i * 80, y);
            this.drawChip(btn, `${r} Tur`, settings.roundsPerGame === r, 72, 34);
            btn.setSize(72, 34);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                settings.roundsPerGame = r;
                [3, 5, 8].forEach(v => {
                    const b = this.roundsChips.get(v);
                    if (b) this.drawChip(b, `${v} Tur`, v === r, 72, 34);
                });
            });
            this.mainContainer.add(btn);
            this.roundsChips.set(r, btn);
        });

        // Kart Sayısı (Cards: 2, 3)
        const lblCards = this.add.text(30, y, 'Kart Sayısı:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#334155'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblCards);

        [2, 3].forEach((c, i) => {
            const btn = this.add.container(160 + i * 85, y);
            this.drawChip(btn, `${c} Kart`, settings.cardCount === c, 76, 34);
            btn.setSize(76, 34);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                settings.cardCount = c;
                [2, 3].forEach(v => {
                    const b = this.cardChips.get(v);
                    if (b) this.drawChip(b, `${v} Kart`, v === c, 76, 34);
                });
            });
            this.mainContainer.add(btn);
            this.cardChips.set(c, btn);
        });

        // Konuşma Hızı (Speech rate) & Ses Açma/Kapama
        const y2 = 45;
        const lblSpeed = this.add.text(-440, y2, 'Konuşma Hızı:', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '17px',
            color: '#334155'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(lblSpeed);

        const speeds = [
            { rate: 0.75, label: 'Yavaş (0.75x)' },
            { rate: 1.0, label: 'Normal (1.0x)' }
        ];
        speeds.forEach((s, i) => {
            const btn = this.add.container(-300 + i * 140, y2);
            const isSelected = Math.abs(settings.speechRate - s.rate) < 0.1;
            this.drawChip(btn, s.label, isSelected, 130, 34);
            btn.setSize(130, 34);
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                soundManager.playTap();
                settings.speechRate = s.rate;
                speeds.forEach(sp => {
                    const b = this.speedChips.get(sp.rate);
                    if (b) this.drawChip(b, sp.label, sp.rate === s.rate, 130, 34);
                });
            });
            this.mainContainer.add(btn);
            this.speedChips.set(s.rate, btn);
        });

        // Ses Açık/Kapalı
        this.audioToggleBtn = this.add.container(200, y2);
        this.drawChip(this.audioToggleBtn, settings.soundEnabled ? 'Ses: Açık 🔊' : 'Ses: Kapalı 🔇', settings.soundEnabled, 140, 34);
        this.audioToggleBtn.setSize(140, 34);
        this.audioToggleBtn.setInteractive({ useHandCursor: true });
        this.audioToggleBtn.on('pointerdown', () => {
            soundManager.playTap();
            settings.soundEnabled = !settings.soundEnabled;
            this.drawChip(this.audioToggleBtn, settings.soundEnabled ? 'Ses: Açık 🔊' : 'Ses: Kapalı 🔇', settings.soundEnabled, 140, 34);
        });
        this.mainContainer.add(this.audioToggleBtn);
    }

    private buildSessionSummarySection(): void {
        const y = 115;

        // Session Box (900x125)
        const box = this.add.graphics();
        box.fillStyle(0xF8FAFC, 1);
        box.fillRoundedRect(-450, y, 900, 125, 18);
        box.lineStyle(2, 0xE2E8F0, 1);
        box.strokeRoundedRect(-450, y, 900, 125, 18);
        this.mainContainer.add(box);

        const title = this.add.text(-430, y + 20, '📊 Bugünkü Seans Özeti', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '18px',
            color: '#1E293B'
        }).setOrigin(0, 0.5);
        this.mainContainer.add(title);

        this.summaryText = this.add.text(-430, y + 55, '', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '16px',
            color: '#475569',
            lineSpacing: 8
        });
        this.mainContainer.add(this.summaryText);
        this.updateSummaryText();

        // Reset Session Button
        const resetBtn = this.add.container(330, y + 60);
        const rBg = this.add.graphics();
        rBg.fillStyle(0xFEE2E2, 1);
        rBg.fillRoundedRect(-90, -18, 180, 36, 18);
        rBg.lineStyle(2, 0xFCA5A5, 1);
        rBg.strokeRoundedRect(-90, -18, 180, 36, 18);
        const rTxt = this.add.text(0, 0, 'Seansı Sıfırla ↻', {
            fontFamily: 'Fredoka, Quicksand, sans-serif',
            fontSize: '15px',
            color: '#991B1B'
        }).setOrigin(0.5);
        resetBtn.add([rBg, rTxt]);
        resetBtn.setSize(180, 36);
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
            `Tarih: ${stats.date}   |   Doğru Tanıma: ${stats.correctCount}   |   Artikülasyon Tekrarı: ${stats.repeatCount}   |   Tamamlanan Oyun: ${stats.gamesCompleted}   |   Kazanılan Yıldız: ${stats.starsEarned} ⭐`
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
            fontSize: '15px',
            color: isSelected ? '#FFFFFF' : '#334155'
        }).setOrigin(0.5);

        container.add([bg, text]);
    }
}
