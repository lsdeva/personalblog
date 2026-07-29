import type { DiagramSpec } from '@/components/diagram/diagram.types'

/**
 * Model routing as a two-stage funnel: a hard eligibility filter first
 * (jurisdiction, data class, context size, tool support — non-negotiable law),
 * then a soft preference rank among the survivors (quality, latency, cost,
 * health). An evaluation-verified fallback chain sits behind the primary.
 */
export const modelRoutingFunnel: DiagramSpec = {
  id: 'model-routing-funnel',
  title: 'Model routing — hard eligibility first, soft optimisation second',
  a11yDescription:
    'A model-routing flow. A request tagged with task class, risk tier, data classification, tenant, and SLO enters a hard eligibility filter that removes any model not permitted for its jurisdiction, data class, context size, or tool support. Survivors pass to a soft preference rank ordered by quality, latency, cost, and provider health. The top-ranked model is the primary; an evaluation-verified fallback chain handles errors, and degraded requests queue or drop to a smaller approved model.',
  nodes: [
    { id: 'request', label: 'Request + hints', sublabel: 'task · risk · data · tenant', x: 1, y: 0, variant: 'secondary' },
    { id: 'eligibility', label: 'Eligibility filter', sublabel: 'jurisdiction · class · context', x: 1, y: 1, variant: 'primary', tag: 'hard law' },
    { id: 'preference', label: 'Preference rank', sublabel: 'quality · latency · cost', x: 1, y: 2, variant: 'primary', tag: 'soft' },
    { id: 'primary', label: 'Primary model', sublabel: 'top eligible rank', x: 0, y: 3, variant: 'primary' },
    { id: 'fallback', label: 'Fallback chain', sublabel: 'evaluation-verified', x: 1, y: 3, variant: 'secondary' },
    { id: 'degrade', label: 'Degrade or queue', sublabel: 'smaller model · batch', x: 2, y: 3, variant: 'ghost', tag: 'last resort' },
  ],
  edges: [
    { from: 'request', to: 'eligibility', variant: 'emphasis' },
    { from: 'eligibility', to: 'preference', label: 'survivors', variant: 'emphasis' },
    { from: 'preference', to: 'primary', variant: 'emphasis' },
    { from: 'primary', to: 'fallback', label: 'on error' },
    { from: 'fallback', to: 'degrade', label: 'exhausted' },
  ],
  scenes: {
    overview: {
      focus: 'full',
      caption:
        'A request tagged confidential and EU-resident can only reach models approved for that pair — regardless of price or health.',
    },
    hard: {
      highlight: ['request', 'eligibility'],
      activeEdges: ['request->eligibility'],
      dim: ['preference', 'primary', 'fallback', 'degrade'],
      focus: { nodes: ['request', 'eligibility'], padding: 55 },
      caption:
        'The eligibility filter is hard law. Jurisdiction, data classification, context window, and tool support either permit a model or they do not.',
    },
    soft: {
      highlight: ['eligibility', 'preference', 'primary'],
      activeEdges: ['eligibility->preference', 'preference->primary'],
      dim: ['request', 'fallback', 'degrade'],
      focus: { nodes: ['eligibility', 'preference', 'primary'], padding: 50 },
      caption:
        'Among eligible targets, preference is soft optimisation: the cheapest model that clears the quality bar and the surface SLO.',
    },
    fallback: {
      highlight: ['primary', 'fallback', 'degrade'],
      activeEdges: ['primary->fallback', 'fallback->degrade'],
      pulse: ['fallback'],
      dim: ['request', 'eligibility', 'preference'],
      focus: { nodes: ['primary', 'fallback', 'degrade'], padding: 55 },
      caption:
        'Fallback chains must be evaluation-verified. Prompts and tool schemas do not transfer perfectly across families — an untested fallback is an outage with extra steps.',
    },
  },
  defaultScene: 'overview',
}
