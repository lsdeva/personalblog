import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const legacyMigrationDiagram: DiagramSpec = {
  id: 'legacy-migration',
  title:
    'Three-stage migration intelligence pipeline: an ingest layer reads the legacy system, a model-reasoning layer proposes the cloud shape, and a planning layer emits runbooks.',
  a11yDescription:
    'A three-stage pipeline. A legacy monolith feeds a structured ingest layer, which forwards to an LLM reasoning stage; the reasoning stage produces a target architecture and runbook for the cloud stage to execute.',
  defaultScene: 'overview',
  nodes: [
    { id: 'legacy', label: 'Legacy', sublabel: 'monolith · on-prem', x: 0, y: 0, tag: 'source' },
    { id: 'ingest', label: 'Ingest', sublabel: 'structure · classify', x: 1, y: 0 },
    { id: 'reason', label: 'Reason', sublabel: 'LLM + patterns', x: 1, y: 1, variant: 'primary' },
    { id: 'plan', label: 'Plan', sublabel: 'runbook · IaC', x: 1, y: 2 },
    { id: 'cloud', label: 'Cloud', sublabel: 'target shape', x: 2, y: 2, tag: 'target' },
  ],
  edges: [
    { from: 'legacy', to: 'ingest' },
    { from: 'ingest', to: 'reason' },
    { from: 'reason', to: 'plan', variant: 'emphasis' },
    { from: 'plan', to: 'cloud' },
  ],
  scenes: {
    overview: { focus: 'full' },
    ingest: {
      highlight: ['legacy', 'ingest'],
      activeEdges: ['legacy->ingest'],
      dim: ['reason', 'plan', 'cloud'],
      focus: { nodes: ['legacy', 'ingest'], padding: 50 },
    },
    reason: {
      highlight: ['ingest', 'reason'],
      activeEdges: ['ingest->reason'],
      pulse: ['reason'],
      dim: ['legacy', 'plan', 'cloud'],
      focus: { nodes: ['ingest', 'reason'], padding: 60 },
    },
    plan: {
      highlight: ['reason', 'plan', 'cloud'],
      activeEdges: ['reason->plan', 'plan->cloud'],
      dim: ['legacy', 'ingest'],
      focus: { nodes: ['reason', 'plan', 'cloud'], padding: 50 },
    },
  },
}
