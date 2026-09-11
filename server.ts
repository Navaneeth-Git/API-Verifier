import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { isProvider, verifyWithProvider } from './verify.js'
const app = express(); app.use(cors()); app.use(express.json({ limit: '10kb' }))
app.post('/api/verify', async (request, response) => { const { provider, key } = request.body as { provider?: unknown; key?: string }; if (!isProvider(provider) || !key?.trim()) return response.status(400).json({ status: 'error', message: 'A supported provider and credential are required.' }); try { return response.json(await verifyWithProvider(provider, key.trim())) } catch { return response.json({ status: 'error', message: 'The provider could not be reached. Try again in a moment.' }) } })
app.listen(8787, () => console.log('Keycheck API listening on http://localhost:8787'))
