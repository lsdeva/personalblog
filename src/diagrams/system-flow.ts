/**
 * "How the 11 processes fit together" — one agent action traced through the
 * whole control plane. Node coordinates, edges, audit fan-in and the traced
 * packet path are copied 1:1 from the reference ATCP diagram bundle so the
 * animated layout matches it exactly.
 */

export interface FlowNode {
  id: string
  label: string
  sub: string
  /** Process tag, e.g. "P1" ("" for the bare Resource node). */
  tag: string
  x: number
  y: number
}

export interface FlowEdge {
  from: string
  to: string
  label: string
  /** faint = de-emphasised structural edge; danger = the revoke kill-switch. */
  faint?: boolean
  tone?: 'danger'
}

export const systemFlow: {
  id: string
  code: string
  title: string
  tagline: string
  caption: string
  /** SVG canvas the hand-placed coordinates were authored against. */
  vw: number
  vh: number
  nodes: FlowNode[]
  edges: FlowEdge[]
  /** Nodes that dotted-link into the audit chain. */
  auditSources: string[]
  /** The traced packet path (node ids) — "one action through the system". */
  trace: string[]
} = {
  id: 'system-flow',
  code: 'FIT',
  title: 'How the 11 Processes Fit Together',
  tagline: 'One agent action, traced through the whole control plane.',
  caption:
    'A human signs (P1), the agent is bound to a non-spoofable identity (P3), the Token Exchange fuses them (P4), every call passes a PEP (P6), revocation is sub-second (P7), budget auto-revokes (P8), high-risk pauses for consent (P9) — and every event lands in a tamper-evident chain (P10).',
  vw: 920,
  vh: 680,
  nodes: [
    { id: 'human', label: 'Human', sub: 'principal', tag: 'P1', x: 70, y: 60 },
    { id: 'spire', label: 'SPIRE', sub: 'issues SVIDs', tag: 'P3', x: 70, y: 250 },
    { id: 'agent', label: 'AI Agent', sub: 'SVID-attested', tag: 'P4', x: 300, y: 150 },
    { id: 'opa', label: 'OPA / Policy', sub: 'default-deny seed', tag: 'P2', x: 430, y: 310 },
    { id: 'sub', label: 'Sub-Agent', sub: 'if delegated', tag: 'P5', x: 300, y: 430 },
    { id: 'audit', label: 'Audit Chain', sub: 'hash-linked · append-only', tag: 'P10', x: 80, y: 560 },
    { id: 'tx', label: 'Token Exchange', sub: 'mints IBCTs', tag: 'P4', x: 545, y: 65 },
    { id: 'consent', label: 'Consent Svc', sub: 'step-up gate', tag: 'P9', x: 800, y: 65 },
    { id: 'budget', label: 'Budget Svc', sub: 'tracks per-jti', tag: 'P8', x: 800, y: 250 },
    { id: 'res', label: 'Resource', sub: 'tool/API/peer', tag: '', x: 800, y: 450 },
    { id: 'pep', label: 'PEP (sidecar)', sub: '+ OPA policy', tag: 'P6', x: 545, y: 460 },
    { id: 'caep', label: 'CAEP Tx', sub: 'SSF · revoke push', tag: 'P7', x: 560, y: 600 },
  ],
  edges: [
    { from: 'human', to: 'agent', label: 'P1 mandate' },
    { from: 'spire', to: 'agent', label: 'P3 SVID · zero-privilege' },
    { from: 'agent', to: 'tx', label: 'P4 exchange' },
    { from: 'tx', to: 'consent', label: 'P9 if high-risk' },
    { from: 'opa', to: 'tx', label: 'P2 seed', faint: true },
    { from: 'tx', to: 'pep', label: 'P6 action + IBCT' },
    { from: 'agent', to: 'sub', label: 'P5 delegate · chained IBCT' },
    { from: 'pep', to: 'res', label: 'forward' },
    { from: 'pep', to: 'budget', label: 'P8 spend' },
    { from: 'budget', to: 'caep', label: 'ceiling hit' },
    { from: 'caep', to: 'pep', label: 'P7 revoke', tone: 'danger' },
  ],
  auditSources: ['tx', 'pep', 'budget', 'caep', 'consent'],
  trace: ['human', 'agent', 'tx', 'consent', 'tx', 'pep', 'res', 'budget', 'caep', 'pep'],
}
