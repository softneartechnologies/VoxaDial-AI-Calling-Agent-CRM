import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Logo } from '../../components/ui'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('demo@company.com')
  const [password, setPassword] = useState('demo1234')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true)
    const { token } = await api.login(email, password)
    try { localStorage.setItem('token', token) } catch { /* preview sandbox */ }
    nav('/app')
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 sm:px-16">
        <Link to="/"><Logo /></Link>
        <h1 className="mt-10 text-3xl font-bold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-2 text-slate-500">{mode === 'login' ? 'Log in to your calling workspace.' : 'Start your free trial — no card required.'}</p>
        <form onSubmit={submit} className="mt-8 max-w-sm space-y-4">
          {mode === 'signup' && <input className="input" placeholder="Company name" required />}
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? 'Signing in…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
          <p className="text-center text-sm text-slate-500">{mode === 'login' ? 'New here?' : 'Have an account?'} <button type="button" className="font-semibold text-brand-600" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Start free trial' : 'Log in'}</button></p>
        </form>
      </div>
      <div className="hidden items-center justify-center bg-ink-900 p-16 text-white lg:flex">
        <div className="max-w-md"><p className="text-2xl font-semibold leading-snug">“Your AI agents qualify leads around the clock, and your reps only talk to people ready to buy.”</p><p className="mt-4 text-sm text-slate-400">— What this product is built to do</p></div>
      </div>
    </div>
  )
}
