import type { PersistedSlice } from '../store/useAppStore';

export function exportToJson(data: PersistedSlice): string {
  return JSON.stringify(
    {
      app: 'kelime-bahcesi',
      exportedAt: new Date().toISOString(),
      ...data,
    },
    null,
    2,
  );
}

export function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportJson(raw: string): PersistedSlice {
  const parsed = JSON.parse(raw) as Partial<PersistedSlice> & { app?: string };
  if (!parsed.profiles || !parsed.words || !parsed.settings) {
    throw new Error('Geçersiz Kelime Bahçesi yedek dosyası.');
  }
  return {
    version: parsed.version ?? 1,
    profiles: parsed.profiles,
    activeProfileId: parsed.activeProfileId ?? null,
    words: parsed.words,
    wordStats: parsed.wordStats ?? [],
    sessions: parsed.sessions ?? [],
    settings: parsed.settings,
    badges: parsed.badges ?? {},
    playStreak: parsed.playStreak ?? {},
  };
}
