import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP4: SequenceDiagramSpec = {
  id: 'seq-p4',
  title: 'Process 4 — Authority Token Minting (Single-Hop, +PoP)',
  subtitle: "The human's signed mandate fuses with the agent's identity into a key-bound IBCT.",
  actors: [
    { id: 'agent', label: 'Agent', sublabel: 'holds SVID', variant: 'primary' },
    { id: 'token-ex', label: 'Token Exchange', sublabel: 'mints IBCTs' },
    { id: 'vc-issuer', label: 'VC Issuer', sublabel: 'resolves mandate' },
    { id: 'opa', label: 'OPA / Policy' },
  ],
  steps: [
    { from: 'agent', to: 'token-ex', label: 'POST /exchange {SVID, mandate_ref, requested_scope, action}' },
    { from: 'token-ex', to: 'vc-issuer', label: 'GET /mandate/{ref}' },
    { from: 'vc-issuer', to: 'token-ex', label: 'vc_jws (signed mandate)', dashed: true },
    { from: 'token-ex', to: 'token-ex', label: 'verify VC signature offline (Ed25519 pub key)' },
    { from: 'token-ex', to: 'opa', label: 'policy: scope ⊆ mandate.scope, budget ≤ mandate.budget' },
    {
      from: 'token-ex', to: 'agent',
      label: 'mint IBCT (JWT, Ed25519) cnf.jwk = agent SVID public key', dashed: true,
      note: 'PoP binding via cnf.jwk: only the agent holding the matching private key can use this token (RFC 7800)',
    },
    { from: 'token-ex', to: 'agent', label: '201 {ibct, exp, jti} — key-bound', dashed: true },
  ],
  auditEvents: ['token_minted / jti / mandate_ref / cnf.jwk'],
}
