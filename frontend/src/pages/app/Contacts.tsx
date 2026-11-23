import { useEffect, useMemo, useState } from 'react'
import { Download, Filter, Mail, MessageSquare, Phone, Plus, Upload } from 'lucide-react'
import { api } from '../../api/client'
import type { Activity, Call, Contact, LeadStatus } from '../../api/types'
import { Avatar, Badge, Drawer, Field, Modal, PageHeader, Spinner, Tabs, fmtAgo, fmtDur, fmtMoney, statusTone, useAsync } from '../../components/ui'
import { usePhone } from '../../layouts/AppLayout'

export const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'appointment', 'won', 'lost']

export default function Contacts() {
  const { data, setData, reload } = useAsync(api.contacts)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<LeadStatus | 'all'>('all')
  const [sel, setSel] = useState<Contact | null>(null)
  const [adding, setAdding] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const phone = usePhone()
  const rows = useMemo(() => (data ?? []).filter((c) => (status === 'all' || c.status === status) && `${c.name} ${c.company} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase())), [data, q, status])

  const exportCsv = () => {
    const head = 'name,phone,email,company,status,score'
    const blob = new Blob([[head, ...rows.map((c) => [c.name, c.phone, c.email, c.company, c.status, c.score].join(','))].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'contacts.csv'; a.click()
  }
  const importCsv = async (file?: File) => {
    if (!file) return
    const [header, ...lines] = (await file.text()).trim().split('\n'); const cols = header.split(',').map((h) => h.trim().toLowerCase())
    const get = (r: string[], k: string) => r[cols.indexOf(k)]?.trim() ?? ''
    await api.importContacts(lines.map((l) => l.split(',')).map((r) => ({ name: get(r, 'name') || `${get(r, 'first_name')} ${get(r, 'last_name')}`.trim(), phone: get(r, 'phone'), email: get(r, 'email'), company: get(r, 'company'), title: '', city: '', status: 'new', score: 50, tags: [], owner: 'You', source: 'CSV Import', value: 0 })))
    reload()
  }

  return (
    <>
      <PageHeader title="Contacts" subtitle={`${data?.length ?? '…'} leads in your CRM`} actions={<>
        <label className="btn-outline cursor-pointer"><Upload size={16} />Import CSV<input type="file" accept=".csv" className="hidden" onChange={(e) => importCsv(e.target.files?.[0])} /></label>
        <button className="btn-outline" onClick={exportCsv}><Download size={16} />Export</button>
        <button className="btn-primary" onClick={() => setAdding(true)}><Plus size={16} />Add contact</button>
      </>} />
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <input className="input max-w-xs" placeholder="Search name, company, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex flex-wrap gap-1"><Filter size={16} className="mr-1 self-center text-slate-400" />{(['all', ...STATUSES] as const).map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>)}</div>
          {checked.length > 0 && <div className="ml-auto flex items-center gap-2 text-sm"><span className="text-slate-500">{checked.length} selected</span><button className="btn-outline py-1.5 text-xs">Add to campaign</button><button className="btn-outline py-1.5 text-xs">Tag</button></div>}
        </div>
        {!data ? <Spinner /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[900px]">
            <thead className="bg-slate-50"><tr><th className="th w-8"><input type="checkbox" onChange={(e) => setChecked(e.target.checked ? rows.map((r) => r.id) : [])} /></th><th className="th">Name</th><th className="th">Company</th><th className="th">Phone</th><th className="th">Status</th><th className="th">Score</th><th className="th">Owner</th><th className="th">Last contact</th><th className="th" /></tr></thead>
            <tbody className="divide-y divide-slate-100">{rows.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSel(c)}>
                <td className="td" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={checked.includes(c.id)} onChange={(e) => setChecked(e.target.checked ? [...checked, c.id] : checked.filter((x) => x !== c.id))} /></td>
                <td className="td"><div className="flex items-center gap-3"><Avatar name={c.name} size="sm" /><div><div className="font-medium text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.email}</div></div></div></td>
                <td className="td max-w-[180px]">{c.company}<div className="text-xs text-slate-400">{c.city}</div></td>
                <td className="td whitespace-nowrap font-mono text-xs">{c.phone}</td>
                <td className="td"><Badge tone={statusTone[c.status]}>{c.status}</Badge></td>
                <td className="td"><ScoreBar v={c.score} /></td>
                <td className="td text-slate-600">{c.owner}</td>
                <td className="td text-slate-500">{fmtAgo(c.lastContacted)}</td>
                <td className="td" onClick={(e) => e.stopPropagation()}><button className="btn-ghost p-2 text-emerald-600" onClick={() => phone.dial(c.phone, c.name)}><Phone size={16} /></button></td>
              </tr>))}</tbody>
          </table>{rows.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No contacts match.</div>}</div>
        )}
      </div>
      <ContactDrawer contact={sel} onClose={() => setSel(null)} onChange={(c) => { setSel(c); setData(data!.map((x) => (x.id === c.id ? c : x))) }} />
      <AddContact open={adding} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload() }} />
    </>
  )
}

export function ScoreBar({ v }: { v: number }) {
  const c = v >= 75 ? 'bg-emerald-500' : v >= 45 ? 'bg-amber-500' : 'bg-rose-500'
  return <div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-slate-100"><div className={`h-full rounded-full ${c}`} style={{ width: `${v}%` }} /></div><span className="text-xs font-medium text-slate-700">{v}</span></div>
}

export function ContactDrawer({ contact, onClose, onChange }: { contact: Contact | null; onClose: () => void; onChange: (c: Contact) => void }) {
  const [tab, setTab] = useState<'activity' | 'calls' | 'details'>('activity')
  const [acts, setActs] = useState<Activity[]>([])
  const [calls, setCalls] = useState<Call[]>([])
  const [note, setNote] = useState('')
  const phone = usePhone()
  useEffect(() => { if (contact) { api.activities(contact.id).then(setActs); api.callsForContact(contact.id).then(setCalls) } }, [contact?.id])
  const c = contact
  return (
    <Drawer open={!!c} onClose={onClose}>
      {c && <div>
        <div className="border-b border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6">
          <div className="flex items-center gap-4"><Avatar name={c.name} size="lg" /><div><h2 className="text-xl font-bold text-slate-900">{c.name}</h2><div className="text-sm text-slate-500">{c.title} · {c.company}</div><div className="mt-1 flex gap-1">{c.tags.map((t) => <Badge key={t}>#{t}</Badge>)}</div></div></div>
          <div className="mt-5 grid grid-cols-3 gap-2"><button className="btn-primary" onClick={() => phone.dial(c.phone, c.name)}><Phone size={16} />Call</button><button className="btn-outline"><MessageSquare size={16} />SMS</button><button className="btn-outline"><Mail size={16} />Email</button></div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs"><div className="rounded-lg bg-white p-2 ring-1 ring-slate-200"><div className="text-slate-500">Score</div><div className="text-base font-bold">{c.score}</div></div><div className="rounded-lg bg-white p-2 ring-1 ring-slate-200"><div className="text-slate-500">Deal value</div><div className="text-base font-bold">{fmtMoney(c.value)}</div></div><div className="rounded-lg bg-white p-2 ring-1 ring-slate-200"><div className="text-slate-500">Stage</div><select value={c.status} onChange={async (e) => onChange(await api.updateContact(c.id, { status: e.target.value as LeadStatus }))} className="w-full bg-transparent text-center text-sm font-bold capitalize outline-none">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div></div>
        </div>
        <div className="p-6">
          <Tabs value={tab} onChange={setTab} tabs={[{ id: 'activity', label: 'Activity' }, { id: 'calls', label: `Calls (${calls.length})` }, { id: 'details', label: 'Details' }]} />
          {tab === 'activity' && <>
            <form className="mb-5 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!note) return; const a = await api.addNote(c.id, note); setActs([a, ...acts]); setNote('') }}><input className="input" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn-primary">Save</button></form>
            <ol className="relative space-y-5 border-l border-slate-200 pl-5">{acts.map((a) => <li key={a.id}><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500" /><div className="text-sm text-slate-800">{a.text}</div><div className="text-xs text-slate-400">{a.type} · {a.by} · {fmtAgo(a.at)}</div></li>)}{acts.length === 0 && <li className="text-sm text-slate-500">No activity yet.</li>}</ol>
          </>}
          {tab === 'calls' && <div className="space-y-3">{calls.map((x) => <div key={x.id} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between text-sm"><span className="font-medium">{x.agentName} · {fmtDur(x.durationSec)}</span><Badge tone={statusTone[x.outcome] ?? 'violet'}>{x.outcome}</Badge></div><p className="mt-1 text-sm text-slate-600">{x.summary}</p><div className="mt-1 text-xs text-slate-400">{fmtAgo(x.startedAt)} · {x.campaignName}</div></div>)}{calls.length === 0 && <div className="text-sm text-slate-500">No calls yet.</div>}</div>}
          {tab === 'details' && <dl className="grid grid-cols-2 gap-4 text-sm">{[['Phone', c.phone], ['Email', c.email], ['Company', c.company], ['Title', c.title], ['City', c.city], ['Source', c.source], ['Owner', c.owner], ['Created', new Date(c.createdAt).toLocaleDateString()]].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>)}</dl>}
        </div>
      </div>}
    </Drawer>
  )
}

function AddContact({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', company: '', title: '', city: '', value: 0 })
  return (
    <Modal open={open} onClose={onClose} title="Add contact">
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); await api.createContact({ ...f, status: 'new', score: 50, tags: [], owner: 'You', source: 'Manual' }); setF({ name: '', phone: '', email: '', company: '', title: '', city: '', value: 0 }); onSaved() }}>
        <div className="grid gap-4 sm:grid-cols-2">{(['name', 'phone', 'email', 'company', 'title', 'city'] as const).map((k) => <Field key={k} label={k}><input required={k === 'name' || k === 'phone'} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}</div>
        <Field label="Deal value ($)"><input type="number" className="input" value={f.value} onChange={(e) => setF({ ...f, value: +e.target.value })} /></Field>
        <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary">Save contact</button></div>
      </form>
    </Modal>
  )
}
