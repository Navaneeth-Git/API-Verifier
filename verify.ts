export type Provider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' | 'cohere' | 'perplexity' | 'xai' | 'deepseek' | 'openrouter' | 'huggingface'

const supportedProviders: Provider[] = ['openai', 'anthropic', 'google', 'mistral', 'groq', 'cohere', 'perplexity', 'xai', 'deepseek', 'openrouter', 'huggingface']

export function isProvider(value: unknown): value is Provider {
  return typeof value === 'string' && supportedProviders.includes(value as Provider)
}

export async function verifyWithProvider(provider: Provider, key: string) {
  const requests: Record<Provider, () => Promise<Response>> = {
    openai: () => fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } }),
    anthropic: () => fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } }),
    google: () => fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`),
    mistral: () => fetch('https://api.mistral.ai/v1/models', { headers: { Authorization: `Bearer ${key}` } }),
    groq: () => fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } }),
    cohere: () => fetch('https://api.cohere.com/v2/models', { headers: { Authorization: `Bearer ${key}` } }),
    perplexity: () => fetch('https://api.perplexity.ai/models', { headers: { Authorization: `Bearer ${key}` } }),
    xai: () => fetch('https://api.x.ai/v1/models', { headers: { Authorization: `Bearer ${key}` } }),
    deepseek: () => fetch('https://api.deepseek.com/models', { headers: { Authorization: `Bearer ${key}` } }),
    openrouter: () => fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${key}` } }),
    huggingface: () => fetch('https://huggingface.co/api/whoami-v2', { headers: { Authorization: `Bearer ${key}` } }),
  }

  const providerResponse = await requests[provider]()
  if (providerResponse.ok) return { status: 'valid', message: 'Authentication succeeded.' }
  if ([400, 401, 403].includes(providerResponse.status)) return { status: 'invalid', message: 'The provider rejected this credential. Check that it is complete and active.' }
  return { status: 'error', message: `The provider returned an unexpected response (${providerResponse.status}).` }
}
