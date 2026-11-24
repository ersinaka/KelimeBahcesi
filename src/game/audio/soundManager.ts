import { gameState } from '../state/gameState';

export class SoundManager {
    private static instance: SoundManager;
    private audioCtx: AudioContext | null = null;
    private turkishVoice: SpeechSynthesisVoice | null = null;
    private voicesLoaded: boolean = false;

    private constructor() {
        this.initSpeech();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private getAudioContext(): AudioContext | null {
        if (!this.audioCtx && typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    }

    private initSpeech(): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                this.turkishVoice = voices.find(v => v.lang.startsWith('tr')) || null;
                this.voicesLoaded = true;
            }
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    public isSoundEnabled(): boolean {
        return gameState.getActiveProfile().settings.soundEnabled;
    }

    public getSpeechRate(): number {
        return gameState.getActiveProfile().settings.speechRate || 0.85;
    }

    /**
     * Speaks text using Turkish Web Speech API
     */
    public speak(text: string, onEnd?: () => void): void {
        if (!this.isSoundEnabled()) {
            if (onEnd) setTimeout(onEnd, 300);
            return;
        }

        if (typeof window === 'undefined' || !window.speechSynthesis) {
            if (onEnd) setTimeout(onEnd, 300);
            return;
        }

        try {
            window.speechSynthesis.cancel(); // Cancel any existing speech

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = this.getSpeechRate();
            utterance.pitch = 1.15; // friendly, slightly higher cheerful pitch for child interaction

            if (this.turkishVoice) {
                utterance.voice = this.turkishVoice;
            } else if (!this.voicesLoaded) {
                const voices = window.speechSynthesis.getVoices();
                const tr = voices.find(v => v.lang.startsWith('tr'));
                if (tr) utterance.voice = tr;
            }

            if (onEnd) {
                utterance.onend = () => onEnd();
                utterance.onerror = () => onEnd();
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis error:', e);
            if (onEnd) setTimeout(onEnd, 300);
        }
    }

    public stopSpeech(): void {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
            } catch {
                // ignore
            }
        }
    }

    /**
     * Synthesizes a soft tone or note using Web Audio API
     */
    private playTone(freq: number, type: OscillatorType, startTime: number, duration: number, startVol: number = 0.2, endVol: number = 0.001): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(startVol, startTime);
            gain.gain.exponentialRampToValueAtTime(endVol, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        } catch {
            // Audio context policy fallback
        }
    }

    /**
     * Crisp, bright, sparkling short "bingg!" chime for instant positive sensory reinforcement
     */
    public playSuccessBing(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        // Crisp primary bell (C6)
        this.playTone(1046.50, 'sine', now, 0.32, 0.28, 0.0001);
        // Bright bell sparkle harmonic (E6 & G6)
        this.playTone(1318.51, 'triangle', now + 0.02, 0.25, 0.16, 0.0001);
        this.playTone(1567.98, 'sine', now + 0.04, 0.22, 0.14, 0.0001);
        this.playTone(2093.00, 'sine', now + 0.05, 0.18, 0.10, 0.0001);
    }

    /**
     * Cheerful gentle chime for correct answers (C5 - E5 - G5 - C6)
     */
    public playChime(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            this.playTone(freq, 'sine', now + i * 0.08, 0.35, 0.18, 0.001);
            // subtle overtone for warmth
            this.playTone(freq * 2, 'triangle', now + i * 0.08, 0.2, 0.04, 0.001);
        });
    }

    /**
     * Soft UI tap (woodblock / marimba style)
     */
    public playTap(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        this.playTone(480, 'triangle', now, 0.08, 0.15, 0.001);
    }

    /**
     * Gentle neutral encouraging wobble for retry - NEVER harsh or sad!
     * (E.g. A pleasant two-tone chime: F4 -> A4)
     */
    public playTryAgain(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        this.playTone(349.23, 'sine', now, 0.15, 0.12, 0.001);       // F4
        this.playTone(440.00, 'sine', now + 0.12, 0.22, 0.12, 0.001); // A4
    }

    /**
     * Sparkle twinkle sound for star collection
     */
    public playStar(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        const notes = [880, 1046.50, 1318.51, 1567.98]; // A5, C6, E6, G6
        notes.forEach((freq, i) => {
            this.playTone(freq, 'sine', now + i * 0.06, 0.25, 0.12, 0.001);
        });
    }

    /**
     * Celebratory fanfare for level clear or egg hatching
     */
    public playCelebrate(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        const fanfare = [
            { f: 523.25, t: 0, d: 0.12 },
            { f: 659.25, t: 0.12, d: 0.12 },
            { f: 783.99, t: 0.24, d: 0.12 },
            { f: 1046.50, t: 0.36, d: 0.35 },
            { f: 880.00, t: 0.50, d: 0.12 },
            { f: 1046.50, t: 0.64, d: 0.5 }
        ];

        fanfare.forEach(note => {
            this.playTone(note.f, 'triangle', now + note.t, note.d, 0.18, 0.001);
            this.playTone(note.f * 1.5, 'sine', now + note.t, note.d * 0.8, 0.06, 0.001);
        });
    }

    /**
     * Egg crack gentle pop
     */
    public playCrack(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        this.playTone(600, 'sawtooth', now, 0.04, 0.1, 0.001);
        this.playTone(850, 'triangle', now + 0.03, 0.07, 0.12, 0.001);
    }

    /**
     * Bouncing spring sound
     */
    public playBounce(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        this.playTone(300, 'sine', now, 0.18, 0.15, 0.001);
        this.playTone(450, 'sine', now + 0.05, 0.15, 0.12, 0.001);
    }

    /**
     * Sweet heart floating sound
     */
    public playHeart(): void {
        const ctx = this.getAudioContext();
        if (!ctx || !this.isSoundEnabled()) return;

        const now = ctx.currentTime;
        this.playTone(587.33, 'sine', now, 0.2, 0.12, 0.001); // D5
        this.playTone(739.99, 'sine', now + 0.1, 0.25, 0.12, 0.001); // F#5
    }
}

export const soundManager = SoundManager.getInstance();
