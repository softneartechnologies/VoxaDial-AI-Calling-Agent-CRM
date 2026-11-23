import { useState } from 'react'
import { Check, FileSpreadsheet, Pause, Play, Plus } from 'lucide-react'
import clsx from 'clsx'
import { api } from '../../api/client'
import type { Campaign, DialMode } from '../../api/types'
import { Badge, Field, Modal, PageHeader, Spinner, fmtNum, statusTone, useAsync } from '../../components/ui'

export default function Campaigns() {
  const { data, setData, reload } = useAsync(api.campaigns)
  const [open, setOpen] = useState(false)
  const toggle = async (c: Campaign) => { const s = await api.setCampaignStatus(c.id, c.status === 'running' ? 'paused' : 'running'); setData(data!.map((x) => (x.id === c.id ? s : x))) }
  return (
    <>
      <PageHeader title="Campaigns" subtitle="Dial lists with AI agents or your human team." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} />New campaign</button>} />
      {!data ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">Campaign</th><th className="th">Mode</th><th className="th">Progress</th><th className="th">Connected</th><th className="th">Qualified</th><th className="th">Appts</th><th className="th">Status</th><th className="th" /></tr></thead>
            <tbody className="divide-y divide-slate-100">{data.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="td"><div className="font-medium text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.agentName} · {c.schedule.days.length} days/wk · {c.schedule.start}–{c.schedule.end}</div></td>
                <td className="td"><Badge tone={c.mode === 'ai-agent' ? 'violet' : 'blue'}>{c.mode}</Badge></td>
                <td className="td w-48"><div className="flex items-center gap-2 text-xs text-slate-500"><div className="h-1.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${c.totalLeads ? (c.dialed / c.totalLeads) * 100 : 0}%` }} /></div>{c.totalLeads ? Math.round((c.dialed / c.totalLeads) * 100) : 0}%</div><div className="mt-1 text-xs text-slate-400">{fmtNum(c.dialed)} / {fmtNum(c.totalLeads)}</div></td>
                <td className="td">{fmtNum(c.connected)} <span className="text-xs text-slate-400">({c.dialed ? Math.round((c.connected / c.dialed) * 100) : 0}%)</span></td>
                <td className="td font-semibold text-slate-900">{fmtNum(c.qualified)}</td>
                <td className="td">{fmtNum(c.appointments)}</td>
                <td className="td"><Badge tone={statusTone[c.status]}>{c.status}</Badge></td>
                <td className="td text-right">{['running', 'paused'].includes(c.status) && <button className="btn-outline px-2.5 py-1.5" onClick={() => toggle(c)}>{c.status === 'running' ? <Pause size={14} /> : <Play size={14} />}</button>}</td>
              </tr>))}</tbody>
          </table>
        </div>
      )}
      <NewCampaign open={open} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); reload() }} />
    </>
  )
}

const modes: { id: DialMode; t: string; d: string }[] = [
  { id: 'ai-agent', t: 'AI agent', d: 'AI calls, qualifies, books & transfers' },
  { id: 'predictive', t: 'Predictive', d: 'Dials multiple lines per human agent' },
  { id: 'progressive', t: 'Progressive', d: 'Next call when an agent frees up' },
  { id: 'preview', t: 'Preview', d: 'Agent reviews lead before dialing' },
]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function NewCampaign({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { data: agents } = useAsync(api.agents)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: '', mode: 'ai-agent' as DialMode, agentId: 'a_1', leads: 0, fileName: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '09:00', end: '18:00', timezone: 'Lead local time', maxAttempts: 3, linesPerAgent: 3, localPresence: true })
  const steps = ['Basics', 'Leads', 'Schedule', 'Review']
  const onFile = (file?: File) => { if (!file) return; file.text().then((t) => setF({ ...f, fileName: file.name, leads: Math.max(0, t.trim().split('\n').length - 1) })) }
  const create = async () => {
    const agent = agents?.find((a) => a.id === f.agentId)
    await api.createCampaign({ name: f.name || 'Untitled campaign', status: 'scheduled', mode: f.mode, agentId: f.mode === 'ai-agent' ? f.agentId : undefined, agentName: f.mode === 'ai-agent' ? agent?.name ?? 'AI' : 'Human team', totalLeads: f.leads || 500, dialed: 0, connected: 0, qualified: 0, appointments: 0, callerIdStrategy: f.localPresence ? 'local-presence' : 'fixed', schedule: { days: f.days, start: f.start, end: f.end, timezone: f.timezone }, maxAttempts: f.maxAttempts, linesPerAgent: f.linesPerAgent })
    setStep(0); onCreated()
  }
  return (
    <Modal open={open} onClose={onClose} title="New campaign" wide>
      <div className="mb-6 flex items-center gap-2">{steps.map((s, i) => <div key={s} className="flex flex-1 items-center gap-2"><span className={clsx('grid h-7 w-7 place-items-center rounded-full text-xs font-semibold', i <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>{i < step ? <Check size={14} /> : i + 1}</span><span className={clsx('text-sm', i === step ? 'font-semibold text-slate-900' : 'text-slate-500')}>{s}</span>{i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200" />}</div>)}</div>
      {step === 0 && <div className="space-y-5">
        <Field label="Campaign name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Solar — Florida homeowners" /></Field>
        <div><span className="label">Dialing mode</span><div className="grid gap-2 sm:grid-cols-2">{modes.map((m) => <button key={m.id} onClick={() => setF({ ...f, mode: m.id })} className={clsx('rounded-lg border p-3 text-left', f.mode === m.id ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 hover:bg-slate-50')}><div className="text-sm font-semibold">{m.t}</div><div className="text-xs text-slate-500">{m.d}</div></button>)}</div></div>
        {f.mode === 'ai-agent' && <Field label="AI agent"><select className="input" value={f.agentId} onChange={(e) => setF({ ...f, agentId: e.target.value })}>{agents?.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}</select></Field>}
      </div>}
      {step === 1 && <div className="space-y-4">
        <label className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-300 p-10 text-center hover:border-brand-400">
          <input type="file" accept=".csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <FileSpreadsheet className="text-brand-600" size={32} />
          <div className="mt-3 font-medium text-slate-800">{f.fileName || 'Upload CSV of leads'}</div>
          <div className="text-sm text-slate-500">{f.fileName ? `${fmtNum(f.leads)} rows detected` : 'Columns: first_name, last_name, phone, email, company'}</div>
        </label>
        <div className="text-center text-sm text-slate-500">— or —</div>
        <select className="input"><option>Use a saved CRM segment…</option><option>All “new” contacts</option><option>Tag: hot</option><option>HubSpot list: Q4 inbound</option></select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Scrub against DNC list before dialing</label>
      </div>}
      {step === 2 && <div className="space-y-5">
        <div><span className="label">Calling days</span><div className="flex flex-wrap gap-2">{DAYS.map((d) => <button key={d} onClick={() => setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] })} className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium', f.days.includes(d) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}>{d}</button>)}</div></div>
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Start"><input type="time" className="input" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field><Field label="End"><input type="time" className="input" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field><Field label="Time zone"><select className="input" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })}><option>Lead local time</option><option>America/New_York</option><option>America/Chicago</option><option>America/Los_Angeles</option><option>Asia/Kolkata</option></select></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Max attempts per lead"><input type="number" className="input" value={f.maxAttempts} onChange={(e) => setF({ ...f, maxAttempts: +e.target.value })} /></Field><Field label="Concurrent lines"><input type="number" className="input" value={f.linesPerAgent} onChange={(e) => setF({ ...f, linesPerAgent: +e.target.value })} /></Field></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.localPresence} onChange={(e) => setF({ ...f, localPresence: e.target.checked })} /> Use local presence caller ID</label>
      </div>}
      {step === 3 && <div className="space-y-2 rounded-xl bg-slate-50 p-5 text-sm">{[['Name', f.name || 'Untitled campaign'], ['Mode', f.mode], ['Agent', f.mode === 'ai-agent' ? agents?.find((a) => a.id === f.agentId)?.name : 'Human team'], ['Leads', f.leads ? fmtNum(f.leads) : 'Sample list (500)'], ['Schedule', `${f.days.join(', ')} · ${f.start}–${f.end} (${f.timezone})`], ['Attempts / lines', `${f.maxAttempts} / ${f.linesPerAgent}`], ['Caller ID', f.localPresence ? 'Local presence' : 'Fixed']].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-medium text-slate-900">{v}</span></div>)}</div>}
      <div className="mt-6 flex justify-between"><button className="btn-ghost" onClick={() => (step ? setStep(step - 1) : onClose())}>{step ? 'Back' : 'Cancel'}</button>{step < 3 ? <button className="btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn-primary" onClick={create}>Launch campaign</button>}</div>
    </Modal>
  )
}
