import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CategoryId } from '../data/categories';
import { DEFAULT_WORDS, type Word, type WordLevel } from '../data/words';
import { theme } from '../data/theme';

export type ActivityType = 'match' | 'categorize' | 'say';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  targetCategories: CategoryId[];
  maxLevel: WordLevel;
  createdAt: string;
}

export interface WordStat {
  profileId: string;
  wordId: string;
  correct: number;
  attempts: number;
  learned: boolean;
  lastSeen: string | null;
}

export interface Session {
  id: string;
  profileId: string;
  activity: ActivityType;
  startedAt: string;
  durationSec: number;
  correct: number;
  attempts: number;
  note: string;
}

export interface Settings {
  volume: number;
  soundEnabled: boolean;
  simpleMode: boolean;
  hardMode: boolean;
  questionsPerSession: 5 | 8 | 12;
  pin: string;
  /** İfade edici dil: kendi sesini geri dinle (MediaRecorder). */
  playbackOwnVoice: boolean;
}

export interface AppState {
  version: number;
  profiles: Profile[];
  activeProfileId: string | null;
  words: Word[];
  wordStats: WordStat[];
  sessions: Session[];
  settings: Settings;
  badges: Record<string, string[]>;
  playStreak: Record<string, { lastPlayDate: string; days: number }>;
  therapistUnlocked: boolean;

  // Profil
  addProfile: (input: Omit<Profile, 'id' | 'createdAt'>) => string;
  updateProfile: (id: string, patch: Partial<Omit<Profile, 'id' | 'createdAt'>>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;

  // Kelimeler
  addCustomWord: (word: Omit<Word, 'id' | 'isCustom' | 'hidden'>) => string;
  updateWord: (id: string, patch: Partial<Omit<Word, 'id' | 'isCustom'>>) => void;
  setWordHidden: (id: string, hidden: boolean) => void;

  // İlerleme
  recordAttempt: (profileId: string, wordId: string, correct: boolean) => void;
  getWordStat: (profileId: string, wordId: string) => WordStat | undefined;

  // Seans
  addSession: (session: Omit<Session, 'id'>) => string;
  updateSessionNote: (sessionId: string, note: string) => void;

  // Ayarlar
  updateSettings: (patch: Partial<Settings>) => void;
  setTherapistUnlocked: (unlocked: boolean) => void;
  verifyPin: (pin: string) => boolean;

  /** Rozet + üst üste gün; yeni kazanılan rozet id'lerini döner. */
  awardProgressRewards: (profileId: string) => string[];

  // Toplu veri
  replaceAllData: (data: PersistedSlice) => void;
  clearAllData: () => void;
}

export const BADGE_LABELS: Record<string, string> = {
  first_word: 'İlk kelime!',
  ten_words: '10 kelime öğrendin!',
  zone_complete: 'Bir bölgeyi tamamladın!',
  streak_3: '3 gün üst üste!',
};

export type PersistedSlice = Pick<
  AppState,
  | 'version'
  | 'profiles'
  | 'activeProfileId'
  | 'words'
  | 'wordStats'
  | 'sessions'
  | 'settings'
  | 'badges'
  | 'playStreak'
>;

const SCHEMA_VERSION = 1;

const AVATAR_OPTIONS = ['🐻', '🐰', '🦊', '🐼', '🐸'] as const;
export { AVATAR_OPTIONS };

const defaultSettings = (): Settings => ({
  volume: theme.defaultVolume,
  soundEnabled: true,
  simpleMode: false,
  hardMode: false,
  questionsPerSession: 8,
  pin: '1234',
  playbackOwnVoice: false,
});

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function emptyPersisted(): PersistedSlice {
  return {
    version: SCHEMA_VERSION,
    profiles: [],
    activeProfileId: null,
    words: DEFAULT_WORDS.map((w) => ({ ...w })),
    wordStats: [],
    sessions: [],
    settings: defaultSettings(),
    badges: {},
    playStreak: {},
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyPersisted(),
      therapistUnlocked: false,

      addProfile: (input) => {
        const id = uid('profile');
        const profile: Profile = {
          ...input,
          id,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          profiles: [...s.profiles, profile],
          activeProfileId: id,
          badges: { ...s.badges, [id]: [] },
          playStreak: { ...s.playStreak, [id]: { lastPlayDate: '', days: 0 } },
        }));
        return id;
      },

      updateProfile: (id, patch) => {
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
      },

      deleteProfile: (id) => {
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
          wordStats: s.wordStats.filter((w) => w.profileId !== id),
          sessions: s.sessions.filter((sess) => sess.profileId !== id),
          badges: Object.fromEntries(Object.entries(s.badges).filter(([k]) => k !== id)),
          playStreak: Object.fromEntries(Object.entries(s.playStreak).filter(([k]) => k !== id)),
        }));
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      addCustomWord: (word) => {
        const id = uid('word');
        const next: Word = { ...word, id, isCustom: true, hidden: false };
        set((s) => ({ words: [...s.words, next] }));
        return id;
      },

      updateWord: (id, patch) => {
        set((s) => ({
          words: s.words.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        }));
      },

      setWordHidden: (id, hidden) => {
        set((s) => ({
          words: s.words.map((w) => (w.id === id ? { ...w, hidden } : w)),
        }));
      },

      recordAttempt: (profileId, wordId, correct) => {
        set((s) => {
          const existing = s.wordStats.find(
            (w) => w.profileId === profileId && w.wordId === wordId,
          );
          if (!existing) {
            const correctCount = correct ? 1 : 0;
            const created: WordStat = {
              profileId,
              wordId,
              correct: correctCount,
              attempts: 1,
              learned: correctCount >= 3,
              lastSeen: new Date().toISOString(),
            };
            return { wordStats: [...s.wordStats, created] };
          }
          const correctCount = existing.correct + (correct ? 1 : 0);
          const updated: WordStat = {
            ...existing,
            correct: correctCount,
            attempts: existing.attempts + 1,
            learned: correctCount >= 3,
            lastSeen: new Date().toISOString(),
          };
          return {
            wordStats: s.wordStats.map((w) =>
              w.profileId === profileId && w.wordId === wordId ? updated : w,
            ),
          };
        });
      },

      getWordStat: (profileId, wordId) =>
        get().wordStats.find((w) => w.profileId === profileId && w.wordId === wordId),

      addSession: (session) => {
        const id = uid('session');
        set((s) => ({ sessions: [...s.sessions, { ...session, id }] }));
        return id;
      },

      updateSessionNote: (sessionId, note) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, note } : sess,
          ),
        }));
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      setTherapistUnlocked: (unlocked) => set({ therapistUnlocked: unlocked }),

      verifyPin: (pin) => get().settings.pin === pin,

      awardProgressRewards: (profileId) => {
        const state = get();
        const owned = new Set(state.badges[profileId] ?? []);
        const earned: string[] = [];
        const learned = state.wordStats.filter(
          (s) => s.profileId === profileId && s.learned,
        ).length;

        if (learned >= 1 && !owned.has('first_word')) earned.push('first_word');
        if (learned >= 10 && !owned.has('ten_words')) earned.push('ten_words');

        const byCat = new Map<string, { learned: number; total: number }>();
        for (const w of state.words.filter((x) => !x.hidden)) {
          const cur = byCat.get(w.category) ?? { learned: 0, total: 0 };
          cur.total += 1;
          if (
            state.wordStats.some(
              (s) => s.profileId === profileId && s.wordId === w.id && s.learned,
            )
          ) {
            cur.learned += 1;
          }
          byCat.set(w.category, cur);
        }
        const anyZoneDone = [...byCat.values()].some(
          (c) => c.total > 0 && c.learned >= c.total,
        );
        if (anyZoneDone && !owned.has('zone_complete')) earned.push('zone_complete');

        const today = new Date().toISOString().slice(0, 10);
        const streak = state.playStreak[profileId] ?? { lastPlayDate: '', days: 0 };
        let days = streak.days;
        if (streak.lastPlayDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const y = yesterday.toISOString().slice(0, 10);
          days = streak.lastPlayDate === y ? streak.days + 1 : 1;
        }
        if (days >= 3 && !owned.has('streak_3')) earned.push('streak_3');

        if (earned.length || streak.lastPlayDate !== today) {
          set((s) => ({
            badges: {
              ...s.badges,
              [profileId]: [...(s.badges[profileId] ?? []), ...earned],
            },
            playStreak: {
              ...s.playStreak,
              [profileId]: { lastPlayDate: today, days },
            },
          }));
        }
        return earned;
      },

      replaceAllData: (data) => {
        set({
          ...data,
          therapistUnlocked: false,
        });
      },

      clearAllData: () => {
        set({ ...emptyPersisted(), therapistUnlocked: false });
      },
    }),
    {
      name: 'kelime-bahcesi',
      version: SCHEMA_VERSION,
      partialize: (state): PersistedSlice => ({
        version: state.version,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        words: state.words,
        wordStats: state.wordStats,
        sessions: state.sessions,
        settings: state.settings,
        badges: state.badges,
        playStreak: state.playStreak,
      }),
      migrate: (persisted) => {
        const data = (persisted ?? {}) as Partial<PersistedSlice>;
        return {
          ...emptyPersisted(),
          ...data,
          version: SCHEMA_VERSION,
          words: data.words?.length ? data.words : DEFAULT_WORDS.map((w) => ({ ...w })),
          settings: { ...defaultSettings(), ...data.settings },
        };
      },
    },
  ),
);

export function selectActiveProfile(state: AppState): Profile | null {
  if (!state.activeProfileId) return null;
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? null;
}

export function selectVisibleWords(state: AppState): Word[] {
  return state.words.filter((w) => !w.hidden);
}
