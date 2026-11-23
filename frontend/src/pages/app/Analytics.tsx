import { Bar, BarChart, CartesianGrid, Funnel, FunnelChart, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../../api/client'
import { PageHeader, Spinner, StatCard, fmtNum, useAsync } from '../../components/ui'
import { COLORS } from './Dashboard'

export default function Analytics() {
  const { data: s } = useAsync(api.stats)
  const { data: agents } = useAsync(api.agents)
  const { data: camps } = useAsync(api.campaigns)
  if (!s || !agents || !camps) return <Spinner />
  const dialed = camps.reduce((t, c) => t + c.dialed, 0), connected = camps.reduce((t, c) => t + c.connected, 0), qualified = camps.reduce((t, c) => t + c.qualified, 0), appts = camps.reduce((t, c) => t + c.appointments, 0)
  const funnel = [{ name: 'Dialed', value: dialed, fill: COLORS[0] }, { name: 'Connected', value: connected, fill: COLORS[1] }, { name: 'Qualified', value: qualified, fill: COLORS[2] }, { name: 'Appointments', value: appts, fill: COLORS[3] }]
  const trend = Array.from({ length: 30 }, (_, i) => ({ d: `D${i + 1}`, connect: +(26 + Math.sin(i / 3) * 4 + i * 0.12).toFixed(1), qualify: +(15 + Math.cos(i / 4) * 3 + i * 0.08).toFixed(1) }))
  return (
    <>
      <PageHeader title="Analytics" subtitle="Last 30 days across all campaigns." actions={<><select className="input w-40"><option>Last 30 days</option><option>Last 7 days</option><option>This quarter</option></select><button className="btn-outline">Schedule report</button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total dialed" value={fmtNum(dialed)} /><StatCard label="Connect rate" value={`${((connected / dialed) * 100).toFixed(1)}%`} /><StatCard label="Qualification rate" value={`${((qualified / connected) * 100).toFixed(1)}%`} /><StatCard label="Cost / qualified lead" value="$6.40" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-5"><h3 className="font-semibold">Conversion funnel</h3><div className="mt-4 h-72"><ResponsiveContainer><FunnelChart><Tooltip /><Funnel dataKey="value" data={funnel} isAnimationActive><LabelList position="center" fill="#fff" stroke="none" dataKey="name" fontSize={12} /></Funnel></FunnelChart></ResponsiveContainer></div></div>
        <div className="card p-5"><h3 className="font-semibold">Connect & qualify rate trend (%)</h3><div className="mt-4 h-72"><ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="d" tick={{ fontSize: 11 }} interval={4} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Line dataKey="connect" name="Connect %" stroke={COLORS[0]} strokeWidth={2} dot={false} /><Line dataKey="qualify" name="Qualify %" stroke={COLORS[1]} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-5"><h3 className="font-semibold">AI agent success rate</h3><div className="mt-4 h-64"><ResponsiveContainer><BarChart data={agents} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11 }} unit="%" /><YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={50} /><Tooltip /><Bar dataKey="successRate" name="Success %" fill={COLORS[0]} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="card overflow-hidden"><h3 className="p-5 pb-3 font-semibold">Campaign leaderboard</h3><table className="w-full"><thead className="bg-slate-50"><tr><th className="th">Campaign</th><th className="th">Connect</th><th className="th">Qualified</th><th className="th">Qual. rate</th></tr></thead><tbody className="divide-y divide-slate-100">{[...camps].filter((c) => c.dialed).sort((a, b) => b.qualified / b.connected - a.qualified / a.connected).map((c) => <tr key={c.id}><td className="td font-medium">{c.name}</td><td className="td">{((c.connected / c.dialed) * 100).toFixed(0)}%</td><td className="td">{fmtNum(c.qualified)}</td><td className="td font-semibold text-brand-700">{((c.qualified / c.connected) * 100).toFixed(1)}%</td></tr>)}</tbody></table></div>
      </div>
    </>
  )
}
