import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { BRAND } from '../config/brand'

// ---------- hooks ----------
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const reload = useCallback(() => {
    setLoading(true)
    fn().then(setData).catch((e) => setError(String(e))).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(reload, [reload])
  return { data, loading, error, reload, setData }
}

// ---------- formatters ----------
export const fmtNum = (n: number) => n.toLocaleString('en-US')
export const fmtMoney = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
export const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
export const fmtAgo = (iso?: string) => {
  if (!iso) return '—'
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 6e4)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.round(m / 60)}h ago`
  return `${Math.round(m / 1440)}d ago`
}
export const initials = (n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

// ---------- brand ----------
export function Logo({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  return (
    <span className={clsx('flex items-center gap-2 font-bold tracking-tight', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600">
        <svg viewBox="0 0 32 32" className="h-5 w-5"><path d="M7 16h2M12 11v10M16 7v18M20 11v10M24 15v2" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
      </span>
      <span className={dark ? 'text-white' : 'text-slate-900'}>{BRAND.name}</span>
    </span>
  )
}

// ---------- display ----------
const tones: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', blue: 'bg-brand-50 text-brand-700 ring-brand-600/20', amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20', slate: 'bg-slate-100 text-slate-700 ring-slate-500/20', violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
}
export function Badge({ tone = 'slate', children }: { tone?: keyof typeof tones | string; children: ReactNode }) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone] ?? tones.slate)}>{children}</span>
}
export const statusTone: Record<string, string> = {
  new: 'slate', contacted: 'blue', qualified: 'violet', appointment: 'amber', won: 'green', lost: 'red',
  running: 'green', paused: 'amber', scheduled: 'blue', completed: 'slate', draft: 'slate', active: 'green', cooling: 'amber', flagged: 'red',
  transferred: 'green', voicemail: 'slate', 'no-answer': 'slate', 'not-interested': 'red', callback: 'blue',
  positive: 'green', neutral: 'slate', negative: 'red',
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const hue = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 360
  return <span className={clsx('grid shrink-0 place-items-center rounded-full font-semibold text-white', size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-sm')} style={{ background: `hsl(${hue} 55% 50%)` }}>{initials(name)}</span>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-slate-900">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, delta, icon }: { label: string; value: ReactNode; delta?: number; icon?: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span>{icon && <span className="text-brand-600">{icon}</span>}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {delta !== undefined && <div className={clsx('mt-1 text-xs font-medium', delta >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs yesterday</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-[8vh]" onClick={onClose}>
      <div className={clsx('card w-full p-6', wide ? 'max-w-3xl' : 'max-w-lg')} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{title}</h2><button className="btn-ghost p-1" onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div className={clsx('fixed inset-0 z-40', !open && 'pointer-events-none')}>
      <div className={clsx('absolute inset-0 bg-slate-900/30 transition', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <aside className={clsx('absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform', open ? 'translate-x-0' : 'translate-x-full')}>{children}</aside>
    </div>
  )
}

export function Spinner() { return <div className="flex h-40 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div> }

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!on)} className={clsx('relative h-6 w-11 rounded-full transition', on ? 'bg-brand-600' : 'bg-slate-300')}><span className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', on ? 'left-[22px]' : 'left-0.5')} /></button>
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return <div className="mb-4 flex gap-1 border-b border-slate-200">{tabs.map((t) => <button key={t.id} onClick={() => onChange(t.id)} className={clsx('-mb-px border-b-2 px-4 py-2 text-sm font-medium', value === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800')}>{t.label}</button>)}</div>
}

export function Wave({ active = true }: { active?: boolean }) {
  return <span className="flex h-4 items-center gap-0.5">{[0, 1, 2, 3, 4].map((i) => <span key={i} className={clsx('w-0.5 rounded bg-current', active ? 'h-4 origin-center animate-wave' : 'h-1')} style={{ animationDelay: `${i * 0.12}s` }} />)}</span>
}

export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="label">{label}</span>{children}</label> }
