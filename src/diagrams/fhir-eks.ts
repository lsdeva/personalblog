import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const fhirEksDiagram: DiagramSpec = {
  id: 'fhir-eks',
  title:
    'FHIR-on-EKS: ingress terminates at a proxy, routes to a FHIR server pod, which reads from a regional PostgreSQL and forwards audit events to a durable log.',
  a11yDescription:
    'A healthcare integration layout. A client calls an ingress proxy inside EKS. The proxy routes to a FHIR server pod. The FHIR server reads from a regional PostgreSQL database and forwards audit events to a durable log bucket.',
  defaultScene: 'overview',
  nodes: [
    { id: 'client', label: 'Client', sublabel: 'EHR · app', x: 0, y: 0 },
    { id: 'ingress', label: 'Ingress', sublabel: 'mTLS · rate-limit', x: 1, y: 0 },
    { id: 'fhir', label: 'FHIR server', sublabel: 'EKS pod', x: 1, y: 1, variant: 'primary' },
    { id: 'db', label: 'Postgres', sublabel: 'HA · regional', x: 0, y: 2 },
    { id: 'audit', label: 'Audit log', sublabel: 'append-only', x: 2, y: 2, tag: 'compliance' },
  ],
  edges: [
    { from: 'client', to: 'ingress' },
    { from: 'ingress', to: 'fhir' },
    { from: 'fhir', to: 'db' },
    { from: 'fhir', to: 'audit', variant: 'emphasis' },
  ],
  scenes: {
    overview: { focus: 'full' },
    edge: {
      highlight: ['client', 'ingress'],
      activeEdges: ['client->ingress'],
      dim: ['fhir', 'db', 'audit'],
      focus: { nodes: ['client', 'ingress'], padding: 50 },
    },
    server: {
      highlight: ['ingress', 'fhir', 'db'],
      activeEdges: ['ingress->fhir', 'fhir->db'],
      dim: ['client', 'audit'],
      focus: { nodes: ['ingress', 'fhir', 'db'], padding: 50 },
    },
    audit: {
      highlight: ['fhir', 'audit'],
      activeEdges: ['fhir->audit'],
      pulse: ['audit'],
      dim: ['client', 'ingress', 'db'],
      focus: { nodes: ['fhir', 'audit'], padding: 60 },
    },
  },
}
