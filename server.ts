import cors from 'cors'
import 'dotenv/config'
import express from 'express'
const app = express(); app.use(cors()); app.use(express.json({ limit: '10kb' }))
type Provider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq'
async function verifyWithProvider(provider: Provider, key: string) {
  const requests: Record<Provider, () => Promise<Response>> = { openai: () => fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } }), anthropic: () => fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } }), google: () => fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`), mistral: () => fetch('https://api.mistral.ai/v1/models', { headers: { Authorization: `Bearer ${key}` } }), groq: () => fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } }) }
  const response = await requests[provider](); if (response.ok) return { status: 'valid', message: 'Authentication succeeded.' }; if (response.status === 400 || response.status === 401 || response.status === 403) return { status: 'invalid', message: 'The provider rejected this credential. Check that it is complete and active.' }; return { status: 'error', message: `The provider returned an unexpected response (${response.status}).` }
}
app.post('/api/verify', async (request, response) => { const { provider, key } = request.body as { provider?: Provider; key?: string }; if (!provider || !key?.trim()) return response.status(400).json({ status: 'error', message: 'A provider and credential are required.' }); if (!['openai', 'anthropic', 'google', 'mistral', 'groq'].includes(provider)) return response.status(400).json({ status: 'error', message: 'That provider is not supported.' }); try { return response.json(await verifyWithProvider(provider, key.trim())) } catch { return response.json({ status: 'error', message: 'The provider could not be reached. Try again in a moment.' }) } })
app.listen(8787, () => console.log('Keycheck API listening on http://localhost:8787'))
