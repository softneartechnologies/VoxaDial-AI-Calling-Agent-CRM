// API client. Every screen talks to the backend ONLY through this file.
// Set VITE_USE_MOCK=false and VITE_API_URL=http://localhost:4000/api to hit the real backend.
import type { AIAgent, Activity, Call, Campaign, Contact, DashboardStats, Integration, LiveCall, PhoneNumber } from './types'
import * as mock from './mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorageSafe('token')
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}
function localStorageSafe(k: string) { try { return localStorage.getItem(k) } catch { return null } }

const delay = <T,>(v: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), ms))
const db = { contacts: [...mock.contacts], agents: [...mock.agents], campaigns: [...mock.campaigns], calls: mock.calls, numbers: mock.numbers, activities: [...mock.activities], integrations: [...mock.integrations] }
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`

export const api = {
  // ---- Auth ----
  login: (email: string, password: string) => USE_MOCK ? delay({ token: 'demo', user: { name: 'Demo User', email } }) : http<{ token: string; user: { name: string; email: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // ---- Dashboard ----
  stats: (): Promise<DashboardStats> => USE_MOCK ? delay(buildStats()) : http('/dashboard/stats'),
  liveCalls: (): Promise<LiveCall[]> => USE_MOCK ? delay(buildLive(), 100) : http('/calls/live'),

  // ---- Contacts / CRM ----
  contacts: (): Promise<Contact[]> => USE_MOCK ? delay(db.contacts) : http('/contacts'),
  contact: (id: string): Promise<Contact | undefined> => USE_MOCK ? delay(db.contacts.find((c) => c.id === id)) : http(`/contacts/${id}`),
  createContact: (c: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> => {
    if (!USE_MOCK) return http('/contacts', { method: 'POST', body: JSON.stringify(c) })
    const n = { ...c, id: uid('c'), createdAt: new Date().toISOString() }; db.contacts.unshift(n); return delay(n)
  },
  updateContact: (id: string, patch: Partial<Contact>): Promise<Contact> => {
    if (!USE_MOCK) return http(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    const i = db.contacts.findIndex((c) => c.id === id); db.contacts[i] = { ...db.contacts[i], ...patch }; return delay(db.contacts[i], 80)
  },
  importContacts: (rows: Omit<Contact, 'id' | 'createdAt'>[]): Promise<{ imported: number }> => {
    if (!USE_MOCK) return http('/contacts/import', { method: 'POST', body: JSON.stringify({ rows }) })
    rows.forEach((r) => db.contacts.unshift({ ...r, id: uid('c'), createdAt: new Date().toISOString() })); return delay({ imported: rows.length })
  },
  activities: (contactId: string): Promise<Activity[]> => USE_MOCK ? delay(db.activities.filter((a) => a.contactId === contactId)) : http(`/contacts/${contactId}/activities`),
  addNote: (contactId: string, text: string): Promise<Activity> => {
    if (!USE_MOCK) return http(`/contacts/${contactId}/activities`, { method: 'POST', body: JSON.stringify({ type: 'note', text }) })
    const a: Activity = { id: uid('act'), contactId, type: 'note', text, at: new Date().toISOString(), by: 'You' }; db.activities.unshift(a); return delay(a, 80)
  },

  // ---- AI Agents ----
  agents: (): Promise<AIAgent[]> => USE_MOCK ? delay(db.agents) : http('/agents'),
  agent: (id: string): Promise<AIAgent | undefined> => USE_MOCK ? delay(db.agents.find((a) => a.id === id)) : http(`/agents/${id}`),
  saveAgent: (a: AIAgent): Promise<AIAgent> => {
    if (!USE_MOCK) return http(a.id ? `/agents/${a.id}` : '/agents', { method: a.id ? 'PUT' : 'POST', body: JSON.stringify(a) })
    const n = { ...a, id: a.id || uid('a'), updatedAt: new Date().toISOString() }
    const i = db.agents.findIndex((x) => x.id === n.id); if (i >= 0) db.agents[i] = n; else db.agents.unshift(n); return delay(n)
  },

  // ---- Campaigns ----
  campaigns: (): Promise<Campaign[]> => USE_MOCK ? delay(db.campaigns) : http('/campaigns'),
  createCampaign: (c: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign> => {
    if (!USE_MOCK) return http('/campaigns', { method: 'POST', body: JSON.stringify(c) })
    const n = { ...c, id: uid('cp'), createdAt: new Date().toISOString() }; db.campaigns.unshift(n); return delay(n)
  },
  setCampaignStatus: (id: string, status: Campaign['status']): Promise<Campaign> => {
    if (!USE_MOCK) return http(`/campaigns/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
    const c = db.campaigns.find((x) => x.id === id)!; c.status = status; return delay(c, 80)
  },

  // ---- Calls ----
  calls: (): Promise<Call[]> => USE_MOCK ? delay(db.calls) : http('/calls'),
  callsForContact: (contactId: string): Promise<Call[]> => USE_MOCK ? delay(db.calls.filter((c) => c.contactId === contactId)) : http(`/calls?contactId=${contactId}`),
  startCall: (to: string, agentId?: string): Promise<{ callId: string }> => USE_MOCK ? delay({ callId: uid('call') }) : http('/calls/dial', { method: 'POST', body: JSON.stringify({ to, agentId }) }),

  // ---- Numbers & Integrations ----
  numbers: (): Promise<PhoneNumber[]> => USE_MOCK ? delay(db.numbers) : http('/numbers'),
  integrations: (): Promise<Integration[]> => USE_MOCK ? delay(db.integrations) : http('/integrations'),
  toggleIntegration: (id: string): Promise<Integration> => {
    if (!USE_MOCK) return http(`/integrations/${id}/toggle`, { method: 'POST' })
    const x = db.integrations.find((i) => i.id === id)!; x.connected = !x.connected; return delay(x, 300)
  },
}

function buildStats(): DashboardStats {
  const hours = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p']
  const hourly = hours.map((hour, i) => { const calls = Math.round(180 + Math.sin(i / 2) * 90 + i * 12); const connected = Math.round(calls * 0.31); return { hour, calls, connected, qualified: Math.round(connected * 0.19) } })
  return {
    callsToday: hourly.reduce((s, h) => s + h.calls, 0), connectRate: 31.2, qualifiedLeads: hourly.reduce((s, h) => s + h.qualified, 0), appointments: 74, avgHandleSec: 148, costPerLead: 6.4, activeCalls: 37,
    pipelineValue: db.contacts.filter((c) => !['lost'].includes(c.status)).reduce((s, c) => s + c.value, 0),
    hourly,
    outcomes: [{ name: 'Voicemail', value: 38 }, { name: 'No answer', value: 22 }, { name: 'Not interested', value: 17 }, { name: 'Qualified', value: 11 }, { name: 'Appointment', value: 7 }, { name: 'Callback', value: 5 }],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({ day, calls: [2900, 3120, 3340, 3010, 2780, 1450, 0][i], qualified: [96, 110, 121, 104, 92, 41, 0][i], appointments: [41, 47, 52, 44, 39, 18, 0][i] })),
  }
}
function buildLive(): LiveCall[] {
  const stages = ['Greeting', 'Qualifying', 'Handling objection', 'Booking', 'Transferring']
  return db.contacts.slice(0, 7).map((c, i) => ({ id: `live_${i}`, contactName: c.name, phone: c.phone, agentName: db.agents[i % 3].name, campaignName: db.campaigns[i % 2].name, startedSecAgo: 12 + i * 37, stage: stages[i % stages.length], sentiment: (['positive', 'neutral', 'positive', 'negative'] as const)[i % 4] }))
}
