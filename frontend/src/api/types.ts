// Shared domain models. The backend should return these exact shapes.

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'appointment' | 'won' | 'lost'
export type CallOutcome = 'qualified' | 'transferred' | 'appointment' | 'voicemail' | 'no-answer' | 'not-interested' | 'callback'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type DialMode = 'predictive' | 'progressive' | 'preview' | 'ai-agent'

export interface Contact {
  id: string
  name: string
  phone: string
  email: string
  company: string
  title: string
  city: string
  status: LeadStatus
  score: number // 0-100 lead score
  tags: string[]
  owner: string
  source: string
  value: number // deal value (USD)
  lastContacted?: string // ISO
  createdAt: string
}

export interface TranscriptLine { speaker: 'ai' | 'agent' | 'customer'; text: string; at: number /* seconds */ }

export interface Call {
  id: string
  contactId: string
  contactName: string
  phone: string
  direction: 'outbound' | 'inbound'
  agentId?: string // AI agent id
  agentName: string
  campaignId?: string
  campaignName?: string
  startedAt: string
  durationSec: number
  outcome: CallOutcome
  sentiment: Sentiment
  amd: 'human' | 'machine'
  summary: string
  transcript: TranscriptLine[]
  recordingUrl?: string
  cost: number
}

export interface AIAgent {
  id: string
  name: string
  role: string
  status: 'active' | 'paused' | 'draft'
  voice: string
  language: string
  model: string
  greeting: string
  prompt: string
  goals: string[]
  transferNumber?: string
  transferRules: string
  bookAppointments: boolean
  maxCallMinutes: number
  callsToday: number
  successRate: number
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  status: 'running' | 'paused' | 'scheduled' | 'completed' | 'draft'
  mode: DialMode
  agentId?: string
  agentName: string
  totalLeads: number
  dialed: number
  connected: number
  qualified: number
  appointments: number
  callerIdStrategy: 'local-presence' | 'fixed'
  schedule: { days: string[]; start: string; end: string; timezone: string }
  maxAttempts: number
  linesPerAgent: number
  createdAt: string
}

export interface PhoneNumber {
  id: string
  number: string
  areaCode: string
  region: string
  type: 'local' | 'toll-free'
  status: 'active' | 'cooling' | 'flagged'
  attestation: 'A' | 'B' | 'C'
  answerRate: number
  callsToday: number
  assignedTo?: string
}

export interface Activity { id: string; contactId: string; type: 'call' | 'email' | 'note' | 'sms' | 'status'; text: string; at: string; by: string }

export interface DashboardStats {
  callsToday: number
  connectRate: number
  qualifiedLeads: number
  appointments: number
  avgHandleSec: number
  costPerLead: number
  activeCalls: number
  pipelineValue: number
  hourly: { hour: string; calls: number; connected: number; qualified: number }[]
  outcomes: { name: string; value: number }[]
  weekly: { day: string; calls: number; qualified: number; appointments: number }[]
}

export interface Integration { id: string; name: string; category: string; description: string; connected: boolean; color: string }

export interface LiveCall { id: string; contactName: string; phone: string; agentName: string; campaignName: string; startedSecAgo: number; stage: string; sentiment: Sentiment }
