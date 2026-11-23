import { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell, Bot, ChevronDown, Grid2x2, KanbanSquare, LayoutDashboard, LineChart, Megaphone, Menu, Mic, MicOff, Pause, Phone, PhoneCall, PhoneOff,
  Plug, Radio, Search, Settings, Users, X, Hash, Delete,
} from 'lucide-react'
import clsx from 'clsx'
import { Logo, Wave, fmtDur } from '../components/ui'
import { api } from '../api/client'

// ---- Softphone context: any page can call phone.dial('+1...', 'Name') ----
type PhoneCtx = { dial: (number: string, name?: string) => void }
const PhoneContext = createContext<PhoneCtx>({ dial: () => {} })
export const usePhone = () => useContext(PhoneContext)

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/live', label: 'Live Monitor', icon: Radio },
  { to: '/app/agents', label: 'AI Agents', icon: Bot },
  { to: '/app/campaigns', label: 'Campaigns', icon: Megaphone },
  { section: 'CRM' },
  { to: '/app/contacts', label: 'Contacts', icon: Users },
  { to: '/app/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/app/calls', label: 'Call Logs', icon: PhoneCall },
  { section: 'Insights' },
  { to: '/app/analytics', label: 'Analytics', icon: LineChart },
  { section: 'Setup' },
  { to: '/app/numbers', label: 'Phone Numbers', icon: Hash },
  { to: '/app/integrations', label: 'Integrations', icon: Plug },
  { to: '/app/settings', label: 'Settings', icon: Settings },
] as const

export default function AppLayout() {
  const [mobileNav, setMobileNav] = useState(false)
  const [phone, setPhone] = useState<{ open: boolean; number: string; name?: string }>({ open: false, number: '' })
  const loc = useLocation()
  useEffect(() => { setMobileNav(false) }, [loc.pathname])

  return (
    <PhoneContext.Provider value={{ dial: (number, name) => setPhone({ open: true, number, name }) }}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className={clsx('fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-ink-900 text-slate-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0', mobileNav ? 'translate-x-0' : '-translate-x-full')}>
          <div className="flex h-16 items-center justify-between px-5"><Link to="/"><Logo dark /></Link><button className="lg:hidden" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
          <nav className="space-y-0.5 overflow-y-auto px-3 pb-24" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {navItems.map((n, i) => 'section' in n
              ? <div key={i} className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{n.section}</div>
              : <NavLink key={n.to} to={n.to} end={'end' in n} className={({ isActive }) => clsx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-brand-600 text-white' : 'hover:bg-white/5 hover:text-white')}><n.icon size={18} />{n.label}</NavLink>)}
          </nav>
          <div className="absolute inset-x-3 bottom-4 rounded-xl bg-white/5 p-3 text-xs"><div className="flex items-center justify-between text-slate-400"><span>AI minutes</span><span>3,412 / 5,000</span></div><div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-brand-500" /></div></div>
        </aside>
        {mobileNav && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileNav(false)} />}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
            <button className="lg:hidden" onClick={() => setMobileNav(true)}><Menu /></button>
            <div className="relative hidden max-w-md flex-1 sm:block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search contacts, calls, campaigns…" /></div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 md:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> 37 live calls</span>
              <button className="btn-primary" onClick={() => setPhone((p) => ({ ...p, open: !p.open }))}><Phone size={16} /> <span className="hidden sm:inline">Web Phone</span></button>
              <button className="btn-ghost relative p-2"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" /></button>
              <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">DU</span><ChevronDown size={14} className="hidden sm:block" /></button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </div>

        <Softphone state={phone} onClose={() => setPhone((p) => ({ ...p, open: false }))} setNumber={(number) => setPhone((p) => ({ ...p, number, name: undefined }))} />
      </div>
    </PhoneContext.Provider>
  )
}

// ---------------- Web Phone ----------------
function Softphone({ state, onClose, setNumber }: { state: { open: boolean; number: string; name?: string }; onClose: () => void; setNumber: (n: string) => void }) {
  const [status, setStatus] = useState<'idle' | 'ringing' | 'live' | 'ended'>('idle')
  const [secs, setSecs] = useState(0)
  const [muted, setMuted] = useState(false)
  const [held, setHeld] = useState(false)
  const [withAI, setWithAI] = useState(false)

  useEffect(() => { if (status !== 'live') return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t) }, [status])
  useEffect(() => { if (state.open && state.name) setStatus('idle') }, [state.open, state.name, state.number])

  const call = async () => {
    if (!state.number) return
    setStatus('ringing'); setSecs(0)
    await api.startCall(state.number, withAI ? 'a_1' : undefined)
    setTimeout(() => setStatus((s) => (s === 'ringing' ? 'live' : s)), 1800)
  }
  const hang = () => { setStatus('ended'); setTimeout(() => setStatus('idle'), 1200) }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
  if (!state.open) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] overflow-hidden rounded-2xl bg-ink-900 text-white shadow-2xl ring-1 ring-white/10">
      <div className="flex items-center justify-between px-4 py-3 text-sm"><span className="flex items-center gap-2 font-semibold"><Phone size={14} /> Web Phone</span><button onClick={onClose}><X size={16} /></button></div>
      <div className="px-5 pb-5">
        <div className="text-center">
          {state.name && <div className="text-sm text-slate-400">{state.name}</div>}
          <input value={state.number} onChange={(e) => setNumber(e.target.value)} placeholder="Enter number" className="w-full bg-transparent text-center text-2xl font-semibold outline-none placeholder:text-slate-600" />
          <div className="mt-1 h-5 text-xs text-slate-400">
            {status === 'ringing' && 'Ringing… (AMD listening)'}
            {status === 'live' && <span className="inline-flex items-center gap-2 text-emerald-400"><Wave /> {held ? 'On hold' : 'Connected'} · {fmtDur(secs)}</span>}
            {status === 'ended' && 'Call ended'}
          </div>
        </div>
        {status === 'idle' || status === 'ended' ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">{keys.map((k) => <button key={k} onClick={() => setNumber(state.number + k)} className="rounded-xl bg-white/5 py-3 text-lg font-medium hover:bg-white/10">{k}</button>)}</div>
            <label className="mt-3 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs"><span className="flex items-center gap-2"><Grid2x2 size={14} /> Let AI agent (Ava) handle call</span><input type="checkbox" checked={withAI} onChange={(e) => setWithAI(e.target.checked)} /></label>
            <div className="mt-4 flex items-center justify-center gap-6"><span className="w-10" /><button onClick={call} className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 hover:bg-emerald-600"><Phone /></button><button onClick={() => setNumber(state.number.slice(0, -1))} className="w-10 text-slate-400"><Delete /></button></div>
          </>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <button onClick={() => setMuted(!muted)} className={clsx('flex flex-col items-center gap-1 rounded-xl py-3', muted ? 'bg-white text-ink-900' : 'bg-white/5')}>{muted ? <MicOff size={18} /> : <Mic size={18} />}Mute</button>
              <button onClick={() => setHeld(!held)} className={clsx('flex flex-col items-center gap-1 rounded-xl py-3', held ? 'bg-white text-ink-900' : 'bg-white/5')}><Pause size={18} />Hold</button>
              <button className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-3"><PhoneCall size={18} />Transfer</button>
            </div>
            {status === 'live' && <div className="mt-3 max-h-28 space-y-1 overflow-y-auto rounded-lg bg-white/5 p-3 text-xs text-slate-300"><div className="text-[10px] uppercase tracking-wide text-slate-500">Live transcript</div><div><b className="text-brand-300">You:</b> Hi, is this {state.name?.split(' ')[0] ?? 'the homeowner'}?</div>{secs > 3 && <div><b className="text-slate-100">Them:</b> Yes, speaking.</div>}</div>}
            <div className="mt-4 flex justify-center"><button onClick={hang} className="grid h-14 w-14 place-items-center rounded-full bg-rose-500 hover:bg-rose-600"><PhoneOff /></button></div>
          </>
        )}
      </div>
    </div>
  )
}
