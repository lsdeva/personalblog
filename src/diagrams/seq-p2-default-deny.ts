import type { SequenceDiagramSpec } from '@/components/diagram/sequence.types'

export const seqP2: SequenceDiagramSpec = {
  id: 'seq-p2',
  title: 'Process 2 — Agent Registration → Default-Deny',
  subtitle: 'A new agent gets identity but zero privilege. No scope = no access.',
  actors: [
    { id: 'agent', label: 'Agent (new)', variant: 'primary' },
    { id: 'onboard', label: 'Onboarding Svc' },
    { id: 'spire', label: 'SPIRE Server', sublabel: 'issues SVIDs' },
    { id: 'opa', label: 'OPA / Policy', sublabel: 'policy engine' },
  ],
  steps: [
    { from: 'agent', to: 'onboard', label: 'POST /register {agent_name, attestation}' },
    { from: 'onboard', to: 'spire', label: 'create SPIFFE entry: spiffe://atcp/agent/{name}' },
    { from: 'spire', to: 'onboard', label: 'entry created', dashed: true },
    {
      from: 'onboard', to: 'opa',
      label: 'seed empty scope set {} — default deny',
      note: 'Agent has identity but no authority until a mandate is granted (P1 + P4)',
    },
    { from: 'opa', to: 'onboard', label: 'policy seeded', dashed: true },
    { from: 'onboard', to: 'agent', label: '201 {agent_id, status: registered}', dashed: true },
  ],
}
