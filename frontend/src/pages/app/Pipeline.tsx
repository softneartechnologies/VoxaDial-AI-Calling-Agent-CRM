import { useState } from 'react'
import clsx from 'clsx'
import { api } from '../../api/client'
import type { Contact, LeadStatus } from '../../api/types'
import { Avatar, PageHeader, Spinner, fmtMoney, useAsync } from '../../components/ui'
import { ContactDrawer, STATUSES, ScoreBar } from './Contacts'

const colColor: Record<LeadStatus, string> = { new: 'bg-slate-400', contacted: 'bg-brand-500', qualified: 'bg-violet-500', appointment: 'bg-amber-500', won: 'bg-emerald-500', lost: 'bg-rose-500' }

export default function Pipeline() {
  const { data, setData } = useAsync(api.contacts)
  const [drag, setDrag] = useState<string | null>(null)
  const [over, setOver] = useState<LeadStatus | null>(null)
  const [sel, setSel] = useState<Contact | null>(null)
  if (!data) return <Spinner />
  const move = async (id: string, status: LeadStatus) => { setData(data.map((c) => (c.id === id ? { ...c, status } : c))); await api.updateContact(id, { status }) }
  return (
    <>
      <PageHeader title="Pipeline" subtitle="Drag leads between stages. AI agents move them automatically after each call." />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((s) => {
          const items = data.filter((c) => c.status === s)
          return (
            <div key={s} onDragOver={(e) => { e.preventDefault(); setOver(s) }} onDragLeave={() => setOver(null)} onDrop={() => { if (drag) move(drag, s); setDrag(null); setOver(null) }} className={clsx('flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/70 p-3 transition', over === s && 'ring-2 ring-brand-400')}>
              <div className="mb-3 flex items-center justify-between px-1"><span className="flex items-center gap-2 text-sm font-semibold capitalize text-slate-800"><span className={`h-2.5 w-2.5 rounded-full ${colColor[s]}`} />{s} <span className="text-slate-400">{items.length}</span></span><span className="text-xs text-slate-500">{fmtMoney(items.reduce((t, c) => t + c.value, 0))}</span></div>
              <div className="min-h-[200px] flex-1 space-y-2">
                {items.map((c) => (
                  <div key={c.id} draggable onDragStart={() => setDrag(c.id)} onClick={() => setSel(c)} className={clsx('card cursor-grab p-3 active:cursor-grabbing', drag === c.id && 'opacity-50')}>
                    <div className="flex items-center gap-2"><Avatar name={c.name} size="sm" /><div className="min-w-0"><div className="truncate text-sm font-medium text-slate-900">{c.name}</div><div className="truncate text-xs text-slate-500">{c.company}</div></div></div>
                    <div className="mt-3 flex items-center justify-between"><ScoreBar v={c.score} /><span className="text-xs font-semibold text-slate-700">{fmtMoney(c.value)}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <ContactDrawer contact={sel} onClose={() => setSel(null)} onChange={(c) => { setSel(c); setData(data.map((x) => (x.id === c.id ? c : x))) }} />
    </>
  )
}
