/** Türkçe seslendirme: önce ücretsiz Edge nöral TTS (/api/tts), yoksa Web Speech. */

let currentAudio: HTMLAudioElement | null = null;
const urlCache = new Map<string, string>();
const CACHE_LIMIT = 80;

function cacheKey(text: string, rate: number): string {
  return `${rate.toFixed(2)}|${text.trim()}`;
}

function rememberUrl(key: string, url: string): void {
  if (urlCache.has(key)) {
    URL.revokeObjectURL(urlCache.get(key)!);
  }
  urlCache.set(key, url);
  while (urlCache.size > CACHE_LIMIT) {
    const oldest = urlCache.keys().next().value;
    if (!oldest) break;
    const oldUrl = urlCache.get(oldest);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    urlCache.delete(oldest);
  }
}

function pickTurkishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const tr = voices.filter((v) => v.lang.toLowerCase().startsWith('tr'));
  if (tr.length === 0) return null;
  const preferred = tr.find(
    (v) =>
      /emel|neural|natural|online|google|premium/i.test(v.name) ||
      /neural|natural/i.test(v.voiceURI),
  );
  return preferred ?? tr[0] ?? null;
}

function speakBrowser(
  text: string,
  options: { volume?: number; rate?: number },
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'tr-TR';
  utter.rate = options.rate ?? 0.85;
  utter.volume = Math.max(0, Math.min(1, options.volume ?? 0.6));
  const voice = pickTurkishVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

async function fetchNeuralUrl(text: string, rate: number): Promise<string> {
  const key = cacheKey(text, rate);
  const hit = urlCache.get(key);
  if (hit) return hit;

  const params = new URLSearchParams({
    text,
    rate: String(rate),
    voice: 'tr-TR-EmelNeural',
  });
  const res = await fetch(`/api/tts?${params.toString()}`);
  if (!res.ok) throw new Error(`TTS ${res.status}`);
  const blob = await res.blob();
  if (!blob.size) throw new Error('Boş ses');
  const url = URL.createObjectURL(blob);
  rememberUrl(key, url);
  return url;
}

function playUrl(url: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    stopSpeaking();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      reject(new Error('Audio play failed'));
    };
    void audio.play().catch(reject);
  });
}

export function speak(
  text: string,
  options: { volume?: number; enabled?: boolean; rate?: number } = {},
): void {
  if (options.enabled === false) return;
  const trimmed = text.trim();
  if (!trimmed) return;

  const volume = options.volume ?? 0.6;
  const rate = options.rate ?? 0.85;

  void (async () => {
    try {
      const url = await fetchNeuralUrl(trimmed, rate);
      await playUrl(url, volume);
    } catch {
      speakBrowser(trimmed, { volume, rate });
    }
  })();
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Sesleri önceden yükle (etkinlik kartları için). */
export function prefetchSpeech(
  texts: string[],
  options: { rate?: number; enabled?: boolean } = {},
): void {
  if (options.enabled === false) return;
  const rate = options.rate ?? 0.85;
  for (const t of texts) {
    const trimmed = t.trim();
    if (!trimmed) continue;
    void fetchNeuralUrl(trimmed, rate).catch(() => {
      /* sessizce yoksay */
    });
  }
}

export type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

type RecognitionCtor = new () => SpeechRecognitionLike;

export function getSpeechRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

/** Türkçe karakter / büyük-küçük harf normalize. */
export function normalizeTr(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFC')
    .replace(/\s+/g, ' ');
}

/** Küçük farkları tolere ederek eşleştirme. */
export function fuzzyMatchWord(heard: string, target: string): boolean {
  const a = normalizeTr(heard);
  const b = normalizeTr(target);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let diffs = 0;
  const max = Math.max(a.length, b.length);
  for (let i = 0, j = 0; i < max && j < max; ) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    diffs++;
    if (diffs > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return diffs <= 1;
}

export function playSoftTone(
  kind: 'click' | 'success' | 'gentle',
  volume = 0.6,
): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const vol = Math.max(0, Math.min(1, volume)) * 0.15;

    if (kind === 'click') {
      osc.frequency.value = 520;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (kind === 'success') {
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else {
      osc.frequency.value = 280;
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    }

    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Ses yoksa sessizce yoksay
  }
}
