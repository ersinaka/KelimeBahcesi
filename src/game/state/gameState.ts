import { ANIMALS, AnimalData } from '../data/animals';

export interface ProfileStats {
    date: string;
    correctCount: number;
    repeatCount: number;
    gamesCompleted: number;
    starsEarned: number;
}

export interface TherapistSettings {
    selectedTargetSounds: string[]; // empty array = all
    enabledAnimalIds: string[];    // animal ids enabled
    roundsPerGame: number;         // 3, 5, or 8
    cardCount: number;             // 2 or 3
    soundEnabled: boolean;
    speechRate: number;            // 1.0 (normal) or 0.75 (yavaş)
}

export interface ProfileData {
    profileId: string;
    unlockedAnimalIds: string[];
    fedAnimalIds: string[];
    stars: number;
    settings: TherapistSettings;
    todayStats: ProfileStats;
}

const STORAGE_KEY = 'kelime_bahcesi_save_v1';
const ACTIVE_PROFILE_KEY = 'kelime_bahcesi_active_profile';

const DEFAULT_SETTINGS: TherapistSettings = {
    selectedTargetSounds: [],
    enabledAnimalIds: ANIMALS.map(a => a.id),
    roundsPerGame: 5,
    cardCount: 3,
    soundEnabled: true,
    speechRate: 0.85 // slightly measured and clear for young children & therapy
};

function getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export class GameStateManager {
    private static instance: GameStateManager;
    
    public currentProfileId: string = 'Profil 1';
    public profiles: Record<string, ProfileData> = {};

    private constructor() {
        this.load();
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    private getDefaultProfile(profileId: string): ProfileData {
        return {
            profileId,
            unlockedAnimalIds: [], // initially 0 unlocked; egg on farm!
            fedAnimalIds: [],
            stars: 0,
            settings: { ...DEFAULT_SETTINGS },
            todayStats: {
                date: getTodayString(),
                correctCount: 0,
                repeatCount: 0,
                gamesCompleted: 0,
                starsEarned: 0
            }
        };
    }

    public load(): void {
        try {
            const savedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
            if (savedProfileId) {
                this.currentProfileId = savedProfileId;
            }

            const rawData = localStorage.getItem(STORAGE_KEY);
            if (rawData) {
                const parsed = JSON.parse(rawData);
                this.profiles = parsed.profiles || {};
            }
        } catch (e) {
            console.warn('Could not load Kelime Bahçesi save state:', e);
        }

        // Ensure default profiles exist
        ['Profil 1', 'Profil 2', 'Profil 3'].forEach(pid => {
            if (!this.profiles[pid]) {
                this.profiles[pid] = this.getDefaultProfile(pid);
            }
        });

        // Check if date changed for today stats
        const active = this.getActiveProfile();
        const today = getTodayString();
        if (active.todayStats.date !== today) {
            active.todayStats = {
                date: today,
                correctCount: 0,
                repeatCount: 0,
                gamesCompleted: 0,
                starsEarned: 0
            };
            this.save();
        }
    }

    public save(): void {
        try {
            localStorage.setItem(ACTIVE_PROFILE_KEY, this.currentProfileId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                profiles: this.profiles
            }));
        } catch (e) {
            console.warn('Could not save Kelime Bahçesi state:', e);
        }
    }

    public getActiveProfile(): ProfileData {
        if (!this.profiles[this.currentProfileId]) {
            this.profiles[this.currentProfileId] = this.getDefaultProfile(this.currentProfileId);
        }
        return this.profiles[this.currentProfileId];
    }

    public switchProfile(profileId: string): void {
        this.currentProfileId = profileId;
        if (!this.profiles[profileId]) {
            this.profiles[profileId] = this.getDefaultProfile(profileId);
        }
        this.save();
    }

    public getActiveAnimals(): AnimalData[] {
        const settings = this.getActiveProfile().settings;
        let pool = ANIMALS.filter(a => settings.enabledAnimalIds.includes(a.id));

        // Filter by target sounds if any selected
        if (settings.selectedTargetSounds && settings.selectedTargetSounds.length > 0) {
            pool = pool.filter(a => 
                a.targetSounds.some(ts => settings.selectedTargetSounds.includes(ts))
            );
        }

        // Fallback to all enabled or all animals if pool becomes empty
        if (pool.length === 0) {
            pool = ANIMALS;
        }
        return pool;
    }

    public addStar(count: number = 1): void {
        const profile = this.getActiveProfile();
        profile.stars += count;
        profile.todayStats.starsEarned += count;
        this.save();
    }

    public recordCorrect(): void {
        const profile = this.getActiveProfile();
        profile.todayStats.correctCount++;
        this.addStar(1);
    }

    public recordRepeat(): void {
        const profile = this.getActiveProfile();
        profile.todayStats.repeatCount++;
        this.addStar(1);
    }

    public recordGameCompleted(): void {
        const profile = this.getActiveProfile();
        profile.todayStats.gamesCompleted++;
        this.save();
    }

    public unlockNextAnimal(): AnimalData | null {
        const profile = this.getActiveProfile();
        const lockedAnimals = ANIMALS.filter(a => !profile.unlockedAnimalIds.includes(a.id));
        if (lockedAnimals.length === 0) {
            return null;
        }

        // Prefer currently enabled/targeted animals if possible
        const activePool = this.getActiveAnimals();
        const candidateInPool = activePool.find(a => !profile.unlockedAnimalIds.includes(a.id));
        const newlyUnlocked = candidateInPool || lockedAnimals[0];

        profile.unlockedAnimalIds.push(newlyUnlocked.id);
        this.save();
        return newlyUnlocked;
    }

    public feedAnimal(animalId: string): void {
        const profile = this.getActiveProfile();
        if (!profile.fedAnimalIds.includes(animalId)) {
            profile.fedAnimalIds.push(animalId);
            this.save();
        }
    }

    public isAnimalUnlocked(animalId: string): boolean {
        return this.getActiveProfile().unlockedAnimalIds.includes(animalId);
    }

    public isAnimalFed(animalId: string): boolean {
        return this.getActiveProfile().fedAnimalIds.includes(animalId);
    }

    public resetSessionStats(): void {
        const profile = this.getActiveProfile();
        profile.todayStats = {
            date: getTodayString(),
            correctCount: 0,
            repeatCount: 0,
            gamesCompleted: 0,
            starsEarned: 0
        };
        this.save();
    }

    public resetAllProgress(): void {
        const profile = this.getActiveProfile();
        profile.unlockedAnimalIds = [];
        profile.fedAnimalIds = [];
        profile.stars = 0;
        this.resetSessionStats();
    }
}

export const gameState = GameStateManager.getInstance();
