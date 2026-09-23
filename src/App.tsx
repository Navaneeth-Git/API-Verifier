import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ArrowUpRight, Check, CircleAlert, Clipboard, Eye, EyeOff, KeyRound, LoaderCircle, Moon, RotateCcw, Search, ShieldCheck, Sparkles, Sun, Terminal } from 'lucide-react'
import './App.css'

type ProviderId = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' | 'cohere' | 'perplexity' | 'xai' | 'deepseek' | 'openrouter' | 'huggingface' | 'meta' | 'qwen' | 'zhipu' | 'moonshot' | 'baichuan' | 'minimax' | 'siliconflow' | 'together' | 'fireworks' | 'cerebras' | 'sambanova' | 'nvidia' | 'sarvam'
type Result = { status: 'valid' | 'invalid' | 'error'; message: string; latency?: number }
const providers: { id: ProviderId; name: string; mark: string; tone: string; placeholder: string; githubQuery: string }[] = [
  { id: 'openai', name: 'OpenAI', mark: 'O', tone: 'mint', placeholder: 'sk-proj-...', githubQuery: '"sk-proj-"' }, { id: 'anthropic', name: 'Anthropic', mark: 'A', tone: 'coral', placeholder: 'sk-ant-...', githubQuery: '"sk-ant-"' }, { id: 'google', name: 'Google AI', mark: 'G', tone: 'blue', placeholder: 'AIza...', githubQuery: '"AIza"' }, { id: 'mistral', name: 'Mistral', mark: 'M', tone: 'orange', placeholder: 'xxxxxxxx...', githubQuery: 'MISTRAL_API_KEY' }, { id: 'groq', name: 'Groq', mark: 'G', tone: 'violet', placeholder: 'gsk_...', githubQuery: '"gsk_"' }, { id: 'cohere', name: 'Cohere', mark: 'C', tone: 'teal', placeholder: 'your-cohere-key...', githubQuery: 'COHERE_API_KEY' }, { id: 'perplexity', name: 'Perplexity', mark: 'P', tone: 'navy', placeholder: 'pplx-...', githubQuery: '"pplx-"' }, { id: 'xai', name: 'xAI', mark: 'x', tone: 'black', placeholder: 'xai-...', githubQuery: '"xai-"' }, { id: 'deepseek', name: 'DeepSeek', mark: 'D', tone: 'cyan', placeholder: 'sk-...', githubQuery: 'DEEPSEEK_API_KEY' }, { id: 'openrouter', name: 'OpenRouter', mark: 'R', tone: 'rose', placeholder: 'sk-or-v1-...', githubQuery: '"sk-or-v1-"' }, { id: 'huggingface', name: 'Hugging Face', mark: 'H', tone: 'gold', placeholder: 'hf_...', githubQuery: '"hf_"' },
  { id: 'meta', name: 'Meta AI', mark: 'M', tone: 'blue', placeholder: 'EAAB...', githubQuery: 'META_ACCESS_TOKEN' }, { id: 'qwen', name: 'Qwen', mark: 'Q', tone: 'orange', placeholder: 'sk-...', githubQuery: 'DASHSCOPE_API_KEY' }, { id: 'zhipu', name: 'Zhipu AI', mark: 'Z', tone: 'violet', placeholder: 'id.secret', githubQuery: 'ZHIPUAI_API_KEY' }, { id: 'moonshot', name: 'Moonshot AI', mark: 'K', tone: 'navy', placeholder: 'sk-...', githubQuery: 'MOONSHOT_API_KEY' }, { id: 'baichuan', name: 'Baichuan', mark: 'B', tone: 'coral', placeholder: 'sk-...', githubQuery: 'BAICHUAN_API_KEY' }, { id: 'minimax', name: 'MiniMax', mark: 'M', tone: 'rose', placeholder: 'eyJ...', githubQuery: 'MINIMAX_API_KEY' }, { id: 'siliconflow', name: 'SiliconFlow', mark: 'S', tone: 'cyan', placeholder: 'sk-', githubQuery: 'SILICONFLOW_API_KEY' }, { id: 'together', name: 'Together AI', mark: 'T', tone: 'teal', placeholder: 'tgp_', githubQuery: 'TOGETHER_API_KEY' }, { id: 'fireworks', name: 'Fireworks AI', mark: 'F', tone: 'orange', placeholder: 'fw_', githubQuery: 'FIREWORKS_API_KEY' }, { id: 'cerebras', name: 'Cerebras', mark: 'C', tone: 'gold', placeholder: 'csk-', githubQuery: 'CEREBRAS_API_KEY' }, { id: 'sambanova', name: 'SambaNova', mark: 'S', tone: 'black', placeholder: 'sambanova-', githubQuery: 'SAMBANOVA_API_KEY' }, { id: 'nvidia', name: 'NVIDIA NIM', mark: 'N', tone: 'green', placeholder: 'nvapi-', githubQuery: 'NVIDIA_API_KEY' }, { id: 'sarvam', name: 'Sarvam AI', mark: 'S', tone: 'mint', placeholder: 'sk-', githubQuery: 'SARVAM_API_KEY' },
]

const detectProvider = (value: string): ProviderId | null => {
  const key = value.trim()
  if (key.startsWith('sk-ant-')) return 'anthropic'
  if (key.startsWith('AIza')) return 'google'
  if (key.startsWith('gsk_')) return 'groq'
  if (key.startsWith('pplx-')) return 'perplexity'
  if (key.startsWith('xai-')) return 'xai'
  if (key.startsWith('sk-or-v1-')) return 'openrouter'
  if (key.startsWith('hf_')) return 'huggingface'
  if (key.startsWith('nvapi-')) return 'nvidia'
  if (key.startsWith('tgp_')) return 'together'
  if (key.startsWith('sk-')) return 'openai'
  return null
}

function App() {
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const darkModeRef = useRef(darkMode)
  const revealTimerRef = useRef<number | undefined>(undefined)
  const [provider, setProvider] = useState<ProviderId>('openai')
  const [githubProvider, setGithubProvider] = useState<ProviderId>('openai')
  const [providerMode, setProviderMode] = useState<'auto' | 'manual'>('auto')
  const [providerSearch, setProviderSearch] = useState('')
  const [pasteMessage, setPasteMessage] = useState('')
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [logs, setLogs] = useState<string[]>(['keycheck console ready', 'waiting for a credential...'])
  const selectedProvider = providers.find((item) => item.id === provider)!
  const selectedGithubProvider = providers.find((item) => item.id === githubProvider)!
  const githubSearchUrl = `https://github.com/search?q=${encodeURIComponent(selectedGithubProvider.githubQuery)}&type=code`
  const detectedProvider = detectProvider(key)
  const visibleProviders = providers.filter((item) => item.name.toLowerCase().includes(providerSearch.toLowerCase()))

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', darkMode)
    document.body.classList.toggle('theme-dark', darkMode)
  }, [darkMode])

  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    const currentMode = darkModeRef.current
    const nextMode = !currentMode
    darkModeRef.current = nextMode
    const bounds = event.currentTarget.getBoundingClientRect()
    document.documentElement.style.setProperty('--theme-x', `${bounds.left + bounds.width / 2}px`)
    document.documentElement.style.setProperty('--theme-y', `${bounds.top + bounds.height / 2}px`)
    document.documentElement.style.setProperty('--reveal-base', currentMode ? '#101713' : '#f7faf7')
    document.documentElement.style.setProperty('--reveal-color', nextMode ? '#101713' : '#f7faf7')
    document.documentElement.classList.remove('theme-reveal-active')
    void document.documentElement.offsetWidth
    document.documentElement.classList.add('theme-reveal-active')
    window.clearTimeout(revealTimerRef.current)
    revealTimerRef.current = window.setTimeout(() => document.documentElement.classList.remove('theme-reveal-active'), 900)
    setDarkMode(nextMode)
  }

  async function pasteKey() {
    try {
      const pastedKey = await navigator.clipboard.readText()
      setKey(pastedKey)
      setProviderMode('auto')
      setProvider(detectProvider(pastedKey) ?? 'openai')
      setPasteMessage('Pasted')
      window.setTimeout(() => setPasteMessage(''), 1500)
    } catch {
      setPasteMessage('Paste unavailable')
      window.setTimeout(() => setPasteMessage(''), 1800)
    }
  }

  async function verifyKey() {
    if (!key.trim()) return
    const maskedKey = `${key.trim().slice(0, 5)}${'*'.repeat(Math.max(4, key.trim().length - 5))}`
    setIsChecking(true); setResult(null)
    setLogs([`$ keycheck verify --provider ${provider}`, `  credential: ${maskedKey}`, `  → contacting ${selectedProvider.name} API...`])
    const started = performance.now()
    try {
      const response = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, key: key.trim() }) })
      const data = await response.json()
      setResult({ ...data, latency: Math.round(performance.now() - started) })
      setLogs((current) => [...current, `  ← response: HTTP ${response.status}`, `  ${data.status === 'valid' ? '✓' : data.status === 'invalid' ? '×' : '!'} ${data.message}`])
    } catch { setResult({ status: 'error', message: 'Could not reach the verification service.' }); setLogs((current) => [...current, '  ! verification service unreachable']) } finally { setIsChecking(false) }
  }

  return <main className={`shell ${darkMode ? 'dark-mode' : ''}`}>
    <nav className="topbar"><a className="brand" href="/"><span className="brand-mark"><ShieldCheck size={18} /></span>keycheck</a><div className="nav-actions"><a className="developer-tag" href="https://github.com/Navaneeth-Git" target="_blank" rel="noreferrer">DEVELOPER <ArrowUpRight size={13} /></a><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}<span>{darkMode ? 'light' : 'dark'}</span></button><div className="nav-meta"><span className="live-dot" /> all systems operational <span className="nav-divider" /> <span className="version">v1.0</span></div></div></nav>
    <section className="intro"><div className="eyebrow"><Sparkles size={14} /> API CREDENTIAL INSPECTOR</div><h1>Know your key.<br /><em>Before</em> you ship.</h1><p>Verify AI provider credentials in seconds. Your key is sent directly to the provider and never stored.</p></section>
    <section className="workspace">
      <div className="verify-panel"><div className="panel-header"><div><span className="section-kicker">01 / CREDENTIAL</span><h2>Enter your API key</h2></div><span className="step-count">1 of 2</span></div><div className="key-input"><KeyRound size={18} /><input aria-label="API key" type={showKey ? 'text' : 'password'} value={key} onChange={(event) => { const nextKey = event.target.value; setKey(nextKey); setResult(null); if (providerMode === 'auto') setProvider(detectProvider(nextKey) ?? 'openai') }} onKeyDown={(event) => event.key === 'Enter' && verifyKey()} placeholder="Paste or type your API key..." autoComplete="off" /><button className="paste-button" type="button" onClick={pasteKey}><Clipboard size={15} /> {pasteMessage || 'Paste'}</button><button className="icon-button" type="button" onClick={() => setShowKey(!showKey)} aria-label={showKey ? 'Hide API key' : 'Show API key'}>{showKey ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><div className="detected-provider"><span className={detectedProvider ? 'detection-dot' : 'detection-dot muted'} /> {providerMode === 'auto' && detectedProvider ? <>Automatically selected <strong>{selectedProvider.name}</strong></> : providerMode === 'manual' ? <>Using <strong>{selectedProvider.name}</strong> (manual override)</> : 'Type a key to identify its provider'} {providerMode === 'manual' && <button type="button" onClick={() => { setProviderMode('auto'); setProvider(detectedProvider ?? 'openai') }}>Use auto-detection</button>}</div><div className="field-heading provider-heading"><span className="section-kicker">02 / PROVIDER</span><span className="secure-label"><ShieldCheck size={13} /> {providerMode === 'auto' ? 'auto-selected' : 'manual override'}</span></div><div className="provider-search"><Search size={16} /><input aria-label="Search providers" value={providerSearch} onChange={(event) => setProviderSearch(event.target.value)} placeholder="Search providers..." /></div><div className="provider-grid">{visibleProviders.map((item) => <button key={item.id} className={`provider ${provider === item.id ? 'selected' : ''}`} onClick={() => { setProvider(item.id); setProviderMode('manual'); setResult(null) }} type="button"><span className={`provider-mark ${item.tone}`}>{item.mark}</span><span>{item.name}</span>{provider === item.id && <Check size={16} className="provider-check" />}</button>)}</div><button className="verify-button" type="button" disabled={!key.trim() || isChecking} onClick={verifyKey}>{isChecking ? <><LoaderCircle className="spin" size={18} /> verifying with {selectedProvider.name}...</> : <>Verify credential <ArrowUpRight size={18} /></>}</button><p className="no-store"><ShieldCheck size={14} /> We never log, store, or share your credentials.</p></div>
      <aside className={`result-panel ${result ? `result-${result.status}` : ''}`}><div className="result-topline"><span className="section-kicker">VERIFICATION RESULT</span><Terminal size={16} /></div>{!result && <div className="empty-result"><div className="empty-icon"><KeyRound size={22} /></div><h3>Ready when you are</h3><p>Select a provider and enter a credential to begin your check.</p></div>}{result?.status === 'valid' && <div className="result-content"><div className="result-icon"><Check size={30} /></div><span className="result-label">CREDENTIAL VALID</span><h3>Your {selectedProvider.name} key is active.</h3><p>Authentication succeeded. This key can make requests to the {selectedProvider.name} API.</p><div className="result-meta"><span>RESPONSE TIME</span><strong>{result.latency}ms</strong></div><button className="reset-button" type="button" onClick={() => { setResult(null); setKey('') }}><RotateCcw size={15} /> Check another key</button></div>}{result?.status === 'invalid' && <div className="result-content"><div className="result-icon invalid"><CircleAlert size={30} /></div><span className="result-label">CREDENTIAL INVALID</span><h3>This key did not authenticate.</h3><p>{result.message}</p><button className="reset-button" type="button" onClick={() => setResult(null)}><RotateCcw size={15} /> Try again</button></div>}{result?.status === 'error' && <div className="result-content"><div className="result-icon error"><CircleAlert size={30} /></div><span className="result-label">CHECK FAILED</span><h3>We could not complete the check.</h3><p>{result.message}</p><button className="reset-button" type="button" onClick={verifyKey}><RotateCcw size={15} /> Retry check</button></div>}</aside>
    </section>
    <section className="console-panel"><div className="console-header"><div><span className="section-kicker">LIVE VERIFICATION TRACE</span><h2>What happens under the hood</h2></div><span className="console-status"><span className={isChecking ? 'console-pulse' : 'console-dot'} /> {isChecking ? 'running' : 'idle'}</span></div><div className="terminal-window"><div className="terminal-bar"><span className="terminal-lights"><i /><i /><i /></span><span>keycheck / session.log</span><span>UTF-8</span></div><div className="terminal-output" aria-live="polite">{logs.map((line, index) => <div key={`${line}-${index}`} className={line.includes('✓') ? 'log-success' : line.includes('×') || line.includes('!') ? 'log-error' : ''}><span className="line-number">{String(index + 1).padStart(2, '0')}</span><span>{line}</span>{isChecking && index === logs.length - 1 && <span className="cursor" />}</div>)}</div></div></section>
    <section className="github-audit"><div className="github-copy"><span className="section-kicker">PUBLIC CODE AUDIT</span><h2>Look for exposed credentials</h2><p>Open a GitHub code search for a provider's key signature. Results stay on GitHub, and this site never collects repository contents.</p></div><div className="github-controls"><label htmlFor="github-provider">Provider</label><select id="github-provider" value={githubProvider} onChange={(event) => setGithubProvider(event.target.value as ProviderId)}>{providers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><a className="github-button" href={githubSearchUrl} target="_blank" rel="noreferrer">Search on GitHub <ArrowUpRight size={15} /></a><span className="github-query">searching for <strong>{selectedGithubProvider.githubQuery}</strong></span></div></section>
    <footer><span>Built for developers who care about the details.</span></footer>
  </main>
}
export default App
