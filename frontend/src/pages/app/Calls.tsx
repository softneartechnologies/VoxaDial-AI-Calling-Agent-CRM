import { useMemo, useState } from 'react'
import { Download, Pause, Play, PhoneIncoming, PhoneOutgoing } from 'lucide-react'
import clsx from 'clsx'
import { api } from '../../api/client'
import type { Call } from '../../api/types'
import { Avatar, Badge, Drawer, PageHeader, Spinner, fmtAgo, fmtDur, statusTone, useAsync } from '../../components/ui'

export default function Calls() {
  const { data } = useAsync(api.calls)
  const [sel, setSel] = useState<Call | null>(null)
  const [outcome, setOutcome] = useState('all')
  const [q, setQ] = useState('')
  const rows = useMemo(() => (data ?? []).filter((c) => (outcome === 'all' || c.outcome === outcome) && (c.contactName + c.summary + c.transcript.map((t) => t.text).join(' ')).toLowerCase().includes(q.toLowerCase())), [data, outcome, q])
  return (
    <>
      <PageHeader title="Call Logs" subtitle="Every call with recording, transcript, AI summary and sentiment." />
      <div className="card">
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
          <input className="input max-w-xs" placeholder="Search transcripts…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input max-w-[200px]" value={outcome} onChange={(e) => setOutcome(e.target.value)}>{['all', 'qualified', 'transferred', 'appointment', 'callback', 'voicemail', 'no-answer', 'not-interested'].map((o) => <option key={o}>{o}</option>)}</select>
        </div>
        {!data ? <Spinner /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px]">
          <thead className="bg-slate-50"><tr><th className="th">Contact</th><th className="th">Agent</th><th className="th">Campaign</th><th className="th">Duration</th><th className="th">Outcome</th><th className="th">Sentiment</th><th className="th">AMD</th><th className="th">When</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((c) => (
            <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSel(c)}>
              <td className="td"><div className="flex items-center gap-3">{c.direction === 'inbound' ? <PhoneIncoming size={16} className="text-emerald-600" /> : <PhoneOutgoing size={16} className="text-brand-600" />}<div><div className="font-medium text-slate-900">{c.contactName}</div><div className="font-mono text-xs text-slate-500">{c.phone}</div></div></div></td>
              <td className="td">{c.agentName}</td><td className="td max-w-[180px] truncate text-slate-500">{c.campaignName}</td><td className="td font-mono">{fmtDur(c.durationSec)}</td>
              <td className="td"><Badge tone={statusTone[c.outcome] ?? 'violet'}>{c.outcome}</Badge></td><td className="td"><Badge tone={statusTone[c.sentiment]}>{c.sentiment}</Badge></td>
              <td className="td text-xs text-slate-500">{c.amd}</td><td className="td text-slate-500">{fmtAgo(c.startedAt)}</td>
            </tr>))}</tbody>
        </table></div>}
      </div>
      <CallDrawer call={sel} onClose={() => setSel(null)} />
    </>
  )
}

function CallDrawer({ call, onClose }: { call: Call | null; onClose: () => void }) {
  const [playing, setPlaying] = useState(false)
  return (
    <Drawer open={!!call} onClose={onClose}>
      {call && <div className="p-6">
        <div className="flex items-center gap-4"><Avatar name={call.contactName} size="lg" /><div><h2 className="text-xl font-bold text-slate-900">{call.contactName}</h2><div className="text-sm text-slate-500">{call.direction} · {new Date(call.startedAt).toLocaleString()} · {fmtDur(call.durationSec)}</div></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><Badge tone={statusTone[call.outcome] ?? 'violet'}>{call.outcome}</Badge><Badge tone={statusTone[call.sentiment]}>{call.sentiment}</Badge><Badge>AI: {call.agentName}</Badge><Badge>${call.cost.toFixed(2)}</Badge></div>
        {call.durationSec > 0 && <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-900 p-3 text-white">
          <button onClick={() => setPlaying(!playing)} className="grid h-10 w-10 place-items-center rounded-full bg-brand-600">{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          <div className="flex h-8 flex-1 items-center gap-[2px]">{Array.from({ length: 70 }, (_, i) => <span key={i} className={clsx('w-full rounded-sm', i < 22 ? 'bg-brand-400' : 'bg-white/25')} style={{ height: `${20 + Math.abs(Math.sin(i * 1.7)) * 80}%` }} />)}</div>
          <button className="text-slate-400"><Download size={16} /></button>
        </div>}
        <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-brand-700">AI summary</div><p className="mt-1 text-sm text-slate-800">{call.summary}</p></div>
        <h3 className="mt-6 text-sm font-semibold text-slate-900">Transcript</h3>
        <div className="mt-3 space-y-3">
          {call.transcript.length === 0 && <div className="text-sm text-slate-500">No conversation (voicemail / no answer).</div>}
          {call.transcript.map((t, i) => <div key={i} className={clsx('flex gap-3', t.speaker === 'customer' && 'flex-row-reverse text-right')}><span className="mt-1 w-10 shrink-0 font-mono text-[11px] text-slate-400">{fmtDur(t.at)}</span><div className={clsx('rounded-2xl px-3.5 py-2 text-sm', t.speaker === 'ai' ? 'bg-brand-600 text-white' : t.speaker === 'agent' ? 'bg-violet-100 text-violet-900' : 'bg-slate-100')}><div className="mb-0.5 text-[10px] font-semibold uppercase opacity-70">{t.speaker === 'ai' ? call.agentName + ' (AI)' : t.speaker}</div>{t.text}</div></div>)}
        </div>
      </div>}
    </Drawer>
  )
}
