import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP1: SequenceDiagramSpec = {
  id: 'seq-p1',
  title: 'Process 1 — Human Authority Delegation',
  subtitle: 'The human signs a scoped, time-bound mandate; the chain of authority gets its root.',
  actors: [
    { id: 'human', label: 'Human', sublabel: 'principal', variant: 'primary' },
    { id: 'oidc', label: 'OIDC Provider' },
    { id: 'vc-issuer', label: 'VC Issuer', sublabel: 'signs mandates' },
    { id: 'vc-store', label: 'VC Store' },
  ],
  steps: [
    { from: 'human', to: 'oidc', label: 'authenticate (OIDC + PKCE)' },
    { from: 'oidc', to: 'human', label: 'ID token (signed identity assertion)', dashed: true },
    { from: 'human', to: 'vc-issuer', label: 'POST /mandate {scope, budget_cents, ttl, agent}' },
    { from: 'vc-issuer', to: 'vc-issuer', label: 'verify ID token + sign mandate (Ed25519 JWS)' },
    { from: 'vc-issuer', to: 'vc-store', label: 'store mandate by ref' },
    { from: 'vc-issuer', to: 'human', label: '201 {mandate_ref, vc_jwt}', dashed: true },
  ],
  auditEvents: ['consent / action=mint_mandate / principal=alice'],
}
