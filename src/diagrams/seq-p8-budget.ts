import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP8: SequenceDiagramSpec = {
  id: 'seq-p8',
  title: 'Process 8 — Budget Accounting and Ceiling Enforcement',
  subtitle: 'Spend reported per call. Crossing the ceiling auto-revokes via CAEP.',
  actors: [
    { id: 'agent', label: 'Agent', variant: 'primary' },
    { id: 'pep', label: 'PEP' },
    { id: 'budget', label: 'Budget Svc', sublabel: 'tracks per-jti' },
    { id: 'caep', label: 'CAEP Tx' },
  ],
  steps: [
    { from: 'pep', to: 'agent', label: 'request (allowed)', dashed: true },
    { from: 'pep', to: 'budget', label: 'POST /spend {jti, cents} (async, fire-and-forget)' },
    { from: 'budget', to: 'budget', label: 'atomic increment of running total' },
    {
      from: 'budget', to: 'budget',
      label: 'if total ≥ ibct.budget_cents →',
      note: 'Known gap: spend is self-reported by the PEP. Fix = attested completion (P11). Documented, not hidden.',
    },
    { from: 'budget', to: 'caep', label: 'POST /revoke {jti, reason: budget_exhausted}' },
  ],
  auditEvents: ['spend / jti / amount / running_total'],
}
