import type { DiagramSpec } from '@/components/diagram/diagram.types'

/**
 * The agent control plane: the authoritative system of record about the agent
 * estate. It does not sit in the request path. Enforcement points — gateway,
 * decision points, credential broker, engines — pull versioned, signed
 * configuration from it and enforce locally, which is what lets the estate keep
 * running when the control plane restarts.
 */
export const agentControlPlane: DiagramSpec = {
  id: 'agent-control-plane',
  title: 'The agent control plane and the enforcement points it administers',
  a11yDescription:
    'A control-plane diagram. At the centre, a registry service holds the authoritative inventory of agents, versions, models, tools, policies, and identities, alongside an evaluation ledger and a deployment manager. It does not sit in the request path. Instead, four enforcement points — the model gateway, the credential broker, the policy decision point, and the durable workflow engine — pull versioned, signed configuration from it and enforce locally. A kill-switch service can flip runtime admission, credential issuance, and tool resolution for any scope within seconds.',
  nodes: [
    { id: 'registry', label: 'Registry + inventory', sublabel: 'agents · tools · policy', x: 1, y: 1, variant: 'primary', tag: 'record' },
    { id: 'eval-ledger', label: 'Evaluation ledger', sublabel: 'gate results per version', x: 0, y: 0, variant: 'secondary' },
    { id: 'deploy', label: 'Deployment manager', sublabel: 'manifests · environments', x: 2, y: 0, variant: 'secondary' },
    { id: 'gateway', label: 'Model gateway', sublabel: 'pulls routing + policy', x: 0, y: 2, variant: 'secondary', tag: 'enforces' },
    { id: 'broker', label: 'Credential broker', sublabel: 'issues short-lived creds', x: 1, y: 2, variant: 'secondary', tag: 'enforces' },
    { id: 'pdp', label: 'Policy decision point', sublabel: 'pulls signed bundles', x: 2, y: 2, variant: 'secondary', tag: 'enforces' },
    { id: 'engine', label: 'Workflow engine', sublabel: 'durable state · versioning', x: 3, y: 1, variant: 'secondary', tag: 'enforces' },
    { id: 'killswitch', label: 'Kill-switch service', sublabel: 'agent · tool · tenant', x: 1, y: 3, variant: 'ghost', tag: 'four grains' },
  ],
  edges: [
    { from: 'eval-ledger', to: 'registry', label: 'gate evidence' },
    { from: 'deploy', to: 'registry', label: 'which manifest where' },
    { from: 'registry', to: 'gateway', label: 'resolve', variant: 'emphasis' },
    { from: 'registry', to: 'broker', label: 'delegation', variant: 'emphasis' },
    { from: 'registry', to: 'pdp', label: 'bundles', variant: 'emphasis' },
    { from: 'registry', to: 'engine', label: 'config', variant: 'emphasis' },
    { from: 'registry', to: 'killswitch', label: 'suspend · revoke · freeze' },
  ],
  scenes: {
    overview: {
      focus: 'full',
      caption:
        'The control plane is the authoritative system of record about the agent estate, and the administration point for every enforcement mechanism in the platform.',
    },
    inventory: {
      highlight: ['registry', 'eval-ledger', 'deploy'],
      activeEdges: ['eval-ledger->registry', 'deploy->registry'],
      dim: ['gateway', 'broker', 'pdp', 'engine', 'killswitch'],
      focus: { nodes: ['registry', 'eval-ledger', 'deploy'], padding: 55 },
      caption:
        'Every relation is queryable, because blast-radius questions — which agents can touch payments, which use this tool version — must answer in seconds during an incident.',
    },
    'fail-static': {
      highlight: ['registry', 'gateway', 'broker', 'pdp', 'engine'],
      activeEdges: ['registry->gateway', 'registry->broker', 'registry->pdp', 'registry->engine'],
      dim: ['eval-ledger', 'deploy', 'killswitch'],
      focus: 'full',
      caption:
        'Enforcement points pull versioned, signed configuration and enforce locally. Cached bundles keep decisions flowing even when the control plane briefly restarts — it fails static.',
    },
    revocation: {
      highlight: ['registry', 'killswitch', 'gateway', 'broker'],
      activeEdges: ['registry->killswitch'],
      pulse: ['killswitch'],
      dim: ['eval-ledger', 'deploy', 'pdp', 'engine'],
      focus: { nodes: ['registry', 'killswitch', 'broker', 'gateway'], padding: 50 },
      caption:
        'One call flips runtime admission, credential issuance, and tool resolution for a scope. Effect within seconds, because all three enforcement families check the same authority.',
    },
  },
  defaultScene: 'overview',
}
