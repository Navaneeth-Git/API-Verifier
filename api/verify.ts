import { isProvider, verifyWithProvider } from '../verify.js'

type VercelRequest = { method?: string; body?: { provider?: unknown; key?: unknown } }
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void; setHeader: (name: string, value: string) => void }

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    return response.status(405).json({ status: 'error', message: 'Only POST requests are supported.' })
  }

  const provider = request.body?.provider
  const key = typeof request.body?.key === 'string' ? request.body.key.trim() : ''
  if (!isProvider(provider) || !key) {
    return response.status(400).json({ status: 'error', message: 'A supported provider and credential are required.' })
  }

  try {
    return response.status(200).json(await verifyWithProvider(provider, key))
  } catch {
    return response.status(200).json({ status: 'error', message: 'The provider could not be reached. Try again in a moment.' })
  }
}
