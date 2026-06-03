import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP10: SequenceDiagramSpec = {
  id: 'seq-p10',
  title: 'Process 10 — Tamper-Evident Audit Trail',
  subtitle: 'Every governed event hash-chained. Tampering with any entry breaks verification.',
  actors: [
    { id: 'svc', label: 'Any Service', sublabel: 'PEP/Mint/Revoke/…' },
    { id: 'writer', label: 'Audit Writer', sublabel: 'appends + hashes' },
    { id: 'store', label: 'Audit Store', sublabel: 'append-only' },
    { id: 'verifier', label: 'Verifier', sublabel: '/audit/verify' },
  ],
  steps: [
    { from: 'svc', to: 'writer', label: 'emit event {type, payload, ts}' },
    { from: 'writer', to: 'store', label: 'read prev entry hash' },
    { from: 'store', to: 'writer', label: 'prev_hash', dashed: true },
    { from: 'writer', to: 'writer', label: 'entry_hash = SHA256(payload || prev_hash)' },
    { from: 'writer', to: 'store', label: 'append {payload, prev_hash, entry_hash}' },
    {
      from: 'store', to: 'verifier',
      label: 'stream entries (later)',
      note: 'Open tension: append-only vs GDPR erasure. Working answer: pseudonymise principal + crypto-shred. ADR pending.',
    },
    { from: 'verifier', to: 'verifier', label: 'recompute hashes + detect any break' },
  ],
}
