import type { CategoryId } from './categories';

export type WordLevel = 1 | 2 | 3;

export interface Word {
  id: string;
  text: string;
  emoji: string;
  category: CategoryId;
  level: WordLevel;
  /** Varsayılan kelimeler gizlenebilir, silinmez. */
  isCustom?: boolean;
  hidden?: boolean;
}

/** Türkçe karakterleri ASCII id için sadeleştirir. */
export function toWordId(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const RAW: Array<[string, string, CategoryId, WordLevel]> = [
  // hayvanlar
  ['kedi', '🐱', 'hayvanlar', 1],
  ['köpek', '🐶', 'hayvanlar', 1],
  ['kuş', '🐦', 'hayvanlar', 1],
  ['balık', '🐟', 'hayvanlar', 1],
  ['inek', '🐮', 'hayvanlar', 1],
  ['at', '🐴', 'hayvanlar', 1],
  ['tavşan', '🐰', 'hayvanlar', 2],
  ['kurbağa', '🐸', 'hayvanlar', 2],
  ['arı', '🐝', 'hayvanlar', 2],
  ['kaplumbağa', '🐢', 'hayvanlar', 3],
  // yiyecekler
  ['elma', '🍎', 'yiyecekler', 1],
  ['muz', '🍌', 'yiyecekler', 1],
  ['ekmek', '🍞', 'yiyecekler', 1],
  ['süt', '🥛', 'yiyecekler', 1],
  ['yumurta', '🥚', 'yiyecekler', 1],
  ['peynir', '🧀', 'yiyecekler', 2],
  ['havuç', '🥕', 'yiyecekler', 2],
  ['portakal', '🍊', 'yiyecekler', 2],
  ['üzüm', '🍇', 'yiyecekler', 2],
  ['çilek', '🍓', 'yiyecekler', 3],
  // tasitlar
  ['araba', '🚗', 'tasitlar', 1],
  ['otobüs', '🚌', 'tasitlar', 1],
  ['uçak', '✈️', 'tasitlar', 1],
  ['gemi', '🚢', 'tasitlar', 1],
  ['bisiklet', '🚲', 'tasitlar', 2],
  ['tren', '🚆', 'tasitlar', 2],
  ['kamyon', '🚚', 'tasitlar', 2],
  ['helikopter', '🚁', 'tasitlar', 3],
  ['motosiklet', '🏍️', 'tasitlar', 3],
  ['ambulans', '🚑', 'tasitlar', 3],
  // giysiler
  ['ayakkabı', '👟', 'giysiler', 1],
  ['çorap', '🧦', 'giysiler', 1],
  ['şapka', '🧢', 'giysiler', 1],
  ['tişört', '👕', 'giysiler', 2],
  ['pantolon', '👖', 'giysiler', 2],
  ['elbise', '👗', 'giysiler', 2],
  ['eldiven', '🧤', 'giysiler', 2],
  ['ceket', '🧥', 'giysiler', 3],
  ['atkı', '🧣', 'giysiler', 3],
  ['terlik', '🩴', 'giysiler', 3],
  // ev
  ['yatak', '🛏️', 'ev', 1],
  ['kapı', '🚪', 'ev', 1],
  ['sandalye', '🪑', 'ev', 1],
  ['kaşık', '🥄', 'ev', 1],
  ['lamba', '💡', 'ev', 2],
  ['saat', '⏰', 'ev', 2],
  ['telefon', '📱', 'ev', 2],
  ['anahtar', '🔑', 'ev', 2],
  ['fincan', '☕', 'ev', 3],
  ['diş fırçası', '🪥', 'ev', 3],
  // doga
  ['güneş', '☀️', 'doga', 1],
  ['ay', '🌙', 'doga', 1],
  ['yıldız', '⭐', 'doga', 1],
  ['bulut', '☁️', 'doga', 1],
  ['yağmur', '🌧️', 'doga', 2],
  ['çiçek', '🌸', 'doga', 2],
  ['ağaç', '🌳', 'doga', 2],
  ['kar', '❄️', 'doga', 2],
  ['gökkuşağı', '🌈', 'doga', 3],
  ['yaprak', '🍃', 'doga', 3],
];

export const DEFAULT_WORDS: Word[] = RAW.map(([text, emoji, category, level]) => ({
  id: toWordId(text),
  text,
  emoji,
  category,
  level,
  isCustom: false,
  hidden: false,
}));

export const DEFAULT_WORD_COUNT = DEFAULT_WORDS.length;
