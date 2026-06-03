import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP3: SequenceDiagramSpec = {
  id: 'seq-p3',
  title: 'Process 3 — Agent Identity Issuance (SPIFFE/SPIRE)',
  subtitle: 'The agent fetches its non-spoofable X.509-SVID; SPIRE auto-rotates before expiry.',
  actors: [
    { id: 'agent', label: 'Agent', variant: 'primary' },
    { id: 'spire-agent', label: 'SPIRE Agent', sublabel: 'node: local' },
    { id: 'spire-server', label: 'SPIRE Server', sublabel: 'trust authority' },
  ],
  steps: [
    { from: 'agent', to: 'spire-agent', label: 'Workload API (UDS): FetchX509SVID' },
    { from: 'spire-agent', to: 'spire-server', label: 'verify workload attestation' },
    { from: 'spire-agent', to: 'spire-server', label: 'request SVID for spiffe://atcp/agent/{name}' },
    { from: 'spire-server', to: 'spire-server', label: 'sign X.509 cert (private CA)', dashed: true },
    { from: 'spire-server', to: 'spire-agent', label: 'SVID + trust bundle', dashed: true },
    { from: 'spire-agent', to: 'agent', label: 'X.509-SVID (priv key local, never leaves)', dashed: true },
    { from: 'spire-agent', to: 'agent', label: '(auto-rotation before TTL/2)', dashed: true },
  ],
}
