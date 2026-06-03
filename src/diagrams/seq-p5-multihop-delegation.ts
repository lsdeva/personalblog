import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP5: SequenceDiagramSpec = {
  id: 'seq-p5',
  title: 'Process 5 — Multi-Hop Delegation (A2A)',
  subtitle: 'Agent A passes work to Agent B. The chain extends — only narrowing — inside the token.',
  actors: [
    { id: 'agent-a', label: 'Agent A', sublabel: 'delegating', variant: 'primary' },
    { id: 'deleg-svc', label: 'Delegation Chain Svc', sublabel: 'builds Biscuit chain' },
    { id: 'agent-b', label: 'Agent B', sublabel: 'receiving', variant: 'primary' },
  ],
  steps: [
    { from: 'agent-a', to: 'deleg-svc', label: 'POST /delegate {parent_ibct, sub_svid, attenuated_scope, budget}' },
    { from: 'deleg-svc', to: 'deleg-svc', label: 'verify parent IBCT signature + PoP' },
    { from: 'deleg-svc', to: 'deleg-svc', label: 'ASSERT: sub_scope ⊆ parent.scope AND sub_budget ≤ parent.budget' },
    { from: 'deleg-svc', to: 'deleg-svc', label: 'ASSERT: chain_depth < max_depth' },
    {
      from: 'deleg-svc', to: 'deleg-svc',
      label: 'append delegation block to Biscuit token (signed)',
      note: 'A hop that widens scope or raises budget is REJECTED. Attenuation is structural, not policy — the verifier walks every block.',
    },
    { from: 'deleg-svc', to: 'agent-a', label: '201 {chained_ibct}', dashed: true },
    { from: 'agent-a', to: 'agent-b', label: 'hand off task with chained_ibct' },
  ],
  auditEvents: ['chain_extended / hop_n / scope_in/out / budget_in/out'],
}
