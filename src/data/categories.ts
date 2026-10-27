export type CategoryId =
  | 'hayvanlar'
  | 'yiyecekler'
  | 'tasitlar'
  | 'giysiler'
  | 'ev'
  | 'doga';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  gardenZone: string;
  colors: {
    ground: string;
    accent: string;
  };
}

export const CATEGORIES: Category[] = [
  {
    id: 'hayvanlar',
    name: 'Hayvanlar',
    emoji: '🐾',
    gardenZone: 'Çiftlik',
    colors: { ground: '#FFD9B3', accent: '#F4A259' },
  },
  {
    id: 'yiyecekler',
    name: 'Yiyecekler',
    emoji: '🍎',
    gardenZone: 'Meyve Bahçesi',
    colors: { ground: '#FFD6D6', accent: '#F28B82' },
  },
  {
    id: 'tasitlar',
    name: 'Taşıtlar',
    emoji: '🚗',
    gardenZone: 'Küçük Kasaba Yolu',
    colors: { ground: '#CDE7F7', accent: '#5DA9E9' },
  },
  {
    id: 'giysiler',
    name: 'Giysiler',
    emoji: '👕',
    gardenZone: 'Çamaşır İpi',
    colors: { ground: '#E6D9F5', accent: '#A98BD6' },
  },
  {
    id: 'ev',
    name: 'Ev Eşyaları',
    emoji: '🏠',
    gardenZone: 'Bahçe Evi',
    colors: { ground: '#FFF2B3', accent: '#E8C547' },
  },
  {
    id: 'doga',
    name: 'Doğa',
    emoji: '🌈',
    gardenZone: 'Gökyüzü ve Çayır',
    colors: { ground: '#CFEFD9', accent: '#6CC08B' },
  },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
