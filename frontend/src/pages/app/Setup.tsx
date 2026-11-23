import { useState } from 'react'
import { Copy, KeyRound, Plus, RefreshCw, ShieldCheck } from 'lucide-react'
import { api } from '../../api/client'
import { Badge, Field, PageHeader, Spinner, Tabs, Toggle, statusTone, useAsync } from '../../components/ui'

export function Numbers() {
  const { data } = useAsync(api.numbers)
  return (
    <>
      <PageHeader title="Phone Numbers" subtitle="Local presence DIDs with health monitoring and auto-rotation." actions={<button className="btn-primary"><Plus size={16} />Buy numbers</button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5"><ShieldCheck className="text-emerald-600" /><div><div className="text-sm text-slate-500">STIR/SHAKEN A-attestation</div><div className="text-xl font-bold">{data ? Math.round((data.filter((n) => n.attestation === 'A').length / data.length) * 100) : 0}%</div></div></div>
        <div className="card flex items-center gap-4 p-5"><RefreshCw className="text-brand-600" /><div><div className="text-sm text-slate-500">Auto-rotate flagged numbers</div><Toggle on onChange={() => {}} /></div></div>
        <div className="card flex items-center gap-4 p-5"><KeyRound className="text-violet-600" /><div><div className="text-sm text-slate-500">Area codes covered</div><div className="text-xl font-bold">{data ? new Set(data.map((n) => n.areaCode)).size : 0}</div></div></div>
      </div>
      {!data ? <Spinner /> : <div className="card overflow-x-auto"><table className="w-full min-w-[800px]"><thead className="bg-slate-50"><tr><th className="th">Number</th><th className="th">Region</th><th className="th">Type</th><th className="th">Attestation</th><th className="th">Answer rate</th><th className="th">Calls today</th><th className="th">Assigned</th><th className="th">Health</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{data.map((n) => <tr key={n.id}><td className="td font-mono">{n.number}</td><td className="td">{n.region}</td><td className="td capitalize">{n.type}</td><td className="td"><Badge tone={n.attestation === 'A' ? 'green' : 'amber'}>{n.attestation}</Badge></td><td className="td">{n.answerRate}%</td><td className="td">{n.callsToday}</td><td className="td text-slate-500">{n.assignedTo ?? '—'}</td><td className="td"><Badge tone={statusTone[n.status]}>{n.status}</Badge></td></tr>)}</tbody></table></div>}
    </>
  )
}

export function Integrations() {
  const { data, setData } = useAsync(api.integrations)
  const [busy, setBusy] = useState<string>()
  const toggle = async (id: string) => { setBusy(id); const x = await api.toggleIntegration(id); setData(data!.map((i) => (i.id === id ? x : i))); setBusy(undefined) }
  return (
    <>
      <PageHeader title="Integrations" subtitle="Connect your CRM, calendar, carrier and automations." />
      {!data ? <Spinner /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.map((i) => (
        <div key={i.id} className="card flex flex-col p-5">
          <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl text-lg font-bold text-white" style={{ background: i.color }}>{i.name[0]}</span>{i.connected && <Badge tone="green">Connected</Badge>}</div>
          <h3 className="mt-4 font-semibold text-slate-900">{i.name}</h3><div className="text-xs text-slate-400">{i.category}</div>
          <p className="mt-2 flex-1 text-sm text-slate-600">{i.description}</p>
          <button disabled={busy === i.id} onClick={() => toggle(i.id)} className={`mt-4 ${i.connected ? 'btn-outline' : 'btn-primary'}`}>{busy === i.id ? '…' : i.connected ? 'Disconnect' : 'Connect'}</button>
        </div>))}</div>}
    </>
  )
}

export function SettingsPage() {
  const [tab, setTab] = useState<'general' | 'team' | 'compliance' | 'api' | 'billing'>('general')
  return (
    <>
      <PageHeader title="Settings" />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'general', label: 'General' }, { id: 'team', label: 'Team' }, { id: 'compliance', label: 'Compliance' }, { id: 'api', label: 'API & Webhooks' }, { id: 'billing', label: 'Billing' }]} />
      <div className="card max-w-3xl p-6">
        {tab === 'general' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Workspace name"><input className="input" defaultValue="Northwind Solar" /></Field><Field label="Default time zone"><select className="input"><option>America/Chicago</option><option>Asia/Kolkata</option></select></Field><Field label="Default caller ID"><input className="input" defaultValue="+1 (512) 555-0142" /></Field><Field label="Recording"><select className="input"><option>Record all calls</option><option>Record AI calls only</option><option>Off</option></select></Field><div className="sm:col-span-2"><button className="btn-primary">Save changes</button></div></div>}
        {tab === 'team' && <div className="space-y-3">{[['Demo User', 'Owner'], ['Neha K.', 'Admin'], ['Marcus D.', 'Agent'], ['Sara P.', 'Supervisor']].map(([n, r]) => <div key={n} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"><span className="font-medium">{n}</span><select className="input w-40" defaultValue={r}><option>Owner</option><option>Admin</option><option>Supervisor</option><option>Agent</option></select></div>)}<button className="btn-outline"><Plus size={16} />Invite teammate</button></div>}
        {tab === 'compliance' && <div className="space-y-3 text-sm">{['Enforce calling hours in lead’s local time (8am–9pm)', 'Scrub against internal DNC list', 'Scrub against national DNC registry', 'Play recording disclosure at call start', 'AI agent identifies itself as an AI assistant', 'Auto opt-out on “stop / remove me”'].map((t, i) => <div key={t} className="flex items-center justify-between rounded-lg border border-slate-200 p-3"><span>{t}</span><Toggle on={i !== 2} onChange={() => {}} /></div>)}<p className="text-xs text-slate-500">These controls support TCPA/DNC compliance but don’t replace legal advice.</p></div>}
        {tab === 'api' && <div className="space-y-4"><Field label="API key"><div className="flex gap-2"><input className="input font-mono" readOnly value="vx_live_••••••••••••3f9a" /><button className="btn-outline"><Copy size={16} /></button></div></Field><Field label="Webhook URL"><input className="input" placeholder="https://your-app.com/webhooks/voxadial" /></Field><div><span className="label">Events</span><div className="flex flex-wrap gap-2">{['call.started', 'call.completed', 'lead.qualified', 'appointment.booked', 'transfer.completed'].map((e) => <label key={e} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs"><input type="checkbox" defaultChecked />{e}</label>)}</div></div></div>}
        {tab === 'billing' && <div className="space-y-4 text-sm"><div className="flex items-center justify-between rounded-lg bg-brand-50 p-4"><div><div className="font-semibold">Growth plan</div><div className="text-slate-600">5 seats · 5,000 AI minutes / month</div></div><button className="btn-primary">Upgrade</button></div><div className="grid grid-cols-3 gap-3">{[['AI minutes', '3,412'], ['Telephony', '$412.80'], ['Numbers', '14']].map(([k, v]) => <div key={k} className="rounded-lg border border-slate-200 p-3"><div className="text-xs text-slate-500">{k}</div><div className="text-lg font-bold">{v}</div></div>)}</div></div>}
      </div>
    </>
  )
}
