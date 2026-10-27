import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

/** Çocuklar için yumuşak kadın sesi (ücretsiz Edge Read Aloud). */
export const DEFAULT_VOICE = 'tr-TR-EmelNeural';

const MAX_CHARS = 120;

export async function synthesizeTurkishMp3(
  rawText: string,
  options: { rate?: number; voice?: string } = {},
): Promise<Buffer> {
  const text = rawText.trim().slice(0, MAX_CHARS);
  if (!text) throw new Error('Metin boş');

  const voice = options.voice || DEFAULT_VOICE;
  const rate = options.rate ?? 0.85;

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate });

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buf = Buffer.concat(chunks);
  if (buf.length < 100) throw new Error('Ses üretilemedi');
  return buf;
}
