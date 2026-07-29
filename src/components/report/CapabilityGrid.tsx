'use client'

import { useState } from 'react'

/**
 * CapabilityGrid — the eleven shared capabilities that surround every agent.
 *
 * The report's opening thesis: the agent is the smallest, least interesting
 * component; the durable engineering sits in the capabilities around it.
 * This renders them as a selectable grid. Picking one reveals the problem it
 * solves and the buy/build posture. Selection is keyboard-navigable and the
 * detail panel is announced to assistive tech.
 */

type Posture = 'buy' | 'build' | 'compose'

interface Capability {
  id: string
  num: string
  name: string
  /** The problem this capability exists to solve. */
  solves: string
  /** Default buy/build/compose posture from the report. */
  posture: Posture
  postureWhy: string
}

const CAPS: Capability[] = [
  {
    id: 'gateway',
    num: '01',
    name: 'Model gateway',
    solves:
      'The enforced chokepoint between every agent and every model. Authentication, quota, routing, caching, failover, logging, and cost attribution in one place — the highest ratio of value to effort in the platform.',
    posture: 'buy',
    postureWhy: 'Commodity. Adopt open source or buy, and keep it swappable.',
  },
  {
    id: 'context',
    num: '02',
    name: 'Context discipline',
    solves:
      'Treats the context window as a compiled artefact assembled by code from versioned parts, each with an owner, a token budget, and a trust label. Free-hand prompt editing in production is a change-management failure.',
    posture: 'build',
    postureWhy: 'Your prompts and policies are yours; keep them in your own repositories.',
  },
  {
    id: 'knowledge',
    num: '03',
    name: 'Knowledge layer',
    solves:
      'Entitlement-aware retrieval that enforces the querying principal’s permissions at query time, on every path, and fails closed. Index-time filtering alone goes stale and has caused real cross-user exposure.',
    posture: 'compose',
    postureWhy: 'Build the entitlement model on bought vector and search infrastructure.',
  },
  {
    id: 'orchestration',
    num: '04',
    name: 'Orchestration substrate',
    solves:
      'Durable execution for anything that must survive a restart. Agent frameworks manage a reasoning loop; durable engines manage state, retries, timers, human waits, and compensation across hours or weeks.',
    posture: 'buy',
    postureWhy: 'Never rebuild Temporal or a BPMN engine badly. Adopt a proven one.',
  },
  {
    id: 'registry',
    num: '05',
    name: 'Tool registry',
    solves:
      'The authoritative catalogue of everything agents can do, with typed contracts and risk tiers. Unregistered tools are unreachable by construction. This is where least privilege becomes enforceable.',
    posture: 'build',
    postureWhy: 'Build thin over the MCP standard. This is where governance becomes real.',
  },
  {
    id: 'identity',
    num: '06',
    name: 'Agent identity',
    solves:
      'A first-class directory entry per agent instance, short-lived credentials from a broker, delegation that preserves the human principal, and revocation that works in seconds. Shared service accounts are an incident with a date not yet filled in.',
    posture: 'buy',
    postureWhy: 'Directory gravity is real. Buy, and integrate deeply with your IdP.',
  },
  {
    id: 'policy',
    num: '07',
    name: 'Policy decision layer',
    solves:
      'Externalised policy as code, evaluated at the gateway, the tool layer, and the data layer. Prompts shape behaviour; only policy outside the model constitutes control. Every material action carries a decision record.',
    posture: 'compose',
    postureWhy: 'Adopt an open-standards engine; the policy content is yours to write.',
  },
  {
    id: 'security',
    num: '08',
    name: 'Security envelope',
    solves:
      'Layered isolation: ephemeral sandboxes with no ambient credentials, default-deny egress to named destinations, and prompt injection treated as a permanent condition. The 2025 incident record is a list of teams that skipped this.',
    posture: 'buy',
    postureWhy: 'Security floor cannot vary by team. Adopt or buy the sandbox and egress stack.',
  },
  {
    id: 'observability',
    num: '09',
    name: 'Observability pipeline',
    solves:
      'Distributed tracing to the step, not the request. Every model call, tool call, policy decision, and approval, correlated and retained immutably for material actions. If it is not in the trace, it did not happen.',
    posture: 'compose',
    postureWhy: 'Buy the backend, insist on an open trace format, and keep the data yours.',
  },
  {
    id: 'evaluation',
    num: '10',
    name: 'Evaluation harness',
    solves:
      'Golden datasets, trajectory checks, and adversarial suites wired into release gates. Runs on every change to prompt, model, tool, or policy and blocks release on regression. Without it you have unaudited experiments.',
    posture: 'build',
    postureWhy: 'Your quality bar is an accumulating asset. Build the datasets and rubrics.',
  },
  {
    id: 'control-plane',
    num: '11',
    name: 'Control plane',
    solves:
      'The authoritative inventory of everything above. Which agents can touch payments, which use this tool version, which hold this entitlement — questions that must answer in seconds during an incident.',
    posture: 'build',
    postureWhy: 'Build thin, integrate vendor pieces. This is your institutional memory.',
  },
]

const POSTURE_LABEL: Record<Posture, string> = {
  buy: 'Buy / adopt',
  build: 'Build',
  compose: 'Compose',
}

export function CapabilityGrid() {
  const [activeId, setActiveId] = useState('gateway')
  const active = CAPS.find((c) => c.id === activeId) ?? CAPS[0]

  return (
    <div className="cg-root full-bleed">
      <div className="cg-head">
        <span className="cg-head-rule" aria-hidden="true" />
        <span className="cg-head-code">Eleven shared capabilities</span>
        <span className="cg-head-title">The agent is the smallest component. The work is around it.</span>
      </div>

      <div className="cg-layout">
        <ul className="cg-grid" role="tablist" aria-label="Shared platform capabilities">
          {CAPS.map((cap) => {
            const on = cap.id === activeId
            return (
              <li key={cap.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`cg-cell${on ? ' is-on' : ''}`}
                  onClick={() => setActiveId(cap.id)}
                >
                  <span className="cg-cell-num">{cap.num}</span>
                  <span className="cg-cell-name">{cap.name}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="cg-panel" role="tabpanel" aria-live="polite">
          <div className="cg-panel-head">
            <span className="cg-panel-num">{active.num}</span>
            <p className="cg-panel-name">{active.name}</p>
            <span className={`cg-tag cg-tag-${active.posture}`}>{POSTURE_LABEL[active.posture]}</span>
          </div>
          <p className="cg-solves">{active.solves}</p>
          <p className="cg-posture">
            <span className="cg-posture-label">Posture</span>
            {active.postureWhy}
          </p>
        </div>
      </div>
    </div>
  )
}
