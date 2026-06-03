import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const atcpOverviewDiagram: DiagramSpec = {
  id: 'atcp-overview',
  title: 'ATCP — How the 11 Processes Fit Together',
  a11yDescription:
    'A full-system diagram of the Agent Trust Control Plane. A human signs a mandate (P1), agents receive non-spoofable SPIFFE identities (P3), the Token Exchange fuses mandate and identity into a key-bound IBCT (P4), every action passes through a co-located PEP (P6), revocation is pushed in under a second via CAEP (P7), budget accounting auto-revokes on ceiling (P8), high-risk actions pause for consent (P9), and every event lands in a tamper-evident audit chain (P10).',

  nodes: [
    // ── Row 0: authority establishment + token path ──────────
    { id: 'human',    label: 'Human',         sublabel: 'principal',         x: 0, y: 0, variant: 'primary',   tag: 'P1' },
    { id: 'spire',    label: 'SPIRE',          sublabel: 'issues SVIDs',      x: 1, y: 0,                       tag: 'P3' },
    { id: 'agent',    label: 'AI Agent',       sublabel: 'SVID-attested',     x: 2, y: 0, variant: 'primary',   tag: 'P4' },
    { id: 'token-ex', label: 'Token Exchange', sublabel: 'mints IBCTs',       x: 3, y: 0,                       tag: 'P4' },
    { id: 'consent',  label: 'Consent Svc',    sublabel: 'step-up gate',      x: 4, y: 0, variant: 'ghost',     tag: 'P9' },

    // ── Row 1: enforcement + resources ───────────────────────
    { id: 'opa',      label: 'OPA / Policy',   sublabel: 'default-deny seed', x: 0, y: 1,                       tag: 'P2' },
    { id: 'sub',      label: 'Sub-Agent',      sublabel: 'if delegated',      x: 2, y: 1, variant: 'ghost',     tag: 'P5' },
    { id: 'pep',      label: 'PEP (sidecar)',  sublabel: '+ OPA policy',      x: 3, y: 1,                       tag: 'P6' },
    { id: 'resource', label: 'Resource',       sublabel: 'tool/API/peer',     x: 4, y: 1, variant: 'ghost'           },

    // ── Row 2: financial + kill-switch + audit ───────────────
    { id: 'audit',    label: 'Audit Chain',    sublabel: 'hash-linked · append-only', x: 1, y: 2, variant: 'ghost', tag: 'P10' },
    { id: 'budget',   label: 'Budget Svc',     sublabel: 'tracks per-jti',    x: 2, y: 2,                       tag: 'P8' },
    { id: 'caep',     label: 'CAEP Tx',        sublabel: 'SSF · revoke push', x: 3, y: 2,                       tag: 'P7' },
  ],

  edges: [
    // Authority establishment
    { from: 'human',    to: 'agent',    label: 'P1 mandate',  variant: 'emphasis' },
    { from: 'spire',    to: 'agent',    label: 'P3 SVID',     variant: 'emphasis' },
    { from: 'opa',      to: 'agent',    label: 'zero-privilege' },

    // Token + consent path
    { from: 'agent',    to: 'token-ex', label: 'P4 exchange', variant: 'emphasis' },
    { from: 'token-ex', to: 'consent',  label: 'P9 if high-risk' },

    // Action path
    { from: 'agent',    to: 'pep',      label: 'P6 action + IBCT', variant: 'emphasis' },
    { from: 'agent',    to: 'sub',      label: 'P5 delegate' },
    { from: 'sub',      to: 'pep',      label: 'chained IBCT' },
    { from: 'pep',      to: 'resource', label: 'forward' },

    // Financial + kill-switch
    { from: 'pep',      to: 'budget',   label: 'P8 spend' },
    { from: 'budget',   to: 'caep',     label: 'ceiling hit' },
    { from: 'caep',     to: 'pep',      label: 'P7 revoke',   variant: 'emphasis' },
  ],

  defaultScene: 'overview',

  scenes: {
    overview: {
      focus: 'full',
      caption: 'One agent action, traced through the system. Each process label shows where it lives in the flow.',
    },

    'establish-authority': {
      highlight: ['human', 'spire', 'opa', 'agent'],
      activeEdges: ['human->agent', 'spire->agent', 'opa->agent'],
      dim: ['token-ex', 'consent', 'sub', 'pep', 'resource', 'budget', 'caep', 'audit'],
      focus: { nodes: ['human', 'spire', 'opa', 'agent'], padding: 60 },
      caption: "P1-P3: A human's signed mandate + SPIFFE workload identity + default-deny policy — the root of all authority.",
    },

    'exercise-authority': {
      highlight: ['agent', 'token-ex', 'consent', 'pep', 'resource'],
      activeEdges: ['agent->token-ex', 'token-ex->consent', 'agent->pep', 'pep->resource'],
      dim: ['human', 'spire', 'opa', 'sub', 'budget', 'caep', 'audit'],
      focus: { nodes: ['agent', 'token-ex', 'consent', 'pep', 'resource'], padding: 50 },
      caption: 'P4 + P6 + P9: Mandate fuses with SVID into a key-bound IBCT. Every action passes through an unbypassable PEP. High-risk actions pause for consent.',
    },

    'delegation': {
      highlight: ['agent', 'sub', 'pep'],
      activeEdges: ['agent->sub', 'sub->pep'],
      dim: ['human', 'spire', 'opa', 'token-ex', 'consent', 'resource', 'budget', 'caep', 'audit'],
      focus: { nodes: ['agent', 'sub', 'pep'], padding: 60 },
      caption: "P5: An agent can delegate to a sub-agent, but the chained token can only narrow — scope and budget can never grow downstream.",
    },

    'safety-controls': {
      highlight: ['pep', 'budget', 'caep', 'audit'],
      activeEdges: ['pep->budget', 'budget->caep', 'caep->pep'],
      pulse: ['caep'],
      dim: ['human', 'spire', 'opa', 'agent', 'token-ex', 'consent', 'sub', 'resource'],
      focus: { nodes: ['pep', 'budget', 'caep', 'audit'], padding: 60 },
      caption: 'P7-P10: Budget ceiling auto-revokes. Revocation reaches every PEP in <1 second via CAEP push. Every governed event lands in the tamper-evident audit chain.',
    },
  },
}
