export interface FlowStage {
  /** Process tag, e.g. "P1". */
  tag: string
  /** Short node label shown in the pipeline. */
  label: string
  /** One-line caption shown while the packet is on this stage. */
  caption: string
  /** Label for the message edge leading INTO this stage. */
  edge: string
  /** Audit event this stage drops into the chain (omitted = no audit row). */
  audit?: string
  /** Visual emphasis: 'primary' = filled accent node (human/agent/decision points). */
  variant?: 'primary' | 'default' | 'gate'
}

/**
 * One agent action, traced end-to-end through all eleven processes.
 * The packet walks left→right; each stage lights as it arrives; governed
 * events fall into the audit rail. This is the "whole system" view.
 */
export const systemFlow: {
  id: string
  title: string
  subtitle: string
  stages: FlowStage[]
} = {
  id: 'system-flow',
  title: 'The whole system, one traced action',
  subtitle:
    'A single agent action walks the full chain — authority established, fused, enforced, bounded, recorded. Every governed event lands in the audit chain.',
  stages: [
    {
      tag: 'P1',
      label: 'Human mandate',
      variant: 'primary',
      edge: 'sign scoped grant',
      caption: 'A human signs a scoped, budget-bounded, time-limited mandate — the chain gets its root.',
      audit: 'mandate issued',
    },
    {
      tag: 'P2',
      label: 'Default-deny',
      edge: 'register agent',
      caption: 'The agent registers with an empty scope set — zero privilege until something is granted.',
    },
    {
      tag: 'P3',
      label: 'SPIFFE SVID',
      edge: 'attest workload',
      caption: 'SPIRE binds a non-spoofable, auto-rotated identity to where the agent actually runs.',
    },
    {
      tag: 'P4',
      label: 'Token mint',
      variant: 'primary',
      edge: 'fuse mandate + SVID',
      caption: 'The Token Exchange fuses the mandate with the SVID into a key-bound IBCT (PoP).',
      audit: 'token minted',
    },
    {
      tag: 'P9',
      label: 'Consent gate',
      variant: 'gate',
      edge: 'risk check',
      caption: 'High-risk? Pause for explicit human consent before the token is usable. Routine work passes.',
      audit: 'consent (if high-risk)',
    },
    {
      tag: 'P5',
      label: 'Delegation',
      variant: 'gate',
      edge: 'if sub-agent',
      caption: 'If work is handed off, the chained token can only narrow — scope and budget never grow.',
      audit: 'chain extended',
    },
    {
      tag: 'P6',
      label: 'PEP enforce',
      variant: 'primary',
      edge: 'action + IBCT + DPoP',
      caption: 'Every call passes through a co-located PEP: verify, check revocation, prove possession, ask OPA.',
      audit: 'decision(allow) + resource_access',
    },
    {
      tag: 'P8',
      label: 'Budget',
      edge: 'report spend',
      caption: 'Each allowed call reports spend in integer cents; the ceiling is enforced automatically.',
      audit: 'spend recorded',
    },
    {
      tag: 'P7',
      label: 'Revocation',
      variant: 'gate',
      edge: 'ceiling / kill',
      caption: 'Ceiling hit or manual kill → a signed CAEP event reaches every PEP in under a second.',
      audit: 'revoke pushed',
    },
    {
      tag: 'P11',
      label: 'Completion',
      edge: 'report done',
      caption: 'The agent reports completion — every opened authority chain gets a closing event.',
      audit: 'completion',
    },
    {
      tag: 'P10',
      label: 'Audit chain',
      variant: 'primary',
      edge: 'append + hash',
      caption: 'Every event above is hash-chained, append-only — tampering with any entry breaks the chain.',
      audit: 'chain verified',
    },
  ],
}
