import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Bot, CalendarCheck, Check, ChevronDown, FileAudio, Gauge, Headphones, LineChart, MapPin, Menu, MessageSquareText,
  Mic, PhoneCall, PhoneForwarded, PhoneIncoming, ShieldCheck, Sparkles, Upload, Users, Voicemail, Workflow, X,
} from 'lucide-react'
import clsx from 'clsx'
import { Logo, Wave } from '../../components/ui'
import { BRAND } from '../../config/brand'

const nav = [{ label: 'Features', href: '#features' }, { label: 'How it works', href: '#how' }, { label: 'Why us', href: '#why' }, { label: 'Pricing', href: '#pricing' }, { label: 'FAQ', href: '#faq' }]

export default function Landing() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">{nav.map((n) => <a key={n.href} href={n.href} className="hover:text-slate-900">{n.label}</a>)}</nav>
          <div className="hidden items-center gap-2 md:flex"><Link to="/login" className="btn-ghost">Log in</Link><a href="#demo" className="btn-primary">Request a demo</a></div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="space-y-1 border-t border-slate-200 px-6 py-4 md:hidden">{nav.map((n) => <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-2 text-slate-700">{n.label}</a>)}<Link to="/login" className="btn-outline mt-2 w-full">Log in</Link><a href="#demo" className="btn-primary mt-2 w-full">Request a demo</a></div>}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(59,99,246,.45),transparent),radial-gradient(40%_40%_at_10%_90%,rgba(124,58,237,.3),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200"><Sparkles size={14} /> AI voice agents that sound human</span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Get more pre-qualified leads with an <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">AI-powered dialer</span></h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">Upload a list. Our AI agents call, hold natural two-way conversations, qualify prospects, book appointments and warm-transfer hot leads to your team — all logged in a built-in CRM.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/app" className="btn-primary px-6 py-3 text-base">Try it free <ArrowRight size={18} /></Link><a href="#demo" className="btn px-6 py-3 text-base text-white ring-1 ring-white/25 hover:bg-white/10">Request a demo</a></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">{['No credit card', 'Live in 15 minutes', 'STIR/SHAKEN attested'].map((t) => <span key={t} className="flex items-center gap-1.5"><Check size={16} className="text-emerald-400" />{t}</span>)}</div>
          </div>
          <HeroCall />
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="border-b border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">Built for high-volume outbound & inbound teams</p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-3 text-lg font-semibold text-slate-400">{['Solar', 'Insurance', 'Real Estate', 'Healthcare', 'Home Services', 'Mortgage', 'Auto', 'Debt Relief'].map((i) => <span key={i}>{i}</span>)}</div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <SectionTitle eyebrow="How it works" title="From cold list to booked meeting — automatically" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, t: 'Automated dialing', d: 'Upload a CSV or sync your CRM. We pace calls, skip voicemails with AI detection, and only engage when a live human answers.' },
            { icon: MessageSquareText, t: 'Natural conversations', d: "The AI agent doesn't read a rigid script. It listens, responds and adapts in real time — handling questions and objections." },
            { icon: PhoneForwarded, t: 'Targeted transfer', d: 'Qualified prospects are warm-transferred to the right human agent with full context, or booked straight into your calendar.' },
          ].map((s, i) => (
            <div key={s.t} className="card relative p-8">
              <span className="absolute right-6 top-6 text-5xl font-black text-slate-100">0{i + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600"><s.icon /></span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.t}</h3><p className="mt-2 text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle eyebrow="Features" title="Everything your calling floor needs, in one platform" sub="A modern cloud contact center with AI agents, a web phone, and a CRM built in." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Headphones, t: 'Built-in web phone', d: 'HD browser softphone with hold, transfer and conference. No hardware.' },
              { icon: Voicemail, t: 'AI answering-machine detection', d: 'Detect voicemail in the first seconds and auto-drop a message.' },
              { icon: FileAudio, t: 'Real-time transcription', d: 'Live transcripts with speakers, timestamps and sentiment.' },
              { icon: Gauge, t: 'Flexible call pacing', d: 'Predictive, progressive, preview — or fully AI-driven dialing.' },
              { icon: MapPin, t: 'Local presence DIDs', d: 'Match caller ID to the prospect’s area code; rotate and retire numbers.' },
              { icon: ShieldCheck, t: 'Tier-1 routes', d: 'Premium carrier routes with STIR/SHAKEN attestation.' },
              { icon: LineChart, t: 'Advanced analytics', d: 'Agent, campaign, conversion and cost-per-lead dashboards.' },
              { icon: Users, t: 'CRM & lead management', d: 'Pipeline, lead scoring, dispositions, notes — plus HubSpot, Salesforce, Zoho sync.' },
            ].map((f) => (
              <div key={f.t} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white"><f.icon size={20} /></span>
                <h3 className="mt-4 font-semibold text-slate-900">{f.t}</h3><p className="mt-1.5 text-sm text-slate-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEEP DIVE */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <div>
          <SectionTitle left eyebrow="AI agent builder" title="Design an agent in plain English" sub="Write what your agent should do, pick a voice, set qualification rules and transfer conditions. Test it in the browser before it calls a single lead." />
          <ul className="mt-8 space-y-3">{['Human-like voices in 30+ languages', 'Knowledge base & FAQ answering', 'Books into Google Calendar / Calendly', 'Warm transfer with a whisper summary', 'Do-not-call & consent handling built in'].map((t) => <li key={t} className="flex items-center gap-3 text-slate-700"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Check size={14} /></span>{t}</li>)}</ul>
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"><Bot size={16} className="text-brand-600" /> Agent: Ava — Solar qualifier</div>
          <div className="space-y-4 p-5 text-sm">
            <div><div className="label">Instructions</div><div className="rounded-lg bg-slate-50 p-3 text-slate-700">Confirm homeowner, ask monthly bill and roof age. If bill &gt; $120, offer a free assessment or transfer to a specialist. Never be pushy.</div></div>
            <div className="grid grid-cols-2 gap-3"><div><div className="label">Voice</div><div className="rounded-lg border border-slate-200 p-2.5">Ava — Warm US Female</div></div><div><div className="label">On qualified</div><div className="rounded-lg border border-slate-200 p-2.5">Transfer + book</div></div></div>
            <div className="flex items-center justify-between rounded-lg bg-brand-50 p-3 text-brand-800"><span className="flex items-center gap-2"><Mic size={16} /> Test call in browser</span><Wave /></div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="bg-ink-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle dark eyebrow={`Why ${BRAND.name}`} title="Make customer experience your competitive advantage" />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Bot, t: 'AI bots', d: 'Answer common inquiries automatically, 24/7, on every line.' },
              { icon: FileAudio, t: 'Soundboard', d: 'Agents trigger pre-recorded or TTS clips for consistent, clear messaging.' },
              { icon: CalendarCheck, t: 'Appointment bot', d: 'Books meetings on inbound and outbound calls around the clock.' },
              { icon: PhoneCall, t: 'NLP AI dialer', d: 'Human-like conversations that qualify and hand off ready buyers.' },
            ].map((f) => <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-6"><f.icon className="text-brand-300" /><h3 className="mt-4 font-semibold">{f.t}</h3><p className="mt-2 text-sm text-slate-300">{f.d}</p></div>)}
          </div>
          <div className="mt-16 grid gap-8 text-center sm:grid-cols-4">{[['3x', 'more conversations per rep'], ['98%', 'target AMD accuracy'], ['< 1s', 'AI response latency goal'], ['24/7', 'inbound coverage']].map(([n, l]) => <div key={l}><div className="text-4xl font-extrabold text-brand-300">{n}</div><div className="mt-1 text-sm text-slate-400">{l}</div></div>)}</div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <SectionTitle eyebrow="Pricing" title="Simple plans that scale with your floor" sub="Example tiers — set your own pricing before launch." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            { n: 'Starter', p: '$49', u: '/seat/mo', f: ['Web phone & power dialer', 'Built-in CRM', '1 AI agent', '1,000 AI minutes', 'Email support'] },
            { n: 'Growth', p: '$129', u: '/seat/mo', hot: true, f: ['Predictive & AI dialing', '5 AI agents', '5,000 AI minutes', 'Local presence DIDs', 'HubSpot / Salesforce / Zoho', 'Real-time transcription'] },
            { n: 'Enterprise', p: 'Custom', u: '', f: ['Unlimited AI agents', 'Volume minute pricing', 'Dedicated Tier-1 routes', 'SSO & audit logs', 'Dedicated success manager'] },
          ].map((t) => (
            <div key={t.n} className={clsx('card flex flex-col p-8', t.hot && 'relative border-brand-600 ring-2 ring-brand-600')}>
              {t.hot && <span className="absolute -top-3 left-8 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
              <h3 className="font-semibold text-slate-900">{t.n}</h3>
              <div className="mt-4"><span className="text-4xl font-extrabold text-slate-900">{t.p}</span><span className="text-slate-500">{t.u}</span></div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">{t.f.map((x) => <li key={x} className="flex gap-2 text-slate-700"><Check size={18} className="shrink-0 text-brand-600" />{x}</li>)}</ul>
              <a href="#demo" className={clsx('mt-8', t.hot ? 'btn-primary' : 'btn-outline')}>{t.p === 'Custom' ? 'Talk to sales' : 'Start free trial'}</a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionTitle eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10 space-y-3">{faqs.map((f) => <Faq key={f.q} {...f} />)}</div>
        </div>
      </section>

      {/* CTA + DEMO FORM */}
      <section id="demo" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-violet-700 text-white lg:grid-cols-2">
          <div className="p-10 lg:p-14">
            <Workflow size={36} className="text-brand-200" />
            <h2 className="mt-6 text-3xl font-bold">Connect agents, customers and software — together in {BRAND.name}</h2>
            <p className="mt-4 text-brand-100">Book a 20-minute strategy call. We’ll build a live AI agent for your use case on the call.</p>
            <div className="mt-8 space-y-2 text-sm text-brand-100"><div>📞 {BRAND.phone}</div><div>✉️ {BRAND.email}</div></div>
          </div>
          <DemoForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
          <div className="md:col-span-2"><Logo /><p className="mt-4 max-w-sm text-sm text-slate-500">AI calling agents and a cloud contact center with a built-in CRM. Qualify more leads with fewer reps.</p></div>
          <div><h4 className="text-sm font-semibold text-slate-900">Product</h4><ul className="mt-3 space-y-2 text-sm text-slate-500"><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><Link to="/app">Dashboard</Link></li></ul></div>
          <div><h4 className="text-sm font-semibold text-slate-900">Company</h4><ul className="mt-3 space-y-2 text-sm text-slate-500"><li>About</li><li>Contact</li><li>Privacy Policy</li><li>Terms</li><li>Acceptable Use</li></ul></div>
        </div>
        <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
      </footer>
    </div>
  )
}

function SectionTitle({ eyebrow, title, sub, dark, left }: { eyebrow: string; title: string; sub?: string; dark?: boolean; left?: boolean }) {
  return (
    <div className={clsx(!left && 'mx-auto max-w-2xl text-center')}>
      <p className={clsx('text-sm font-semibold uppercase tracking-widest', dark ? 'text-brand-300' : 'text-brand-600')}>{eyebrow}</p>
      <h2 className={clsx('mt-3 text-3xl font-bold tracking-tight sm:text-4xl', dark ? 'text-white' : 'text-slate-900')}>{title}</h2>
      {sub && <p className={clsx('mt-4 text-lg', dark ? 'text-slate-300' : 'text-slate-600')}>{sub}</p>}
    </div>
  )
}

function HeroCall() {
  const lines = [
    { s: 'ai', t: 'Hi, this is Ava from Northwind Solar — is this Jordan?' },
    { s: 'c', t: "Yeah, that's me." },
    { s: 'ai', t: 'Quick one — roughly what’s your electric bill in summer?' },
    { s: 'c', t: 'Close to $200 in July, honestly.' },
    { s: 'ai', t: 'You likely qualify. Want a free assessment Thursday at 4?' },
  ]
  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-emerald-500"><span className="absolute inset-0 animate-pulseRing rounded-full bg-emerald-400" /><PhoneIncoming size={18} className="relative" /></span>
            <div><div className="font-semibold">Jordan Miller</div><div className="text-xs text-slate-400">+1 (512) 555-0187 · Austin, TX</div></div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300"><Wave /> Live 01:12</div>
        </div>
        <div className="mt-5 space-y-2.5">{lines.map((l, i) => <div key={i} className={clsx('max-w-[85%] rounded-2xl px-4 py-2 text-sm', l.s === 'ai' ? 'bg-brand-600/90' : 'ml-auto bg-white/10')}>{l.t}</div>)}</div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-white/5 p-2"><div className="text-slate-400">Sentiment</div><div className="font-semibold text-emerald-300">Positive</div></div>
          <div className="rounded-lg bg-white/5 p-2"><div className="text-slate-400">Lead score</div><div className="font-semibold">87 / 100</div></div>
          <div className="rounded-lg bg-white/5 p-2"><div className="text-slate-400">Next step</div><div className="font-semibold text-brand-200">Book</div></div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-white p-4 text-slate-800 shadow-xl sm:block"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck size={18} className="text-emerald-600" /> Appointment booked</div><div className="text-xs text-slate-500">Thu 4:00 PM · synced to CRM</div></div>
    </div>
  )
}

const faqs = [
  { q: 'Does the AI sound robotic?', a: 'No — agents use natural neural voices and a large language model, so they respond to what the prospect actually says instead of reading a script.' },
  { q: 'Can the AI transfer to my human agents?', a: 'Yes. Define transfer rules (e.g. “qualified and agrees to talk”). The AI warm-transfers and passes a summary so your rep never asks the same questions twice.' },
  { q: 'Is this compliant with TCPA / DNC rules?', a: 'The platform supports DNC lists, calling-hour windows by time zone, consent fields and opt-out handling. You remain responsible for your own compliance — consult your counsel.' },
  { q: 'Can I use my existing CRM?', a: 'Use the built-in CRM, or sync contacts and dispositions with HubSpot, Salesforce and Zoho. Webhooks and Zapier cover everything else.' },
  { q: 'Do I need new phone hardware?', a: 'No. Agents use the browser web phone. You can buy local numbers in-app or bring your own carrier via SIP.' },
]
function Faq({ q, a }: { q: string; a: string }) {
  const [o, setO] = useState(false)
  return <div className="card"><button onClick={() => setO(!o)} className="flex w-full items-center justify-between p-5 text-left font-medium text-slate-900">{q}<ChevronDown className={clsx('transition', o && 'rotate-180')} size={18} /></button>{o && <p className="px-5 pb-5 text-slate-600">{a}</p>}</div>
}

function DemoForm() {
  const [sent, setSent] = useState(false)
  if (sent) return <div className="grid place-items-center bg-white p-10 text-center text-slate-800"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Check /></div><h3 className="mt-4 text-xl font-semibold">Thanks — we’ll be in touch!</h3><p className="mt-1 text-slate-500">Expect a call from our team within one business day.</p></div></div>
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4 bg-white p-10 text-slate-800 lg:p-14">
      <h3 className="text-xl font-semibold">Book your strategy call</h3>
      <div className="grid gap-4 sm:grid-cols-2"><input required className="input" placeholder="Full name" /><input required type="email" className="input" placeholder="Work email" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><input className="input" placeholder="Phone" /><input className="input" placeholder="Company" /></div>
      <select className="input" defaultValue=""><option value="" disabled>Team size</option><option>1–14</option><option>15–49</option><option>50–250</option><option>250+</option></select>
      <textarea className="input" rows={3} placeholder="What would you like your AI agent to do?" />
      <button className="btn-primary w-full py-3">Book my call <ArrowRight size={16} /></button>
    </form>
  )
}
