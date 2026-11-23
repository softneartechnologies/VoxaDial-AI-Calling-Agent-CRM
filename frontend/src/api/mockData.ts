// Deterministic demo data. Delete this file once the backend is live.
import type { AIAgent, Activity, Call, CallOutcome, Campaign, Contact, Integration, LeadStatus, PhoneNumber, Sentiment } from './types'

let seed = 42
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)]
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min
const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString()

const first = ['Aarav', 'Priya', 'James', 'Sofia', 'Liam', 'Ananya', 'Noah', 'Emma', 'Rohan', 'Olivia', 'Arjun', 'Mia', 'Ethan', 'Isha', 'Lucas', 'Kavya', 'Mason', 'Ava', 'Vikram', 'Chloe', 'Daniel', 'Meera', 'Ryan', 'Zara']
const last = ['Sharma', 'Patel', 'Carter', 'Nguyen', 'Brooks', 'Reddy', 'Miller', 'Iyer', 'Lopez', 'Kapoor', 'Hughes', 'Mehta', 'Turner', 'Rao', 'Bennett', 'Gupta']
const companies = ['Northwind Solar', 'Brightpath Insurance', 'Summit Realty', 'Apex Dental Group', 'BlueOak Mortgage', 'Crestline Auto', 'Harbor Health', 'Pinecone Roofing', 'Lumen Fitness', 'Keystone Legal', 'Atlas Logistics', 'Verde Home Services']
const titles = ['Owner', 'Operations Manager', 'Marketing Director', 'Homeowner', 'Practice Manager', 'VP Sales', 'Office Manager', 'Founder']
const cities = ['Austin, TX', 'Phoenix, AZ', 'Miami, FL', 'Denver, CO', 'Atlanta, GA', 'Seattle, WA', 'Chicago, IL', 'Dallas, TX', 'Tampa, FL', 'San Diego, CA']
const statuses: LeadStatus[] = ['new', 'new', 'contacted', 'contacted', 'qualified', 'appointment', 'won', 'lost']
const sources = ['CSV Import', 'Web Form', 'Facebook Ads', 'HubSpot Sync', 'Inbound Call', 'Referral']
const owners = ['You', 'Neha K.', 'Marcus D.', 'Ava (AI)']
const tagPool = ['hot', 'solar', 'insurance', 'callback', 'decision-maker', 'budget-ok', 'spanish', 'follow-up']
const phone = () => `+1 (${int(201, 989)}) ${int(200, 999)}-${String(int(0, 9999)).padStart(4, '0')}`

export const contacts: Contact[] = Array.from({ length: 48 }, (_, i) => {
  const f = pick(first), l = pick(last)
  const status = pick(statuses)
  return {
    id: `c_${1000 + i}`,
    name: `${f} ${l}`,
    phone: phone(),
    email: `${f}.${l}@example.com`.toLowerCase(),
    company: pick(companies),
    title: pick(titles),
    city: pick(cities),
    status,
    score: status === 'won' ? int(85, 99) : status === 'lost' ? int(5, 30) : int(25, 95),
    tags: Array.from(new Set([pick(tagPool), pick(tagPool)])).slice(0, int(1, 2)),
    owner: pick(owners),
    source: pick(sources),
    value: int(5, 120) * 100,
    lastContacted: status === 'new' ? undefined : daysAgo(int(0, 12), int(0, 20)),
    createdAt: daysAgo(int(5, 60)),
  }
})

export const agents: AIAgent[] = [
  {
    id: 'a_1', name: 'Ava', role: 'Outbound lead qualifier', status: 'active', voice: 'Ava — Warm US Female', language: 'English (US)', model: 'GPT-class LLM (configurable)',
    greeting: "Hi, this is Ava calling from Northwind Solar — is this {{first_name}}?",
    prompt: 'You are Ava, a friendly solar consultant. Confirm the person is the homeowner, ask about their average monthly electric bill, roof age and shade, and whether they plan to stay in the home 5+ years. If they qualify (bill > $120, homeowner), offer to transfer to a specialist or book a free assessment. Never be pushy. If they ask to be removed, apologize and mark DNC.',
    goals: ['Confirm homeowner', 'Bill above $120', 'Book assessment or transfer'], transferNumber: '+1 (512) 555-0142', transferRules: 'Transfer when qualified AND caller agrees to speak to a specialist.',
    bookAppointments: true, maxCallMinutes: 8, callsToday: 1284, successRate: 18.4, updatedAt: daysAgo(1),
  },
  {
    id: 'a_2', name: 'Leo', role: 'Insurance renewals', status: 'active', voice: 'Leo — Calm US Male', language: 'English (US)', model: 'GPT-class LLM (configurable)',
    greeting: 'Hello {{first_name}}, this is Leo from Brightpath Insurance about your upcoming policy renewal.',
    prompt: 'Remind the customer about their renewal date, confirm contact details, and ask if they want a quote review. Transfer to a licensed agent for any quote questions.',
    goals: ['Confirm renewal intent', 'Transfer for quote'], transferNumber: '+1 (305) 555-0199', transferRules: 'Transfer on any pricing question.',
    bookAppointments: false, maxCallMinutes: 6, callsToday: 642, successRate: 24.1, updatedAt: daysAgo(3),
  },
  {
    id: 'a_3', name: 'Maya', role: 'Inbound receptionist & booking', status: 'active', voice: 'Maya — Bright Female', language: 'English + Spanish', model: 'GPT-class LLM (configurable)',
    greeting: 'Thanks for calling Apex Dental, this is Maya. How can I help you today?',
    prompt: 'Answer common questions (hours, insurance accepted, location), and book appointments into the calendar. Escalate emergencies to the front desk immediately.',
    goals: ['Answer FAQs', 'Book appointment'], transferNumber: '+1 (602) 555-0110', transferRules: 'Transfer emergencies and billing disputes.',
    bookAppointments: true, maxCallMinutes: 10, callsToday: 213, successRate: 41.7, updatedAt: daysAgo(0, 5),
  },
  {
    id: 'a_4', name: 'Kai', role: 'Real estate seller outreach', status: 'paused', voice: 'Kai — Friendly Male', language: 'English (US)', model: 'GPT-class LLM (configurable)',
    greeting: "Hi {{first_name}}, I'm Kai with Summit Realty — quick question about your property on {{street}}.",
    prompt: 'Ask whether the owner would consider selling in the next 6–12 months, their price expectations and timeline. Book a call with an agent if interested.',
    goals: ['Gauge seller intent', 'Book agent call'], transferRules: 'No live transfers; book only.', bookAppointments: true, maxCallMinutes: 5, callsToday: 0, successRate: 9.8, updatedAt: daysAgo(9),
  },
]

export const campaigns: Campaign[] = [
  { id: 'cp_1', name: 'Solar Q4 — Texas Homeowners', status: 'running', mode: 'ai-agent', agentId: 'a_1', agentName: 'Ava', totalLeads: 12500, dialed: 8420, connected: 2391, qualified: 447, appointments: 182, callerIdStrategy: 'local-presence', schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], start: '09:00', end: '19:00', timezone: 'America/Chicago' }, maxAttempts: 3, linesPerAgent: 3, createdAt: daysAgo(14) },
  { id: 'cp_2', name: 'Insurance Renewals — Nov', status: 'running', mode: 'ai-agent', agentId: 'a_2', agentName: 'Leo', totalLeads: 4200, dialed: 3011, connected: 1187, qualified: 286, appointments: 0, callerIdStrategy: 'local-presence', schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '10:00', end: '18:00', timezone: 'America/New_York' }, maxAttempts: 4, linesPerAgent: 2, createdAt: daysAgo(20) },
  { id: 'cp_3', name: 'Dental Reactivation', status: 'paused', mode: 'progressive', agentName: 'Human team', totalLeads: 1800, dialed: 960, connected: 402, qualified: 120, appointments: 88, callerIdStrategy: 'fixed', schedule: { days: ['Mon', 'Wed', 'Fri'], start: '09:00', end: '17:00', timezone: 'America/Phoenix' }, maxAttempts: 2, linesPerAgent: 1, createdAt: daysAgo(30) },
  { id: 'cp_4', name: 'Seller Leads — Denver', status: 'scheduled', mode: 'ai-agent', agentId: 'a_4', agentName: 'Kai', totalLeads: 3000, dialed: 0, connected: 0, qualified: 0, appointments: 0, callerIdStrategy: 'local-presence', schedule: { days: ['Tue', 'Thu', 'Sat'], start: '11:00', end: '19:00', timezone: 'America/Denver' }, maxAttempts: 3, linesPerAgent: 3, createdAt: daysAgo(2) },
  { id: 'cp_5', name: 'Webinar Follow-up', status: 'completed', mode: 'predictive', agentName: 'Human team', totalLeads: 900, dialed: 900, connected: 377, qualified: 64, appointments: 41, callerIdStrategy: 'fixed', schedule: { days: ['Mon', 'Tue'], start: '09:00', end: '17:00', timezone: 'America/Los_Angeles' }, maxAttempts: 2, linesPerAgent: 3, createdAt: daysAgo(45) },
]

const outcomes: CallOutcome[] = ['qualified', 'transferred', 'appointment', 'voicemail', 'voicemail', 'no-answer', 'not-interested', 'callback', 'not-interested']
const summaries: Record<CallOutcome, string> = {
  qualified: 'Homeowner, bill ~$180/mo, roof 6 yrs old. Interested in savings estimate. Marked qualified.',
  transferred: 'Qualified on all criteria and agreed to talk to a specialist. Warm-transferred with context.',
  appointment: 'Booked free in-home assessment for Thursday 4:00 PM. Confirmation SMS sent.',
  voicemail: 'AI AMD detected answering machine in 2.1s. Dropped pre-recorded voicemail.',
  'no-answer': 'No answer after 6 rings. Scheduled retry per campaign rules.',
  'not-interested': 'Not interested at this time. Politely ended the call; no further attempts.',
  callback: 'Asked to be called back tomorrow after 5 PM. Callback scheduled.',
}
const transcriptFor = (name: string, o: CallOutcome) => {
  const fn = name.split(' ')[0]
  const base = [
    { speaker: 'ai' as const, text: `Hi, this is Ava calling from Northwind Solar — is this ${fn}?`, at: 0 },
    { speaker: 'customer' as const, text: 'Yeah, speaking. What is this about?', at: 4 },
    { speaker: 'ai' as const, text: "Thanks! We're helping homeowners in your area lower their electric bills with solar. Do you own your home?", at: 7 },
    { speaker: 'customer' as const, text: "I do, yeah. We've been here about eight years.", at: 13 },
    { speaker: 'ai' as const, text: 'Great. Roughly what does your monthly electric bill run in the summer?', at: 17 },
    { speaker: 'customer' as const, text: 'Ugh, close to two hundred bucks in July.', at: 22 },
  ]
  if (o === 'not-interested') return [...base.slice(0, 2), { speaker: 'customer' as const, text: "Sorry, I'm not interested.", at: 6 }, { speaker: 'ai' as const, text: 'No problem at all — thanks for your time, have a great day!', at: 9 }]
  if (o === 'appointment') return [...base, { speaker: 'ai' as const, text: 'You could likely save quite a bit. Would a free 30-minute assessment this Thursday at 4 PM work?', at: 27 }, { speaker: 'customer' as const, text: 'Thursday at four works.', at: 33 }, { speaker: 'ai' as const, text: "Perfect, you're booked. I'll text you a confirmation now.", at: 36 }]
  if (o === 'transferred') return [...base, { speaker: 'ai' as const, text: 'Would you like to speak with one of our specialists right now? It takes about 5 minutes.', at: 27 }, { speaker: 'customer' as const, text: 'Sure, go ahead.', at: 31 }, { speaker: 'ai' as const, text: 'Connecting you now — I’ve shared your details so you won’t need to repeat anything.', at: 33 }, { speaker: 'agent' as const, text: `Hi ${fn}, this is Marcus. I see your bill is around $200 — let’s look at options.`, at: 40 }]
  return base
}

const _calls: Call[] = Array.from({ length: 60 }, (_, i) => {
  const c = contacts[i % contacts.length]
  const o = pick(outcomes)
  const a = pick(agents.slice(0, 3))
  const cp = pick(campaigns.slice(0, 3))
  const sentiment: Sentiment = ['qualified', 'transferred', 'appointment'].includes(o) ? 'positive' : o === 'not-interested' ? 'negative' : 'neutral'
  const dur = o === 'voicemail' ? int(8, 30) : o === 'no-answer' ? 0 : int(35, 420)
  return {
    id: `call_${5000 + i}`, contactId: c.id, contactName: c.name, phone: c.phone, direction: rnd() > 0.85 ? 'inbound' : 'outbound',
    agentId: a.id, agentName: a.name, campaignId: cp.id, campaignName: cp.name, startedAt: daysAgo(Math.floor(i / 12), int(0, 10)),
    durationSec: dur, outcome: o, sentiment, amd: o === 'voicemail' ? 'machine' : 'human', summary: summaries[o],
    transcript: ['voicemail', 'no-answer'].includes(o) ? [] : transcriptFor(c.name, o), cost: +(dur / 60 * 0.09).toFixed(2),
  }
})

export const numbers: PhoneNumber[] = Array.from({ length: 14 }, (_, i) => {
  const ac = pick(['512', '214', '713', '305', '813', '602', '303', '404', '206', '312'])
  const region: Record<string, string> = { '512': 'Austin, TX', '214': 'Dallas, TX', '713': 'Houston, TX', '305': 'Miami, FL', '813': 'Tampa, FL', '602': 'Phoenix, AZ', '303': 'Denver, CO', '404': 'Atlanta, GA', '206': 'Seattle, WA', '312': 'Chicago, IL' }
  const ar = int(18, 46)
  return { id: `n_${i}`, number: `+1 (${ac}) ${int(200, 999)}-${String(int(0, 9999)).padStart(4, '0')}`, areaCode: ac, region: region[ac], type: i === 13 ? 'toll-free' : 'local', status: ar < 22 ? 'flagged' : ar < 26 ? 'cooling' : 'active', attestation: ar < 22 ? 'B' : 'A', answerRate: ar, callsToday: int(20, 240), assignedTo: pick(['Solar Q4 — Texas Homeowners', 'Insurance Renewals — Nov', undefined]) }
})

export const activities: Activity[] = contacts.slice(0, 20).flatMap((c, i) => [
  { id: `act_${i}_1`, contactId: c.id, type: 'call' as const, text: 'AI call — qualified, bill ~$180/mo', at: daysAgo(1, i), by: 'Ava (AI)' },
  { id: `act_${i}_2`, contactId: c.id, type: 'sms' as const, text: 'Sent appointment confirmation SMS', at: daysAgo(1, i + 1), by: 'System' },
  { id: `act_${i}_3`, contactId: c.id, type: 'note' as const, text: 'Prefers calls after 5 PM. Spouse is co-decision maker.', at: daysAgo(3, i), by: 'Neha K.' },
])

export const integrations: Integration[] = [
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', description: 'Two-way sync of leads, contacts and call dispositions.', connected: false, color: '#00A1E0' },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', description: 'Push calls, transcripts and lifecycle stages to HubSpot.', connected: true, color: '#FF7A59' },
  { id: 'zoho', name: 'Zoho CRM', category: 'CRM', description: 'Sync leads and log calls automatically.', connected: false, color: '#E42527' },
  { id: 'gcal', name: 'Google Calendar', category: 'Scheduling', description: 'Let AI agents book into real calendar availability.', connected: true, color: '#4285F4' },
  { id: 'calendly', name: 'Calendly', category: 'Scheduling', description: 'Book meetings using your Calendly event types.', connected: false, color: '#006BFF' },
  { id: 'twilio', name: 'Twilio', category: 'Telephony', description: 'Bring your own carrier, numbers and SIP trunks.', connected: true, color: '#F22F46' },
  { id: 'slack', name: 'Slack', category: 'Notifications', description: 'Get notified on qualified leads and hot transfers.', connected: false, color: '#4A154B' },
  { id: 'zapier', name: 'Zapier', category: 'Automation', description: 'Trigger 6,000+ apps from call events.', connected: false, color: '#FF4F00' },
  { id: 'webhooks', name: 'Webhooks', category: 'Developer', description: 'POST call.completed, lead.qualified and more to your URL.', connected: true, color: '#0F172A' },
]

export const calls: Call[] = _calls.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
