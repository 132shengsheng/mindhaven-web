import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'ai-cors-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res) => {
          if (req.method === 'OPTIONS') {
            res.writeHead(200, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            })
            res.end()
            return
          }

          const targetUrl = req.headers['x-target-url'] as string
          if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Missing x-target-url header' }))
            return
          }

          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
            }
            const body = Buffer.concat(chunks)

            const authHeader = req.headers['authorization']
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            }
            if (authHeader) headers['Authorization'] = authHeader

            const fetchRes = await fetch(targetUrl, {
              method: req.method || 'POST',
              headers,
              body: req.method !== 'GET' && body.length > 0 ? body.toString('utf-8') : undefined,
              redirect: 'follow',
            })

            if (!fetchRes.ok) {
              const errBody = await fetchRes.text()
              res.writeHead(fetchRes.status, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              })
              res.end(errBody)
              return
            }

            const contentType = fetchRes.headers.get('content-type') || 'text/event-stream; charset=utf-8'
            res.writeHead(fetchRes.status, {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
              'X-Accel-Buffering': 'no',
            })

            if (fetchRes.body) {
              for await (const chunk of fetchRes.body as any) {
                res.write(chunk)
              }
            }
            res.end()
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
            res.end(JSON.stringify({ error: message, targetUrl }))
          }
        })
      },
    },
  ],
})
