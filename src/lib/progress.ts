import type { CategoryId } from '../data/categories';
import type { Word, WordLevel } from '../data/words';
import type { WordStat } from '../store/useAppStore';

export type GrowthStage = 0 | 1 | 2 | 3;

/** 0 boş toprak, 1 tohum, 2 filiz, 3 öğrenildi. */
export function getGrowthStage(stat: WordStat | undefined): GrowthStage {
  if (!stat) return 0;
  if (stat.learned || stat.correct >= 3) return 3;
  if (stat.correct === 2) return 2;
  if (stat.correct === 1) return 1;
  return 0;
}

export function stageEmoji(stage: GrowthStage): string {
  switch (stage) {
    case 0:
      return '🟤';
    case 1:
      return '🌱';
    case 2:
      return '🌿';
    case 3:
      return '✨';
  }
}

export function countLearned(stats: WordStat[], profileId: string): number {
  return stats.filter((s) => s.profileId === profileId && s.learned).length;
}

export function learnedInCategory(
  words: Word[],
  stats: WordStat[],
  profileId: string,
  category: CategoryId,
): { learned: number; total: number } {
  const inCat = words.filter((w) => w.category === category && !w.hidden);
  const learned = inCat.filter((w) =>
    stats.some((s) => s.profileId === profileId && s.wordId === w.id && s.learned),
  ).length;
  return { learned, total: inCat.length };
}

/**
 * Seviye 1'in %80'i öğrenilince seviye 2, sonra seviye 3 açılır.
 * Profil maxLevel üst sınırı da uygulanır.
 */
export function getUnlockedLevel(
  words: Word[],
  stats: WordStat[],
  profileId: string,
  profileMaxLevel: WordLevel,
): WordLevel {
  const level1 = words.filter((w) => w.level === 1 && !w.hidden);
  const learned1 = level1.filter((w) =>
    stats.some((s) => s.profileId === profileId && s.wordId === w.id && s.learned),
  ).length;
  const ratio1 = level1.length === 0 ? 1 : learned1 / level1.length;

  let unlocked: WordLevel = 1;
  if (ratio1 >= 0.8) {
    unlocked = 2;
    const level2 = words.filter((w) => w.level === 2 && !w.hidden);
    const learned2 = level2.filter((w) =>
      stats.some((s) => s.profileId === profileId && s.wordId === w.id && s.learned),
    ).length;
    const ratio2 = level2.length === 0 ? 1 : learned2 / level2.length;
    if (ratio2 >= 0.8) unlocked = 3;
  }

  return Math.min(unlocked, profileMaxLevel) as WordLevel;
}

/**
 * Öğrenilmemiş ve yanlış yapılan kelimeler daha sık gelir.
 * Önce açık seviyedeki kelimeler.
 */
export function pickWeightedWords(
  words: Word[],
  stats: WordStat[],
  profileId: string,
  count: number,
  options: {
    categories?: CategoryId[];
    maxLevel: WordLevel;
  },
): Word[] {
  const unlocked = getUnlockedLevel(words, stats, profileId, options.maxLevel);
  let pool = words.filter(
    (w) => !w.hidden && w.level <= unlocked && w.level <= options.maxLevel,
  );
  if (options.categories?.length) {
    pool = pool.filter((w) => options.categories!.includes(w.category));
  }
  if (pool.length === 0) return [];

  const weighted = pool.map((w) => {
    const st = stats.find((s) => s.profileId === profileId && s.wordId === w.id);
    let weight = 3;
    if (!st) weight = 5;
    else if (st.learned) weight = 0.5;
    else {
      const failRate = st.attempts === 0 ? 0 : 1 - st.correct / st.attempts;
      weight = 4 + failRate * 4;
    }
    return { word: w, weight };
  });

  const picked: Word[] = [];
  const copy = [...weighted];
  while (picked.length < count && copy.length > 0) {
    const total = copy.reduce((sum, x) => sum + x.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < copy.length; idx++) {
      r -= copy[idx].weight;
      if (r <= 0) break;
    }
    idx = Math.min(idx, copy.length - 1);
    picked.push(copy[idx].word);
    copy.splice(idx, 1);
  }
  return picked;
}
