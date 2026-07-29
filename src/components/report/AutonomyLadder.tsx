'use client'

import { useState } from 'react'

/**
 * AutonomyLadder — an interactive L0→L5 tier selector.
 *
 * The report's central governance idea: autonomy is a budget you grant, not a
 * property an agent has. This renders the five-rung ladder as a vertical rail
 * of selectable tiers; picking one swaps a detail panel describing what the
 * agent does, the control regime it earns, and a real production example.
 *
 * Self-contained: uses the site's design tokens, keyboard-navigable, and
 * collapses to a readable stacked layout on small screens.
 */

interface Tier {
  id: string
  level: string
  name: string
  verb: string
  /** One-line summary of what the agent is allowed to do. */
  does: string
  /** The control regime the platform wraps around it. */
  control: string
  /** A grounded example from the report's evidence base. */
  example: string
  /** 0–100 — drives the fill meter, a felt sense of "how much leash". */
  reach: number
}

const TIERS: Tier[] = [
  {
    id: 'l0',
    level: 'L0',
    name: 'Informs',
    verb: 'reads',
    does: 'Surfaces information. Answers questions, summarises, retrieves. It never proposes an action and never touches a system of record.',
    control:
      'Output filtering and citation requirements. The worst case is a wrong sentence, so the controls guard what leaves, not what executes.',
    example:
      'A retrieval assistant over policy documents that cites its sources and writes nothing back.',
    reach: 8,
  },
  {
    id: 'l1',
    level: 'L1',
    name: 'Recommends',
    verb: 'suggests',
    does: 'Proposes a specific action for a human to take. The human is the one who acts. The agent holds no write credential of its own.',
    control:
      'The consequential act stays with a person. The platform records the recommendation and who accepted it.',
    example:
      "LinkedIn's Hiring Assistant drafts recruiter outreach; a human releases every message.",
    reach: 24,
  },
  {
    id: 'l2',
    level: 'L2',
    name: 'Acts with approval',
    verb: 'proposes',
    does: 'Executes actions, but each one waits on a human approval before the credential is released. Propose, then a person disposes.',
    control:
      'Pre-execution approval blocking in the workflow. What was approved binds what executes — argument binding makes post-approval mutation impossible.',
    example:
      'Healthcare clinical decision support sits here: retrieval-heavy, clinician sign-off on anything that acts.',
    reach: 42,
  },
  {
    id: 'l3',
    level: 'L3',
    name: 'Acts within bounds',
    verb: 'executes',
    does: 'Acts autonomously inside hard limits with sampled oversight. Most enterprise write agents that survive contact with a CFO live here.',
    control:
      'Deterministic budgets, loop caps, and transaction limits enforced outside the model. Policy decision points on every write path. Compensation proven per tool.',
    example:
      'A supplier invoice discrepancy agent that resolves within a ceiling and escalates the rest to a named human.',
    reach: 66,
  },
  {
    id: 'l4',
    level: 'L4',
    name: 'Owns the process',
    verb: 'operates',
    does: 'Owns a business process end to end with periodic assurance rather than per-action review. Reserved for reversible domains with a rollback path.',
    control:
      'Everything L3 requires, plus twelve months of clean L3 evidence, continuous reconciliation, rehearsed degradation, and a one-decision path back down to L3.',
    example:
      'Candidate territory in 2026, not routine. Earned by evidence, never granted by ambition.',
    reach: 86,
  },
  {
    id: 'l5',
    level: 'L5',
    name: 'Self-directed',
    verb: 'sets goals',
    does: 'Sets its own goals and holds the only copy of the plan. Full autonomy over what to pursue and how.',
    control:
      'None that holds. As of mid-2026 there is no credible enterprise production evidence and no defensible control story. This rung exists to mark where the map ends.',
    example:
      'The best-documented failures of 2025 came from teams that let the model hold the plan and the permissions at once.',
    reach: 100,
  },
]

export function AutonomyLadder() {
  const [activeId, setActiveId] = useState('l3')
  const active = TIERS.find((t) => t.id === activeId) ?? TIERS[3]
  const danger = active.id === 'l5'

  return (
    <div className="al-root full-bleed">
      <div className="al-head">
        <span className="al-head-rule" aria-hidden="true" />
        <span className="al-head-code">Autonomy ladder</span>
        <span className="al-head-title">
          Autonomy is a budget you grant, not a property the agent has
        </span>
      </div>

      <div className="al-grid">
        {/* ── Rail: the six rungs ─────────────────────────────── */}
        <ul className="al-rail" role="tablist" aria-label="Autonomy tiers">
          {TIERS.map((tier) => {
            const on = tier.id === activeId
            return (
              <li key={tier.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`al-rung${on ? ' is-on' : ''}${tier.id === 'l5' ? ' is-danger' : ''}`}
                  onClick={() => setActiveId(tier.id)}
                >
                  <span className="al-rung-level">{tier.level}</span>
                  <span className="al-rung-name">{tier.name}</span>
                  <span className="al-rung-meter" aria-hidden="true">
                    <span className="al-rung-fill" style={{ width: `${tier.reach}%` }} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* ── Detail panel ────────────────────────────────────── */}
        <div className="al-panel" role="tabpanel" aria-live="polite">
          <div className="al-panel-top">
            <span className={`al-badge${danger ? ' is-danger' : ''}`}>{active.level}</span>
            <div>
              <p className="al-panel-name">{active.name}</p>
              <p className="al-panel-verb">the agent {active.verb}</p>
            </div>
          </div>

          <dl className="al-defs">
            <div>
              <dt>What it does</dt>
              <dd>{active.does}</dd>
            </div>
            <div>
              <dt>Control regime</dt>
              <dd>{active.control}</dd>
            </div>
            <div>
              <dt>In production</dt>
              <dd>{active.example}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="al-foot">
        Select a tier. The control regime is keyed to the tier, and raising an agent&rsquo;s
        tier should be a deliberate, audited act by an accountable human.
      </p>
    </div>
  )
}
