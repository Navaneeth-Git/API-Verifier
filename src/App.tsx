import { useState } from 'react'
import { ArrowUpRight, Check, CircleAlert, Eye, EyeOff, KeyRound, LoaderCircle, RotateCcw, ShieldCheck, Sparkles, Terminal } from 'lucide-react'
import './App.css'

type ProviderId = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq'
type Result = { status: 'valid' | 'invalid' | 'error'; message: string; latency?: number }
const providers: { id: ProviderId; name: string; mark: string; tone: string; placeholder: string }[] = [
  { id: 'openai', name: 'OpenAI', mark: 'O', tone: 'mint', placeholder: 'sk-proj-...' }, { id: 'anthropic', name: 'Anthropic', mark: 'A', tone: 'coral', placeholder: 'sk-ant-...' }, { id: 'google', name: 'Google AI', mark: 'G', tone: 'blue', placeholder: 'AIza...' }, { id: 'mistral', name: 'Mistral', mark: 'M', tone: 'orange', placeholder: 'xxxxxxxx...' }, { id: 'groq', name: 'Groq', mark: 'G', tone: 'violet', placeholder: 'gsk_...' },
]

function App() {
  const [provider, setProvider] = useState<ProviderId>('openai')
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const selectedProvider = providers.find((item) => item.id === provider)!

  async function verifyKey() {
    if (!key.trim()) return
    setIsChecking(true); setResult(null)
    const started = performance.now()
    try {
      const response = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, key: key.trim() }) })
      const data = await response.json()
      setResult({ ...data, latency: Math.round(performance.now() - started) })
    } catch { setResult({ status: 'error', message: 'Could not reach the verification service.' }) } finally { setIsChecking(false) }
  }

  return <main className="shell">
    <nav className="topbar"><a className="brand" href="/"><span className="brand-mark"><ShieldCheck size={18} /></span>keycheck</a><div className="nav-meta"><span className="live-dot" /> all systems operational <span className="nav-divider" /> <span className="version">v1.0</span></div></nav>
    <section className="intro"><div className="eyebrow"><Sparkles size={14} /> API CREDENTIAL INSPECTOR</div><h1>Know your key.<br /><em>Before</em> you ship.</h1><p>Verify AI provider credentials in seconds. Your key is sent directly to the provider and never stored.</p></section>
    <section className="workspace">
      <div className="verify-panel"><div className="panel-header"><div><span className="section-kicker">01 / PROVIDER</span><h2>Choose a provider</h2></div><span className="step-count">1 of 2</span></div><div className="provider-grid">{providers.map((item) => <button key={item.id} className={`provider ${provider === item.id ? 'selected' : ''}`} onClick={() => { setProvider(item.id); setResult(null) }} type="button"><span className={`provider-mark ${item.tone}`}>{item.mark}</span><span>{item.name}</span>{provider === item.id && <Check size={16} className="provider-check" />}</button>)}</div><div className="field-heading"><span className="section-kicker">02 / CREDENTIAL</span><span className="secure-label"><KeyRound size={13} /> encrypted in transit</span></div><div className="key-input"><KeyRound size={18} /><input aria-label="API key" type={showKey ? 'text' : 'password'} value={key} onChange={(event) => { setKey(event.target.value); setResult(null) }} onKeyDown={(event) => event.key === 'Enter' && verifyKey()} placeholder={selectedProvider.placeholder} autoComplete="off" /><button className="icon-button" type="button" onClick={() => setShowKey(!showKey)} aria-label={showKey ? 'Hide API key' : 'Show API key'}>{showKey ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><button className="verify-button" type="button" disabled={!key.trim() || isChecking} onClick={verifyKey}>{isChecking ? <><LoaderCircle className="spin" size={18} /> verifying with {selectedProvider.name}...</> : <>Verify credential <ArrowUpRight size={18} /></>}</button><p className="no-store"><ShieldCheck size={14} /> We never log, store, or share your credentials.</p></div>
      <aside className={`result-panel ${result ? `result-${result.status}` : ''}`}><div className="result-topline"><span className="section-kicker">VERIFICATION RESULT</span><Terminal size={16} /></div>{!result && <div className="empty-result"><div className="empty-icon"><KeyRound size={22} /></div><h3>Ready when you are</h3><p>Select a provider and enter a credential to begin your check.</p></div>}{result?.status === 'valid' && <div className="result-content"><div className="result-icon"><Check size={30} /></div><span className="result-label">CREDENTIAL VALID</span><h3>Your {selectedProvider.name} key is active.</h3><p>Authentication succeeded. This key can make requests to the {selectedProvider.name} API.</p><div className="result-meta"><span>RESPONSE TIME</span><strong>{result.latency}ms</strong></div><button className="reset-button" type="button" onClick={() => { setResult(null); setKey('') }}><RotateCcw size={15} /> Check another key</button></div>}{result?.status === 'invalid' && <div className="result-content"><div className="result-icon invalid"><CircleAlert size={30} /></div><span className="result-label">CREDENTIAL INVALID</span><h3>This key did not authenticate.</h3><p>{result.message}</p><button className="reset-button" type="button" onClick={() => setResult(null)}><RotateCcw size={15} /> Try again</button></div>}{result?.status === 'error' && <div className="result-content"><div className="result-icon error"><CircleAlert size={30} /></div><span className="result-label">CHECK FAILED</span><h3>We could not complete the check.</h3><p>{result.message}</p><button className="reset-button" type="button" onClick={verifyKey}><RotateCcw size={15} /> Retry check</button></div>}</aside>
    </section>
    <footer><span>Built for developers who care about the details.</span><span><span className="footer-dot" /> secure by design</span></footer>
  </main>
}
export default App
