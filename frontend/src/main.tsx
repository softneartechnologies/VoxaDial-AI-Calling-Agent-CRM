import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import Landing from './pages/site/Landing'
import Login from './pages/site/Login'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/app/Dashboard'
import LiveMonitor from './pages/app/LiveMonitor'
import { AgentEditor, AgentsList } from './pages/app/Agents'
import Campaigns from './pages/app/Campaigns'
import Contacts from './pages/app/Contacts'
import Pipeline from './pages/app/Pipeline'
import Calls from './pages/app/Calls'
import Analytics from './pages/app/Analytics'
import { Integrations, Numbers, SettingsPage } from './pages/app/Setup'

// HashRouter works on any static host (and in previews). Swap to BrowserRouter if your host supports SPA rewrites.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="live" element={<LiveMonitor />} />
          <Route path="agents" element={<AgentsList />} />
          <Route path="agents/:id" element={<AgentEditor />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="calls" element={<Calls />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="numbers" element={<Numbers />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
