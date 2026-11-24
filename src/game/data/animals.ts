export interface AnimalData {
    id: string;
    name: string;
    turkishName: string;
    emoji: string;
    soundText: string;
    targetSounds: string[]; // e.g. ['k', 'd']
    syllables: string[];    // e.g. ['KE', 'Dİ']
    foodId: string;
    foodName: string;
    foodEmoji: string;
    bgColor: number;        // pastel background color for cards
    accentColor: number;
    description: string;
}

export interface FoodData {
    id: string;
    name: string;
    emoji: string;
    color: number;
}

export const FOODS: Record<string, FoodData> = {
    sut: { id: 'sut', name: 'Süt', emoji: '🥛', color: 0xE8F0FE },
    kemik: { id: 'kemik', name: 'Kemik', emoji: '🦴', color: 0xFAF0E6 },
    cimen: { id: 'cimen', name: 'Taze Çimen', emoji: '🌿', color: 0xD8F3DC },
    misir: { id: 'misir', name: 'Mısır', emoji: '🌽', color: 0xFEF08A },
    saman: { id: 'saman', name: 'Saman Balyası', emoji: '🌾', color: 0xFDE68A },
    marul: { id: 'marul', name: 'Taze Marul', emoji: '🥬', color: 0xBBF7D0 },
    elma: { id: 'elma', name: 'Kırmızı Elma', emoji: '🍎', color: 0xFECDD3 },
    havuc: { id: 'havuc', name: 'Çıtır Havuç', emoji: '🥕', color: 0xFED7AA },
    // Distractor foods for semantic choice
    balik: { id: 'balik', name: 'Balık', emoji: '🐟', color: 0xBAE6FD },
    peynir: { id: 'peynir', name: 'Peynir', emoji: '🧀', color: 0xFEF08A },
    ekmek: { id: 'ekmek', name: 'Ekmek', emoji: '🍞', color: 0xFDE68A }
};

export const ANIMALS: AnimalData[] = [
    {
        id: 'kedi',
        name: 'Kedi',
        turkishName: 'Kedi',
        emoji: '🐱',
        soundText: 'Miyav miyav!',
        targetSounds: ['k', 'd'],
        syllables: ['KE', 'Dİ'],
        foodId: 'sut',
        foodName: 'Süt',
        foodEmoji: '🥛',
        bgColor: 0xFFE5D9,
        accentColor: 0xF3A683,
        description: 'Sevimli pofuduk kedi süt içmeyi çok sever.'
    },
    {
        id: 'kopek',
        name: 'Köpek',
        turkishName: 'Köpek',
        emoji: '🐶',
        soundText: 'Hav hav hav!',
        targetSounds: ['k', 'p'],
        syllables: ['KÖ', 'PEK'],
        foodId: 'kemik',
        foodName: 'Kemik',
        foodEmoji: '🦴',
        bgColor: 0xEDE0D4,
        accentColor: 0xD4A373,
        description: 'Neşeli köpek kemiğini arıyor.'
    },
    {
        id: 'kuzu',
        name: 'Kuzu',
        turkishName: 'Kuzu',
        emoji: '🐑',
        soundText: 'Meee meee!',
        targetSounds: ['k', 'z'],
        syllables: ['KU', 'ZU'],
        foodId: 'cimen',
        foodName: 'Taze Çimen',
        foodEmoji: '🌿',
        bgColor: 0xE2ECE9,
        accentColor: 0xB5E2FA,
        description: 'Kıvırcık yünlü kuzu yeşil otları pek sever.'
    },
    {
        id: 'tavuk',
        name: 'Tavuk',
        turkishName: 'Tavuk',
        emoji: '🐔',
        soundText: 'Gıt gıt gıdak!',
        targetSounds: ['t', 'v', 'k'],
        syllables: ['TA', 'VUK'],
        foodId: 'misir',
        foodName: 'Mısır',
        foodEmoji: '🌽',
        bgColor: 0xFFF3CD,
        accentColor: 0xF6BD60,
        description: 'Benekli tavuk sarı mısır tanelerini topluyor.'
    },
    {
        id: 'inek',
        name: 'İnek',
        turkishName: 'İnek',
        emoji: '🐮',
        soundText: 'Mööö mööö!',
        targetSounds: ['n', 'k'],
        syllables: ['İ', 'NEK'],
        foodId: 'saman',
        foodName: 'Saman Balyası',
        foodEmoji: '🌾',
        bgColor: 0xEDF6F9,
        accentColor: 0x83C5BE,
        description: 'Sakin inek kuru samanı afiyetle çiğner.'
    },
    {
        id: 'ordek',
        name: 'Ördek',
        turkishName: 'Ördek',
        emoji: '🦆',
        soundText: 'Vak vak vak!',
        targetSounds: ['r', 'd', 'k'],
        syllables: ['ÖR', 'DEK'],
        foodId: 'marul',
        foodName: 'Taze Marul',
        foodEmoji: '🥬',
        bgColor: 0xCCE3DE,
        accentColor: 0x6B9080,
        description: 'Gölette yüzen ördek çıtır marulu çok sever.'
    },
    {
        id: 'at',
        name: 'At',
        turkishName: 'At',
        emoji: '🐴',
        soundText: 'İhihihi!',
        targetSounds: ['t'],
        syllables: ['AT'],
        foodId: 'elma',
        foodName: 'Kırmızı Elma',
        foodEmoji: '🍎',
        bgColor: 0xFFCAD4,
        accentColor: 0xF4ACB7,
        description: 'Rüzgar yeleli asil at tatlı kırmızı elmaya bayılır.'
    },
    {
        id: 'tavsan',
        name: 'Tavşan',
        turkishName: 'Tavşan',
        emoji: '🐰',
        soundText: 'Kıtık kıtık!',
        targetSounds: ['t', 'v', 's', 'n'],
        syllables: ['TAV', 'ŞAN'],
        foodId: 'havuc',
        foodName: 'Çıtır Havuç',
        foodEmoji: '🥕',
        bgColor: 0xFFE5EC,
        accentColor: 0xFB6F92,
        description: 'Uzun kulaklı minik tavşan turuncu havuç yer.'
    }
];

export const ALL_TARGET_SOUNDS = [
    { sound: 'k', label: '/k/ Sesi' },
    { sound: 't', label: '/t/ Sesi' },
    { sound: 's', label: '/s/ Sesi' },
    { sound: 'r', label: '/r/ Sesi' },
    { sound: 'p', label: '/p/ Sesi' },
    { sound: 'z', label: '/z/ Sesi' },
    { sound: 'v', label: '/v/ Sesi' },
    { sound: 'd', label: '/d/ Sesi' },
    { sound: 'n', label: '/n/ Sesi' }
];

export function getAnimalById(id: string): AnimalData | undefined {
    return ANIMALS.find(a => a.id === id);
}

export function getAnimalsForTargetSound(sound: string): AnimalData[] {
    return ANIMALS.filter(a => a.targetSounds.includes(sound));
}

export function getAnimalTextureKey(scene: { textures: { exists: (key: string) => boolean } }, id: string): string {
    const customKey = `custom_animal_${id}`;
    if (scene.textures.exists(customKey)) {
        return customKey;
    }
    return `animal_${id}`;
}
