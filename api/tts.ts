import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const DEFAULT_VOICE = 'tr-TR-EmelNeural';
const MAX_CHARS = 120;

async function synthesizeTurkishMp3(
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Yalnızca GET' });
  }

  const text = String(req.query.text ?? '');
  const rateRaw = Number(req.query.rate ?? 0.85);
  const rate = Number.isFinite(rateRaw) ? Math.min(1.2, Math.max(0.6, rateRaw)) : 0.85;
  const voice = String(req.query.voice ?? DEFAULT_VOICE);

  try {
    const buf = await synthesizeTurkishMp3(text, { rate, voice });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buf);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS hatası';
    return res.status(500).json({ error: message });
  }
}
