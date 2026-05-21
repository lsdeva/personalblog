import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const agenticAuthnAuthzDiagram: DiagramSpec = {
  id: 'agentic-authn-authz',
  title:
    'Four-plane agentic AuthN/AuthZ reference architecture: principal delegation, hardware-rooted agent identity, OAuth-based authorization, and a real-time governance layer.',
  a11yDescription:
    'A four-row stack. Row one — the principal plane — shows a Human Principal issuing a W3C Verifiable Credential on the left and authenticating to an OIDC IdP on the right. Row two — the agent identity plane — shows the AI Agent receiving the delegation and attesting its workload identity to a SPIFFE Certificate Authority. Row three — the authorization plane — shows the agent calling an MCP server and an A2A sub-agent, both gated by OAuth 2.1 with token exchange. Row four — the governance plane — shows OPA/Rego evaluating policy, CAEP propagating real-time revocation, and a cryptographically chained audit log.',
  defaultScene: 'overview',

  nodes: [
    { id: 'vc',       label: 'W3C VC Cred',    sublabel: 'delegation token',  x: 0, y: 0, variant: 'ghost' },
    { id: 'human',    label: 'Human Principal', sublabel: 'OIDC session',      x: 1, y: 0, variant: 'primary' },
    { id: 'idp',      label: 'OIDC IdP',        sublabel: 'existing IdP',      x: 2, y: 0, variant: 'secondary' },
    { id: 'spiffe',   label: 'SPIFFE CA',       sublabel: 'TPM · short-TTL',   x: 0, y: 1, variant: 'secondary', tag: 'attest' },
    { id: 'agent',    label: 'AI Agent',        sublabel: 'SVID-attested',     x: 1, y: 1, variant: 'primary' },
    { id: 'mcp',      label: 'MCP Server',      sublabel: 'OAuth RS · tools',  x: 0, y: 2, variant: 'secondary', tag: 'tools' },
    { id: 'oauth',    label: 'OAuth 2.1',       sublabel: 'RFC 8693 exchange', x: 1, y: 2, variant: 'primary',   tag: 'authz' },
    { id: 'a2a',      label: 'A2A Protocol',    sublabel: 'sub-agent call',    x: 2, y: 2, variant: 'secondary', tag: 'delegate' },
    { id: 'opa',      label: 'OPA Policy',      sublabel: 'Rego · OWASP ASI', x: 0, y: 3, variant: 'secondary', tag: 'rego' },
    { id: 'caep',     label: 'CAEP',            sublabel: 'live revocation',   x: 1, y: 3, variant: 'primary',   tag: 'live' },
    { id: 'audit',    label: 'Audit Log',       sublabel: 'cryptographic chain', x: 2, y: 3, variant: 'secondary', tag: 'chain' },
  ],

  edges: [
    { from: 'human',  to: 'vc' },
    { from: 'human',  to: 'idp' },
    { from: 'vc',     to: 'agent' },
    { from: 'idp',    to: 'agent' },
    { from: 'agent',  to: 'spiffe' },
    { from: 'agent',  to: 'mcp' },
    { from: 'agent',  to: 'oauth' },
    { from: 'agent',  to: 'a2a',   variant: 'emphasis' },
    { from: 'oauth',  to: 'opa' },
    { from: 'opa',    to: 'caep' },
    { from: 'opa',    to: 'audit', variant: 'emphasis' },
  ],

  scenes: {
    overview: {
      focus: 'full',
      caption: 'Delegation flows down. Trust chains audit upward.',
    },
    plane1: {
      highlight: ['human', 'idp', 'vc'],
      activeEdges: ['human->vc', 'human->idp'],
      dim: ['spiffe', 'agent', 'mcp', 'oauth', 'a2a', 'opa', 'caep', 'audit'],
      focus: { nodes: ['human', 'idp', 'vc'], padding: 70 },
      caption: 'The root of every trust chain is a human issuing a delegation credential.',
    },
    plane2: {
      highlight: ['agent', 'spiffe'],
      activeEdges: ['vc->agent', 'idp->agent', 'agent->spiffe'],
      dim: ['human', 'mcp', 'oauth', 'a2a', 'opa', 'caep', 'audit'],
      focus: { nodes: ['vc', 'idp', 'agent', 'spiffe'], padding: 50 },
      caption: 'SPIFFE SVIDs anchor workload identity in hardware. No static credentials.',
    },
    plane3: {
      highlight: ['agent', 'mcp', 'oauth', 'a2a'],
      activeEdges: ['agent->mcp', 'agent->oauth', 'agent->a2a'],
      dim: ['human', 'idp', 'vc', 'spiffe', 'opa', 'caep', 'audit'],
      focus: { nodes: ['agent', 'mcp', 'oauth', 'a2a'], padding: 40 },
      caption: 'MCP and A2A both speak OAuth 2.1. RFC 8693 ensures scope only narrows.',
    },
    plane4: {
      highlight: ['oauth', 'opa', 'caep', 'audit'],
      activeEdges: ['oauth->opa', 'opa->caep', 'opa->audit'],
      pulse: ['caep'],
      dim: ['human', 'idp', 'vc', 'spiffe', 'agent', 'mcp', 'a2a'],
      focus: { nodes: ['oauth', 'opa', 'caep', 'audit'], padding: 40 },
      caption: 'OPA evaluates policy. CAEP revokes in real time. Every action is chained.',
    },
    roi: {
      activeEdges: [
        'human->vc', 'human->idp', 'vc->agent', 'idp->agent',
        'agent->spiffe', 'agent->mcp', 'agent->oauth', 'agent->a2a',
        'oauth->opa', 'opa->caep', 'opa->audit',
      ],
      focus: 'full',
      caption: 'Compliance velocity · blast-radius reduction · vendor independence.',
    },
  },
}
