import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP11: SequenceDiagramSpec = {
  id: 'seq-p11',
  title: 'Process 11 — Agent Completion Reporting',
  subtitle: 'The agent declares the work done; the audit chain gets a closing event.',
  actors: [
    { id: 'agent', label: 'Agent', variant: 'primary' },
    { id: 'recorder', label: 'Completion Recorder' },
    { id: 'writer', label: 'Audit Writer' },
    { id: 'budget', label: 'Budget Svc', sublabel: 'reconcile' },
  ],
  steps: [
    { from: 'agent', to: 'recorder', label: 'POST /complete {jti, result, final_cost}' },
    { from: 'recorder', to: 'recorder', label: 'verify token still valid' },
    { from: 'recorder', to: 'writer', label: 'write completion event (hash-chained)' },
    { from: 'writer', to: 'recorder', label: 'appended', dashed: true },
    { from: 'recorder', to: 'budget', label: 'reconcile final spend vs running total' },
    { from: 'recorder', to: 'agent', label: '200 {acknowledged}', dashed: true },
  ],
}
