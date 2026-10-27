import type { CategoryId } from '../data/categories';
import { CATEGORIES } from '../data/categories';
import type { Word } from '../data/words';

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function parseCategoryParam(raw: string | null): CategoryId[] | undefined {
  if (!raw || raw === 'all') return undefined;
  const found = CATEGORIES.find((c) => c.id === raw);
  return found ? [found.id] : undefined;
}

/** Kolay: başka kategoriden; zor: aynı kategoriden çeldirici. */
export function pickDistractors(
  target: Word,
  pool: Word[],
  count: number,
  hardMode: boolean,
): Word[] {
  const others = pool.filter((w) => w.id !== target.id && !w.hidden);
  const preferred = hardMode
    ? others.filter((w) => w.category === target.category)
    : others.filter((w) => w.category !== target.category);
  const source = preferred.length >= count ? preferred : others;
  return shuffle(source).slice(0, count);
}

export function pickOpponentCategory(
  correct: CategoryId,
  allowed?: CategoryId[],
): CategoryId {
  const pool = (allowed?.length ? allowed : CATEGORIES.map((c) => c.id)).filter(
    (id) => id !== correct,
  );
  if (pool.length === 0) {
    const fallback = CATEGORIES.map((c) => c.id).filter((id) => id !== correct);
    return shuffle(fallback)[0] ?? 'doga';
  }
  return shuffle(pool)[0]!;
}
