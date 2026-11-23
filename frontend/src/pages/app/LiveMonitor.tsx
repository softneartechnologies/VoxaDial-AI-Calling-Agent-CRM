import { useEffect, useState } from 'react'
import { Ear, MessageSquare, PhoneForwarded } from 'lucide-react'
import { api } from '../../api/client'
import type { LiveCall } from '../../api/types'
import { Avatar, Badge, PageHeader, Spinner, Wave, fmtDur, statusTone } from '../../components/ui'

export default function LiveMonitor() {
  const [calls, setCalls] = useState<LiveCall[]>()
  const [tick, setTick] = useState(0)
  useEffect(() => { api.liveCalls().then(setCalls); const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t) }, [])
  return (
    <>
      <PageHeader title="Live Monitor" subtitle="Listen, whisper or barge into any live AI or agent call." actions={<Badge tone="green"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Real-time</Badge>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">{[['Lines in use', '37 / 60'], ['Ringing', '12'], ['AI talking', '29'], ['Waiting for transfer', '3']].map(([l, v]) => <div key={l} className="card p-4"><div className="text-xs text-slate-500">{l}</div><div className="mt-1 text-xl font-bold text-slate-900">{v}</div></div>)}</div>
      {!calls ? <Spinner /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {calls.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Avatar name={c.contactName} /><div><div className="font-medium text-slate-900">{c.contactName}</div><div className="text-xs text-slate-500">{c.phone}</div></div></div><span className="flex items-center gap-2 text-sm font-mono text-emerald-600"><Wave />{fmtDur(c.startedSecAgo + tick)}</span></div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs"><Badge tone="violet">AI: {c.agentName}</Badge><Badge tone="blue">{c.stage}</Badge><Badge tone={statusTone[c.sentiment]}>{c.sentiment}</Badge></div>
              <div className="mt-2 truncate text-xs text-slate-400">{c.campaignName}</div>
              <div className="mt-4 grid grid-cols-3 gap-2"><button className="btn-outline py-1.5 text-xs"><Ear size={14} />Listen</button><button className="btn-outline py-1.5 text-xs"><MessageSquare size={14} />Whisper</button><button className="btn-outline py-1.5 text-xs"><PhoneForwarded size={14} />Take over</button></div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
