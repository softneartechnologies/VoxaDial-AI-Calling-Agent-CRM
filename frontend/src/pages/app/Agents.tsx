import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, Mic, Play, Plus, Save, Send, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { api } from '../../api/client'
import type { AIAgent } from '../../api/types'
import { Badge, Field, PageHeader, Spinner, Tabs, Toggle, fmtAgo, fmtNum, statusTone, useAsync } from '../../components/ui'

export function AgentsList() {
  const { data } = useAsync(api.agents)
  return (
    <>
      <PageHeader title="AI Agents" subtitle="Voice agents that call, qualify, book and transfer." actions={<Link to="/app/agents/new" className="btn-primary"><Plus size={16} /> New agent</Link>} />
      {!data ? <Spinner /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((a) => (
            <Link to={`/app/agents/${a.id}`} key={a.id} className="card group p-5 transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white"><Bot size={22} /></span><div><div className="font-semibold text-slate-900">{a.name}</div><div className="text-xs text-slate-500">{a.role}</div></div></div>
                <Badge tone={statusTone[a.status]}>{a.status}</Badge>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-slate-600">“{a.greeting}”</p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                <div><div className="text-base font-semibold text-slate-900">{fmtNum(a.callsToday)}</div>Calls today</div>
                <div><div className="text-base font-semibold text-slate-900">{a.successRate}%</div>Success</div>
                <div><div className="text-base font-semibold text-slate-900">{a.language.split(' ')[0]}</div>Language</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">{a.voice} · updated {fmtAgo(a.updatedAt)}</div>
            </Link>
          ))}
          <Link to="/app/agents/new" className="grid min-h-[220px] place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600"><span className="flex flex-col items-center gap-2"><Plus />Create from template</span></Link>
        </div>
      )}
    </>
  )
}

const blank: AIAgent = { id: '', name: 'New Agent', role: 'Outbound qualifier', status: 'draft', voice: 'Ava — Warm US Female', language: 'English (US)', model: 'GPT-class LLM (configurable)', greeting: 'Hi {{first_name}}, this is … calling from …', prompt: '', goals: [], transferRules: '', bookAppointments: false, maxCallMinutes: 6, callsToday: 0, successRate: 0, updatedAt: new Date().toISOString() }
const voices = ['Ava — Warm US Female', 'Leo — Calm US Male', 'Maya — Bright Female', 'Kai — Friendly Male', 'Priya — Indian English Female', 'Arjun — Indian English Male', 'Sofía — Spanish Female']
const templates = [
  { name: 'Lead qualifier', prompt: 'Qualify the lead using BANT (budget, authority, need, timeline). If qualified, offer a transfer to a specialist.' },
  { name: 'Appointment setter', prompt: 'Your only goal is to book a 30-minute meeting. Offer two time slots, confirm the email, and send a calendar invite.' },
  { name: 'Inbound receptionist', prompt: 'Greet callers, answer FAQs from the knowledge base, take messages and route urgent calls to the front desk.' },
  { name: 'Survey / feedback', prompt: 'Ask the 3 survey questions in order, record answers exactly, and thank the customer.' },
]

export function AgentEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const [a, setA] = useState<AIAgent | null>(id === 'new' ? blank : null)
  const [tab, setTab] = useState<'behavior' | 'voice' | 'actions' | 'knowledge'>('behavior')
  const [saving, setSaving] = useState(false)
  const [goal, setGoal] = useState('')
  useEffect(() => { if (id && id !== 'new') api.agent(id).then((x) => setA(x ?? blank)) }, [id])
  if (!a) return <Spinner />
  const set = <K extends keyof AIAgent>(k: K, v: AIAgent[K]) => setA({ ...a, [k]: v })
  const save = async () => { setSaving(true); const s = await api.saveAgent(a); setSaving(false); nav(`/app/agents/${s.id}`, { replace: true }); setA(s) }

  return (
    <>
      <Link to="/app/agents" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> All agents</Link>
      <PageHeader title={a.name || 'Untitled agent'} subtitle={a.role} actions={<>
        <label className="flex items-center gap-2 text-sm text-slate-600">Active <Toggle on={a.status === 'active'} onChange={(v) => set('status', v ? 'active' : 'paused')} /></label>
        <button className="btn-primary" onClick={save} disabled={saving}><Save size={16} />{saving ? 'Saving…' : 'Save agent'}</button>
      </>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="card p-6">
          <Tabs value={tab} onChange={setTab} tabs={[{ id: 'behavior', label: 'Behavior' }, { id: 'voice', label: 'Voice & Model' }, { id: 'actions', label: 'Actions & Transfer' }, { id: 'knowledge', label: 'Knowledge' }]} />
          {tab === 'behavior' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Agent name"><input className="input" value={a.name} onChange={(e) => set('name', e.target.value)} /></Field><Field label="Role"><input className="input" value={a.role} onChange={(e) => set('role', e.target.value)} /></Field></div>
              <Field label="Opening line"><input className="input" value={a.greeting} onChange={(e) => set('greeting', e.target.value)} /><span className="mt-1 block text-xs text-slate-400">Variables: {'{{first_name}} {{company}} {{street}}'}</span></Field>
              <Field label="Instructions (system prompt)"><textarea className="input font-mono text-[13px]" rows={9} value={a.prompt} onChange={(e) => set('prompt', e.target.value)} placeholder="Describe who the agent is, what to ask, how to handle objections, when to transfer…" /></Field>
              <div><span className="label">Start from a template</span><div className="flex flex-wrap gap-2">{templates.map((t) => <button key={t.name} className="btn-outline py-1.5 text-xs" onClick={() => set('prompt', t.prompt)}>{t.name}</button>)}</div></div>
              <div>
                <span className="label">Qualification goals</span>
                <div className="flex flex-wrap gap-2">{a.goals.map((g, i) => <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{g}<button onClick={() => set('goals', a.goals.filter((_, j) => j !== i))}><Trash2 size={12} /></button></span>)}</div>
                <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (goal) { set('goals', [...a.goals, goal]); setGoal('') } }}><input className="input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Monthly bill above $120" /><button className="btn-outline">Add</button></form>
              </div>
            </div>
          )}
          {tab === 'voice' && (
            <div className="space-y-5">
              <div><span className="label">Voice</span><div className="grid gap-2 sm:grid-cols-2">{voices.map((v) => <button key={v} onClick={() => set('voice', v)} className={clsx('flex items-center justify-between rounded-lg border p-3 text-left text-sm', a.voice === v ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 hover:bg-slate-50')}><span className="flex items-center gap-2"><Mic size={16} className="text-slate-400" />{v}</span><Play size={14} className="text-slate-400" /></button>)}</div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Language"><select className="input" value={a.language} onChange={(e) => set('language', e.target.value)}>{['English (US)', 'English (UK)', 'English (India)', 'Hindi', 'English + Spanish', 'Spanish', 'French', 'German'].map((l) => <option key={l}>{l}</option>)}</select></Field>
                <Field label="LLM"><select className="input" value={a.model} onChange={(e) => set('model', e.target.value)}>{['GPT-class LLM (configurable)', 'Claude (Anthropic)', 'Gemini', 'Llama (self-hosted)'].map((l) => <option key={l}>{l}</option>)}</select></Field>
                <Field label="Speaking speed"><input type="range" min={0.8} max={1.3} step={0.05} defaultValue={1} className="w-full accent-brand-600" /></Field>
                <Field label="Interruption sensitivity"><input type="range" min={0} max={100} defaultValue={60} className="w-full accent-brand-600" /></Field>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>Background office ambience</span><Toggle on={false} onChange={() => {}} /></div>
            </div>
          )}
          {tab === 'actions' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Warm transfer number"><input className="input" value={a.transferNumber ?? ''} onChange={(e) => set('transferNumber', e.target.value)} placeholder="+1 (555) 000-0000" /></Field><Field label="Max call length (min)"><input type="number" className="input" value={a.maxCallMinutes} onChange={(e) => set('maxCallMinutes', +e.target.value)} /></Field></div>
              <Field label="When to transfer"><textarea className="input" rows={3} value={a.transferRules} onChange={(e) => set('transferRules', e.target.value)} /></Field>
              {[
                ['Book appointments into calendar', a.bookAppointments, (v: boolean) => set('bookAppointments', v)],
                ['Send SMS confirmation after booking', true, () => {}],
                ['Leave voicemail when machine detected', true, () => {}],
                ['Honor “remove me” → add to DNC list', true, () => {}],
                ['Push disposition & transcript to CRM', true, () => {}],
              ].map(([l, v, f]) => <div key={l as string} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"><span>{l as string}</span><Toggle on={v as boolean} onChange={f as (v: boolean) => void} /></div>)}
            </div>
          )}
          {tab === 'knowledge' && (
            <div className="space-y-4">
              <div className="grid place-items-center rounded-xl border-2 border-dashed border-slate-300 p-10 text-center text-sm text-slate-500"><div><div className="font-medium text-slate-700">Drop PDFs, DOCX or URLs here</div><div className="mt-1">The agent will use these to answer questions (pricing, FAQs, policies).</div><button className="btn-outline mt-4">Upload files</button></div></div>
              <Field label="Quick FAQ"><textarea className="input" rows={6} placeholder={'Q: What are your hours?\nA: Mon–Sat, 9am–7pm.'} /></Field>
            </div>
          )}
        </div>
        <TestConsole agent={a} />
      </div>
    </>
  )
}

function TestConsole({ agent }: { agent: AIAgent }) {
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([])
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { setMsgs([{ me: false, t: agent.greeting.replace('{{first_name}}', 'Jordan') }]) }, [agent.greeting])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [msgs])
  const reply = (t: string) => {
    const l = t.toLowerCase()
    if (l.includes('not interested') || l.includes('remove')) return 'Totally understand — I’ll make sure you’re not contacted again. Have a great day!'
    if (l.match(/\$|\d+/)) return 'Thanks! Based on that, you look like a great fit. Would you like a free assessment this Thursday at 4 PM, or should I connect you to a specialist now?'
    if (l.includes('yes') || l.includes('sure')) return agent.bookAppointments ? 'Perfect — you’re booked. I’ll text you a confirmation right away.' : 'Great, connecting you to a specialist now. I’ve passed along your details.'
    return `Got it. ${agent.goals[0] ? `Quick question to make sure this is relevant — ${agent.goals[0].toLowerCase()}?` : 'Could you tell me a bit more?'}`
  }
  const send = (e: React.FormEvent) => { e.preventDefault(); if (!text) return; const m = [...msgs, { me: true, t: text }]; setMsgs(m); setText(''); setTimeout(() => setMsgs([...m, { me: false, t: reply(text) }]), 600) }
  return (
    <div className="card flex h-[620px] flex-col overflow-hidden xl:sticky xl:top-24">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><span className="text-sm font-semibold">Test your agent</span><button className="btn-primary py-1.5 text-xs"><Mic size={14} /> Voice test</button></div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{msgs.map((m, i) => <div key={i} className={clsx('max-w-[85%] rounded-2xl px-3.5 py-2 text-sm', m.me ? 'ml-auto bg-brand-600 text-white' : 'bg-white shadow-sm')}>{m.t}</div>)}<div ref={end} /></div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3"><input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply as the prospect…" /><button className="btn-primary px-3"><Send size={16} /></button></form>
      <div className="px-3 pb-3 text-[11px] text-slate-400">Simulated replies in demo mode. The backend will route this to your LLM.</div>
    </div>
  )
}
