import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, DollarSign, PhoneCall, PhoneIncoming, Target, Timer } from 'lucide-react'
import { api } from '../../api/client'
import { Badge, PageHeader, Spinner, StatCard, fmtDur, fmtMoney, fmtNum, statusTone, useAsync, Avatar, fmtAgo } from '../../components/ui'

export const COLORS = ['#2545eb', '#7c3aed', '#0891b2', '#16a34a', '#f59e0b', '#e11d48']

export default function Dashboard() {
  const { data: s } = useAsync(api.stats)
  const { data: camps } = useAsync(api.campaigns)
  const { data: calls } = useAsync(api.calls)
  if (!s) return <Spinner />
  return (
    <>
      <PageHeader title="Good morning 👋" subtitle="Here’s what your AI agents and team did today." actions={<><Link to="/app/campaigns" className="btn-outline">New campaign</Link><Link to="/app/agents/new" className="btn-primary">Create AI agent</Link></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Calls today" value={fmtNum(s.callsToday)} delta={12} icon={<PhoneCall size={18} />} />
        <StatCard label="Connect rate" value={`${s.connectRate}%`} delta={3} icon={<PhoneIncoming size={18} />} />
        <StatCard label="Qualified leads" value={fmtNum(s.qualifiedLeads)} delta={8} icon={<Target size={18} />} />
        <StatCard label="Appointments booked" value={s.appointments} delta={-2} icon={<CalendarCheck size={18} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Call volume today</h3><div className="flex gap-3 text-xs text-slate-500"><Legend c={COLORS[0]} l="Dialed" /><Legend c={COLORS[1]} l="Connected" /><Legend c={COLORS[3]} l="Qualified" /></div></div>
          <div className="mt-4 h-72"><ResponsiveContainer><AreaChart data={s.hourly}><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.25} /><stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="hour" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip /><Area dataKey="calls" name="Dialed" stroke={COLORS[0]} fill="url(#g1)" strokeWidth={2} /><Area dataKey="connected" name="Connected" stroke={COLORS[1]} fill="transparent" strokeWidth={2} /><Area dataKey="qualified" name="Qualified" stroke={COLORS[3]} fill="transparent" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Call outcomes</h3>
          <div className="h-52"><ResponsiveContainer><PieChart><Pie data={s.outcomes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>{s.outcomes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="grid grid-cols-2 gap-2 text-xs">{s.outcomes.map((o, i) => <div key={o.name} className="flex items-center justify-between"><Legend c={COLORS[i]} l={o.name} /><b>{o.value}%</b></div>)}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg handle time" value={fmtDur(s.avgHandleSec)} icon={<Timer size={18} />} />
        <StatCard label="Cost per qualified lead" value={`$${s.costPerLead.toFixed(2)}`} icon={<DollarSign size={18} />} />
        <StatCard label="Pipeline value" value={fmtMoney(s.pipelineValue)} icon={<DollarSign size={18} />} />
        <StatCard label="Live calls now" value={<span className="flex items-center gap-2">{s.activeCalls}<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /></span>} icon={<PhoneCall size={18} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between p-5 pb-3"><h3 className="font-semibold text-slate-900">Active campaigns</h3><Link to="/app/campaigns" className="text-sm font-medium text-brand-600">View all</Link></div>
          <div className="divide-y divide-slate-100">{camps?.filter((c) => c.status !== 'completed').slice(0, 4).map((c) => (
            <div key={c.id} className="px-5 py-3">
              <div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-800">{c.name}</span><Badge tone={statusTone[c.status]}>{c.status}</Badge></div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500"><div className="h-1.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${(c.dialed / c.totalLeads) * 100}%` }} /></div>{fmtNum(c.dialed)} / {fmtNum(c.totalLeads)}</div>
            </div>))}</div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between p-5 pb-3"><h3 className="font-semibold text-slate-900">Recent calls</h3><Link to="/app/calls" className="text-sm font-medium text-brand-600">View all</Link></div>
          <div className="divide-y divide-slate-100">{calls?.filter((c) => c.durationSec > 30).slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3"><Avatar name={c.contactName} size="sm" /><div className="min-w-0 flex-1"><div className="text-sm font-medium text-slate-800">{c.contactName}</div><div className="truncate text-xs text-slate-500">{c.summary}</div></div><div className="text-right"><Badge tone={statusTone[c.outcome] ?? 'violet'}>{c.outcome}</Badge><div className="mt-1 text-xs text-slate-400">{fmtAgo(c.startedAt)}</div></div></div>))}</div>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h3 className="font-semibold text-slate-900">This week</h3>
        <div className="mt-4 h-64"><ResponsiveContainer><BarChart data={s.weekly}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="qualified" name="Qualified" fill={COLORS[0]} radius={[4, 4, 0, 0]} /><Bar dataKey="appointments" name="Appointments" fill={COLORS[1]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </>
  )
}
export const Legend = ({ c, l }: { c: string; l: string }) => <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />{l}</span>
