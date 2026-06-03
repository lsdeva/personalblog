import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP9: SequenceDiagramSpec = {
  id: 'seq-p9',
  title: 'Process 9 — Consent Step-Up for High-Risk Actions',
  subtitle: 'High-risk actions pause for a human grant. Routine ones proceed.',
  actors: [
    { id: 'agent', label: 'Agent', variant: 'primary' },
    { id: 'token-ex', label: 'Token Exchange' },
    { id: 'consent', label: 'Consent Svc' },
    { id: 'human', label: 'Human', sublabel: 'principal', variant: 'primary' },
  ],
  steps: [
    { from: 'agent', to: 'token-ex', label: 'POST /exchange (high-risk action)' },
    { from: 'token-ex', to: 'token-ex', label: 'policy: requires consent?' },
    { from: 'token-ex', to: 'agent', label: '412 consent_required {consent_id}', dashed: true },
    { from: 'token-ex', to: 'consent', label: 'create consent request' },
    { from: 'consent', to: 'human', label: 'notify human (channel of choice)' },
    { from: 'human', to: 'consent', label: 'grant | deny' },
    { from: 'agent', to: 'token-ex', label: 'POST /exchange (retry with consent_id)' },
    { from: 'token-ex', to: 'consent', label: 'check consent state' },
    { from: 'consent', to: 'token-ex', label: 'granted', dashed: true },
    { from: 'token-ex', to: 'agent', label: '201 {ibct}', dashed: true },
  ],
  auditEvents: ['consent / action / decision / principal'],
}
