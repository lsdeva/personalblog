import type { DiagramSpec } from '@/components/diagram/diagram.types'

/**
 * The twelve-layer enterprise agent platform, with the control plane spanning
 * all of it. Layers 1–3 differ per agent and per business; 4–12 are shared
 * platform services. Scroll scenes walk the reader down the stack in the four
 * bands the report groups them into.
 */
export const twelveLayerPlatform: DiagramSpec = {
  id: 'twelve-layer-platform',
  title: 'The twelve-layer agent platform and its spanning control plane',
  a11yDescription:
    'A layered diagram of an enterprise AI agent platform. From the top: an interaction layer, an agent runtime and orchestration layer that differ per business, then shared services — model access, context, knowledge, memory, tools and actions — then a trust band of identity, policy, and security, and an observability layer at the base. A control plane spans every layer, holding inventory, registration, approval, deployment, enforcement, suspension, revocation, and reporting.',
  nodes: [
    { id: 'interaction', label: 'Interaction', sublabel: 'chat · voice · events · APIs', x: 0, y: 0, variant: 'secondary', tag: 'L1' },
    { id: 'runtime', label: 'Agent runtime', sublabel: 'planning · reasoning loop', x: 0, y: 1, variant: 'primary', tag: 'L2' },
    { id: 'orchestration', label: 'Orchestration', sublabel: 'durable workflows · timers', x: 0, y: 2, variant: 'primary', tag: 'L3' },
    { id: 'model', label: 'Model access', sublabel: 'gateway · router · cache', x: 0, y: 3, variant: 'secondary', tag: 'L4' },
    { id: 'context', label: 'Context', sublabel: 'compiler · budgets · labels', x: 0, y: 4, variant: 'secondary', tag: 'L5' },
    { id: 'knowledge', label: 'Knowledge', sublabel: 'entitlement-aware retrieval', x: 0, y: 5, variant: 'secondary', tag: 'L6' },
    { id: 'memory', label: 'Memory', sublabel: 'session · durable · governance', x: 0, y: 6, variant: 'secondary', tag: 'L7' },
    { id: 'tools', label: 'Tools & actions', sublabel: 'registry · MCP · adapters', x: 0, y: 7, variant: 'secondary', tag: 'L8' },
    { id: 'identity', label: 'Identity', sublabel: 'agent identities · broker', x: 0, y: 8, variant: 'primary', tag: 'L9' },
    { id: 'policy', label: 'Policy', sublabel: 'decision points · obligations', x: 0, y: 9, variant: 'primary', tag: 'L10' },
    { id: 'security', label: 'Security', sublabel: 'isolation · egress · filtering', x: 0, y: 10, variant: 'primary', tag: 'L11' },
    { id: 'observability', label: 'Observability', sublabel: 'traces · audit · evaluation', x: 0, y: 11, variant: 'secondary', tag: 'L12' },
    { id: 'control-plane', label: 'Control plane', sublabel: 'inventory · enforcement', x: 1, y: 5, variant: 'primary', tag: 'spans all' },
  ],
  edges: [
    { from: 'interaction', to: 'runtime' },
    { from: 'runtime', to: 'orchestration' },
    { from: 'orchestration', to: 'model' },
    { from: 'model', to: 'context' },
    { from: 'context', to: 'knowledge' },
    { from: 'knowledge', to: 'memory' },
    { from: 'memory', to: 'tools' },
    { from: 'tools', to: 'identity' },
    { from: 'identity', to: 'policy' },
    { from: 'policy', to: 'security' },
    { from: 'security', to: 'observability' },
    { from: 'control-plane', to: 'model', variant: 'emphasis' },
    { from: 'control-plane', to: 'identity', variant: 'emphasis' },
    { from: 'control-plane', to: 'policy', variant: 'emphasis' },
    { from: 'control-plane', to: 'tools', variant: 'emphasis' },
    { from: 'control-plane', to: 'observability', variant: 'emphasis' },
  ],
  scenes: {
    overview: {
      focus: 'full',
      caption:
        'Twelve layers recur across every credible production platform. The control plane is the system of record about the platform itself.',
    },
    'agent-logic': {
      highlight: ['interaction', 'runtime', 'orchestration'],
      dim: ['model', 'context', 'knowledge', 'memory', 'tools', 'identity', 'policy', 'security', 'observability', 'control-plane'],
      focus: { nodes: ['interaction', 'runtime', 'orchestration'], padding: 60 },
      caption:
        'Layers 1 to 3 differ per agent and per business. This is where domain logic and interfaces live — federated, owned by the teams.',
    },
    'shared-services': {
      highlight: ['model', 'context', 'knowledge', 'memory', 'tools'],
      dim: ['interaction', 'runtime', 'orchestration', 'identity', 'policy', 'security', 'observability', 'control-plane'],
      focus: { nodes: ['model', 'context', 'knowledge', 'memory', 'tools'], padding: 50 },
      caption:
        'Layers 4 to 8 are shared platform services every agent uses. Central, mandatory, and the same for everyone.',
    },
    trust: {
      highlight: ['identity', 'policy', 'security'],
      dim: ['interaction', 'runtime', 'orchestration', 'model', 'context', 'knowledge', 'memory', 'tools', 'observability', 'control-plane'],
      focus: { nodes: ['identity', 'policy', 'security'], padding: 55 },
      caption:
        'The trust band. Identity, policy, and security are the security floor that cannot vary by team.',
    },
    'control-plane': {
      highlight: ['control-plane', 'model', 'identity', 'policy', 'tools', 'observability'],
      activeEdges: [
        'control-plane->model',
        'control-plane->identity',
        'control-plane->policy',
        'control-plane->tools',
        'control-plane->observability',
      ],
      pulse: ['control-plane'],
      dim: ['interaction', 'runtime', 'orchestration', 'context', 'knowledge', 'memory', 'security'],
      focus: 'full',
      caption:
        'The control plane spans everything: it holds the authoritative inventory and administers every enforcement point without sitting in the request path.',
    },
  },
  defaultScene: 'overview',
}
