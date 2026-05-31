import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const spiffeWorkloadIdentityDiagram: DiagramSpec = {
  id: 'spiffe-workload-identity',
  title: 'SPIFFE Workload Identity Architecture',
  a11yDescription:
    'A diagram showing the SPIFFE/SPIRE workload identity architecture, including the SPIRE Server acting as a certificate authority, the SPIRE Agent performing node attestation, the Workload API delivering SVIDs via a Unix socket, and downstream services validating identity through the trust bundle.',
  nodes: [
    {
      id: 'spire-server',
      label: 'SPIRE Server',
      sublabel: 'CA · issues SVIDs',
      x: 0,
      y: 0,
      variant: 'primary',
    },
    {
      id: 'datastore',
      label: 'Server Datastore',
      sublabel: 'bundle · entries · keys',
      x: 0,
      y: 1,
      variant: 'secondary',
    },
    {
      id: 'attestation',
      label: 'Attestation',
      sublabel: 'k8s · VM · AWS · JWT',
      x: 0,
      y: 2,
      variant: 'ghost',
      tag: 'sources',
    },
    {
      id: 'spire-agent',
      label: 'SPIRE Agent',
      sublabel: 'node attestation',
      x: 1,
      y: 0,
      variant: 'secondary',
      tag: 'node',
    },
    {
      id: 'workload-api',
      label: 'Workload API',
      sublabel: 'unix:// socket',
      x: 1,
      y: 1,
      variant: 'secondary',
      tag: 'local',
    },
    {
      id: 'research-agent',
      label: 'Research Agent',
      sublabel: 'SVID-attested',
      x: 2,
      y: 0,
      variant: 'primary',
      tag: 'workload',
    },
    {
      id: 'service-a',
      label: 'Service A',
      sublabel: 'validates SVID',
      x: 3,
      y: 0,
      variant: 'secondary',
    },
    {
      id: 'service-b',
      label: 'Service B',
      sublabel: 'validates SVID',
      x: 3,
      y: 1,
      variant: 'secondary',
    },
  ],
  edges: [
    {
      from: 'spire-server',
      to: 'datastore',
    },
    {
      from: 'attestation',
      to: 'spire-agent',
      label: 'attests node',
    },
    {
      from: 'spire-server',
      to: 'spire-agent',
      label: 'SVID + bundle',
      variant: 'emphasis',
    },
    {
      from: 'spire-agent',
      to: 'workload-api',
    },
    {
      from: 'workload-api',
      to: 'research-agent',
      label: 'SVID',
      variant: 'emphasis',
    },
    {
      from: 'research-agent',
      to: 'service-a',
      variant: 'emphasis',
    },
    {
      from: 'research-agent',
      to: 'service-b',
    },
  ],
  scenes: {
    overview: {
      focus: 'full',
      caption:
        'Workload identity: issued by the OS kernel, rotated every 60 seconds.',
    },
    'identity-plane': {
      highlight: ['spire-server', 'datastore'],
      activeEdges: ['spire-server->datastore'],
      dim: [
        'spire-agent',
        'workload-api',
        'research-agent',
        'service-a',
        'service-b',
        'attestation',
      ],
      focus: { nodes: ['spire-server', 'datastore'], padding: 70 },
      caption:
        'SPIRE Server acts as the CA: signs SVIDs, holds registration entries, rotates keys.',
    },
    'node-attestation': {
      highlight: ['attestation', 'spire-agent', 'spire-server'],
      activeEdges: ['attestation->spire-agent', 'spire-server->spire-agent'],
      dim: [
        'datastore',
        'workload-api',
        'research-agent',
        'service-a',
        'service-b',
      ],
      focus: {
        nodes: ['attestation', 'spire-agent', 'spire-server'],
        padding: 50,
      },
      caption:
        'Node attestation: the SPIRE Agent proves its host. The Server issues an Agent SVID. The bundle is cached locally.',
    },
    'workload-attestation': {
      highlight: ['spire-agent', 'workload-api', 'research-agent'],
      activeEdges: ['spire-agent->workload-api', 'workload-api->research-agent'],
      dim: [
        'spire-server',
        'datastore',
        'attestation',
        'service-a',
        'service-b',
      ],
      focus: {
        nodes: ['spire-agent', 'workload-api', 'research-agent'],
        padding: 40,
      },
      caption:
        'Workload attestation: the kernel vouches for the process UID. No secret, no config — identity is issued.',
    },
    mtls: {
      highlight: ['research-agent', 'service-a', 'service-b'],
      activeEdges: ['research-agent->service-a', 'research-agent->service-b'],
      pulse: ['research-agent'],
      dim: [
        'spire-server',
        'datastore',
        'attestation',
        'spire-agent',
        'workload-api',
      ],
      focus: {
        nodes: ['research-agent', 'service-a', 'service-b'],
        padding: 50,
      },
      caption:
        'The Research Agent presents its SVID. Services verify locally against the trust bundle. No call home, ever.',
    },
  },
  defaultScene: 'overview',
}

