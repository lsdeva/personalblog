import type { DiagramSpec } from '@/components/diagram/diagram.types'

/**
 * The propose–validate–commit shape with saga compensation. The model proposes
 * a structured effect with an idempotency key; a deterministic validator checks
 * schema, policy, entitlement, and budget before anything executes; the adapter
 * commits. Uncertain outcomes are resolved against the system of record, and
 * later failures unwind through compensating steps.
 */
export const proposeValidateCommit: DiagramSpec = {
  id: 'propose-validate-commit',
  title: 'Propose, validate, commit — with saga compensation',
  a11yDescription:
    'A transaction-safety flow. The model proposes a structured effect carrying an idempotency key. A deterministic validator checks schema, policy, entitlement, budget, and preconditions; failures route to revise or escalate. On success the adapter commits. A confirmed effect is checkpointed. An uncertain outcome queries the system of record: confirmed means checkpoint, absent means safe retry with the same key, conflicting means park for reconciliation by a human. A later failure triggers saga compensation, reversing prior steps in order, each compensation itself idempotent and traced.',
  nodes: [
    { id: 'propose', label: 'Propose', sublabel: 'structured effect + idem key', x: 0, y: 0, variant: 'secondary' },
    { id: 'validate', label: 'Validate', sublabel: 'schema · policy · budget', x: 1, y: 0, variant: 'primary', tag: 'deterministic' },
    { id: 'revise', label: 'Revise / escalate', sublabel: 'on validation fail', x: 1, y: 1, variant: 'ghost' },
    { id: 'commit', label: 'Commit', sublabel: 'via adapter', x: 2, y: 0, variant: 'primary' },
    { id: 'confirmed', label: 'Confirmed', sublabel: 'checkpoint · next', x: 2, y: 1, variant: 'secondary' },
    { id: 'uncertain', label: 'Uncertain outcome', sublabel: 'ambiguous timeout', x: 3, y: 0, variant: 'ghost', tag: 'query SoR' },
    { id: 'reconcile', label: 'Query system of record', sublabel: 'confirm · retry · park', x: 3, y: 1, variant: 'secondary' },
    { id: 'compensate', label: 'Saga compensation', sublabel: 'reverse in order · traced', x: 1, y: 2, variant: 'primary', tag: 'on failure' },
  ],
  edges: [
    { from: 'propose', to: 'validate', variant: 'emphasis' },
    { from: 'validate', to: 'revise', label: 'fail' },
    { from: 'validate', to: 'commit', label: 'pass', variant: 'emphasis' },
    { from: 'commit', to: 'confirmed', variant: 'emphasis' },
    { from: 'commit', to: 'uncertain', label: 'timeout' },
    { from: 'uncertain', to: 'reconcile', variant: 'emphasis' },
    { from: 'confirmed', to: 'compensate', label: 'later failure' },
  ],
  scenes: {
    overview: {
      focus: 'full',
      caption:
        'The model proposes. Deterministic code disposes. Uncertainty is resolved against the system of record, never assumed away.',
    },
    propose: {
      highlight: ['propose', 'validate', 'revise'],
      activeEdges: ['propose->validate', 'validate->revise'],
      dim: ['commit', 'confirmed', 'uncertain', 'reconcile', 'compensate'],
      focus: { nodes: ['propose', 'validate', 'revise'], padding: 50 },
      caption:
        'Every write tool accepts an idempotency key. The validator checks schema, policy, entitlement, and budget outside the model before anything executes.',
    },
    commit: {
      highlight: ['validate', 'commit', 'confirmed'],
      activeEdges: ['validate->commit', 'commit->confirmed'],
      dim: ['propose', 'revise', 'uncertain', 'reconcile', 'compensate'],
      focus: { nodes: ['validate', 'commit', 'confirmed'], padding: 50 },
      caption:
        'On a clean pass the adapter commits and the effect is checkpointed. The credential lives in the adapter for the milliseconds of execution, never in model context.',
    },
    uncertain: {
      highlight: ['commit', 'uncertain', 'reconcile'],
      activeEdges: ['commit->uncertain', 'uncertain->reconcile'],
      pulse: ['reconcile'],
      dim: ['propose', 'validate', 'revise', 'confirmed', 'compensate'],
      focus: { nodes: ['commit', 'uncertain', 'reconcile'], padding: 50 },
      caption:
        'An ambiguous timeout queries the ledger: confirmed means checkpoint, absent means safe retry with the same key, conflicting means park for a human. The trace shows one effect, not two.',
    },
    compensate: {
      highlight: ['confirmed', 'compensate'],
      activeEdges: ['confirmed->compensate'],
      pulse: ['compensate'],
      dim: ['propose', 'validate', 'revise', 'commit', 'uncertain', 'reconcile'],
      focus: { nodes: ['confirmed', 'compensate'], padding: 60 },
      caption:
        'A later failure unwinds through sagas: compensating steps run in reverse order, each one itself idempotent, all of it traced. Reconciliation jobs, not optimism, close the loop.',
    },
  },
  defaultScene: 'overview',
}
