import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP7: SequenceDiagramSpec = {
  id: 'seq-p7',
  title: 'Process 7 — Revocation (< 1 Second Kill-Switch)',
  subtitle: 'Push, not poll. One revoke → fanned out to every PEP in parallel.',
  actors: [
    { id: 'admin', label: 'Admin / System', sublabel: 'or budget service', variant: 'primary' },
    { id: 'caep', label: 'CAEP Transmitter', sublabel: 'SSF Transmitter' },
    { id: 'pep', label: 'PEP (representative)', sublabel: 'one of N' },
  ],
  steps: [
    { from: 'admin', to: 'caep', label: 'POST /revoke {jti, reason}' },
    { from: 'caep', to: 'caep', label: 'build signed SET (Security Event Token)' },
    {
      from: 'caep', to: 'pep',
      label: 'push SET (HTTP, signed) — in parallel to every PEP',
      note: 'Fan-out, not sequential! Pushed to every PEP in the fleet. Next call with that jti is denied in <1s — cache is local, no network needed.',
    },
    { from: 'pep', to: 'pep', label: 'add jti to local revocation cache (in-memory)' },
    { from: 'pep', to: 'caep', label: '200 ack', dashed: true },
  ],
  auditEvents: ['revoke_issued / jti / reason / source'],
}
