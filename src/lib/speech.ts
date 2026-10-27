/** Web Speech API sarmalayıcı — tr-TR, rate 0.85 */

export function speak(
  text: string,
  options: { volume?: number; enabled?: boolean; rate?: number } = {},
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (options.enabled === false) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'tr-TR';
  utter.rate = options.rate ?? 0.85;
  utter.volume = Math.max(0, Math.min(1, options.volume ?? 0.6));
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
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
  // tek karakter farkına izin (Levenshtein ≤ 1, kısa kelimelerde ≤ 0)
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
