import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_VOICE, synthesizeTurkishMp3 } from './_lib/synthesize';

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
