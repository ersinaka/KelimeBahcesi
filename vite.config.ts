import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

/** Yerel geliştirmede /api/tts — production'da Vercel serverless. */
function ttsDevApi(): Plugin {
  return {
    name: 'kelime-bahcesi-tts-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/tts')) return next()
        try {
          const url = new URL(req.url, 'http://localhost')
          const text = url.searchParams.get('text') ?? ''
          const rate = Number(url.searchParams.get('rate') ?? 0.85)
          const voice = url.searchParams.get('voice') ?? 'tr-TR-EmelNeural'
          const { synthesizeTurkishMp3 } = await import('./api/_lib/synthesize.ts')
          const buf = await synthesizeTurkishMp3(text, {
            rate: Number.isFinite(rate) ? rate : 0.85,
            voice,
          })
          res.statusCode = 200
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'no-store')
          res.end(buf)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'TTS hatası',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), ttsDevApi()],
})
