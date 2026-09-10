import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dns from 'node:dns'
import { fetch as undiciFetch, ProxyAgent } from 'undici'

// 强制 IPv4 优先，防止 Windows 上 Node fetch 尝试 IPv6 导致超时
dns.setDefaultResultOrder('ipv4first')

// 自动检测系统代理或本地运行中的代理（如 Clash 7890 端口）
const localProxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890'
let proxyAgent: ProxyAgent | undefined
try {
  proxyAgent = new ProxyAgent(localProxyUrl)
} catch {
  // 无代理可用
}

async function smartFetch(url: string, options: Parameters<typeof undiciFetch>[1]) {
  // 国内服务商（如 deepseek.com, siliconflow, moonshot 等）直接直连，获得极致 <200ms 低延迟
  const isDomestic = /deepseek\.com|siliconflow|moonshot|\.cn\b/i.test(url)

  if (proxyAgent && !isDomestic) {
    try {
      return await undiciFetch(url, { ...options, dispatcher: proxyAgent })
    } catch {
      // 代理尝试失败则退回直连
    }
  }
  return await undiciFetch(url, options)
}

// https://vite.dev/config/
export default defineConfig({
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

            const fetchRes = await smartFetch(targetUrl, {
              method: (req.method as any) || 'POST',
              headers,
              body: req.method !== 'GET' && body.length > 0 ? body.toString('utf-8') : undefined,
              redirect: 'follow',
            })

            if (!fetchRes.ok) {
              const errBody = await fetchRes.text()
              console.error(`Target API [${fetchRes.status}] error:`, errBody)
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
            res.flushHeaders?.()

            if (fetchRes.body) {
              for await (const chunk of fetchRes.body) {
                res.write(chunk)
                if (typeof (res as any).flush === 'function') {
                  ;(res as any).flush()
                }
              }
            }
            res.end()
          } catch (err: unknown) {
            const cause = (err as { cause?: unknown })?.cause
            const message = err instanceof Error ? `${err.message}${cause ? ` (${cause})` : ''}` : String(err)
            console.error(`Proxy forward failed to [${targetUrl}]:`, message)
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
            res.end(JSON.stringify({ error: message, targetUrl }))
          }
        })
      },
    },
  ],
})
