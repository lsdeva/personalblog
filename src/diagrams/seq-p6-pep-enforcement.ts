import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP6: SequenceDiagramSpec = {
  id: 'seq-p6',
  title: 'Process 6 — Protected Resource Access (PEP Enforcement)',
  subtitle: 'Every call passes through a co-located PEP. Decision and resource_access emitted independently.',
  actors: [
    { id: 'agent', label: 'Agent', variant: 'primary' },
    { id: 'pep', label: 'PEP (sidecar)', sublabel: 'co-located' },
    { id: 'opa', label: 'OPA' },
    { id: 'resource', label: 'Resource', sublabel: 'tool/API/peer' },
  ],
  steps: [
    { from: 'agent', to: 'pep', label: 'request + IBCT + DPoP proof (signed w/ SVID priv key)' },
    { from: 'pep', to: 'pep', label: 'verify IBCT signature (offline)' },
    { from: 'pep', to: 'pep', label: 'check local revocation cache (in-memory)' },
    { from: 'pep', to: 'pep', label: 'verify DPoP proof against cnf.jwk' },
    { from: 'pep', to: 'opa', label: 'evaluate: action ∈ ibct.scope' },
    {
      from: 'opa', to: 'pep',
      label: 'allow / deny', dashed: true,
      note: 'Two independent emitters: unbypassability = every resource_access has a matching decision(allow). Zero orphans.',
    },
    { from: 'pep', to: 'resource', label: 'forward request (if allowed)' },
    { from: 'resource', to: 'agent', label: 'response', dashed: true },
  ],
  auditEvents: [
    'decision / agent / action / outcome / reason',
    'resource_access (independent vantage point — anti-join)',
  ],
}
