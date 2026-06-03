'use client'

import type { SequenceDiagramSpec } from './sequence.types'

/* ── layout constants ────────────────────────────────────────── */
const AW = 136          // actor box width
const AH = 50           // actor box height
const COL = 192         // center-to-center column spacing
const PX = 26           // horizontal padding
const PY = 14           // vertical padding
const SH = 40           // height per step row
const NW = 162          // side-note box width
const NG = 18           // gap: last-actor right edge → note box
const AUDIT_H = 28      // height per audit-event row
const AUDIT_GAP = 10    // gap above first audit event
const LOOP_R = 22       // half-width of the self-loop bulge

const FM = 'var(--font-mono)'
const FS = 'var(--font-sans)'

/* ── helpers ─────────────────────────────────────────────────── */
function cx(col: number) { return PX + AW / 2 + col * COL }
function sy(step: number) { return PY + AH + (step + 0.55) * SH }
function ay(i: number, steps: number) {
  return PY + AH + steps * SH + AUDIT_GAP + (i + 0.5) * AUDIT_H
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > maxChars && cur) { lines.push(cur); cur = w }
    else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

/* ── component ───────────────────────────────────────────────── */
export function SequenceDiagram({ spec }: { spec: SequenceDiagramSpec }) {
  const N = spec.actors.length
  const colOf = new Map(spec.actors.map((a, i) => [a.id, i]))

  const regularSteps = spec.steps
  const auditEvents = spec.auditEvents ?? []
  const hasNotes = regularSteps.some(s => s.note)

  // SVG dimensions
  const W = PX * 2 + AW + (N - 1) * COL + (hasNotes ? NG + NW : 0)
  const H =
    PY * 2 +
    AH +
    regularSteps.length * SH +
    (auditEvents.length > 0 ? AUDIT_GAP + auditEvents.length * AUDIT_H : 0)

  const lifelineBot = H - PY
  const mid = `arr-${spec.id}`

  return (
    <div className="my-10 w-full">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={spec.title}
          style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block' }}
        >
          <title>{spec.title}</title>

          <defs>
            {/* Single arrowhead — orient="auto" handles direction automatically */}
            <marker id={mid} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="var(--color-border-hi)" />
            </marker>
            <marker id={`${mid}-d`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="var(--color-muted)" />
            </marker>
            <marker id={`${mid}-a`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="var(--color-accent)" />
            </marker>
          </defs>

          {/* ── Actor boxes ───────────────────────────────────── */}
          {spec.actors.map((actor, col) => {
            const acx = cx(col)
            const ax = acx - AW / 2
            const primary = actor.variant === 'primary'
            const ghost = actor.variant === 'ghost'
            return (
              <g key={actor.id}>
                <rect
                  x={ax} y={PY} width={AW} height={AH}
                  fill={primary ? 'var(--color-surface-hi)' : 'transparent'}
                  stroke={ghost ? 'var(--color-border)' : primary ? 'var(--color-accent)' : 'var(--color-border-hi)'}
                  strokeWidth="1.25"
                  strokeDasharray={ghost ? '4 4' : undefined}
                  rx="1"
                />
                <text
                  x={acx} y={PY + AH / 2 + (actor.sublabel ? -7 : 4)}
                  textAnchor="middle"
                  fill={primary ? 'var(--color-ink)' : 'var(--color-fg)'}
                  fontFamily={FS} fontSize="13" fontWeight="500"
                >
                  {actor.label}
                </text>
                {actor.sublabel && (
                  <text
                    x={acx} y={PY + AH / 2 + 9}
                    textAnchor="middle"
                    fill="var(--color-muted)"
                    fontFamily={FM} fontSize="9" letterSpacing="0.05em"
                  >
                    {actor.sublabel}
                  </text>
                )}
              </g>
            )
          })}

          {/* ── Lifelines ─────────────────────────────────────── */}
          {spec.actors.map((actor, col) => (
            <line
              key={`ll-${actor.id}`}
              x1={cx(col)} y1={PY + AH}
              x2={cx(col)} y2={lifelineBot}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          ))}

          {/* ── Steps ─────────────────────────────────────────── */}
          {regularSteps.map((step, i) => {
            const fromCol = colOf.get(step.from)
            const toCol = colOf.get(step.to)
            if (fromCol === undefined || toCol === undefined) return null

            const y = sy(i)
            const isSelf = fromCol === toCol
            const fromCx = cx(fromCol)
            const toCx = cx(toCol)
            const goRight = toCx >= fromCx
            const strokeColor = step.dashed ? 'var(--color-muted)' : 'var(--color-border-hi)'
            const arrowId = step.dashed ? `${mid}-d` : mid
            const stepNum = i + 1

            // Label background helper
            const labelBg = (lx: number, ly: number, label: string) => {
              const approxW = label.length * 5.6 + 8
              return (
                <rect
                  x={lx - approxW / 2} y={ly - 12}
                  width={approxW} height={12}
                  fill="var(--color-bg)"
                />
              )
            }

            if (isSelf) {
              // Self-referential: small right-side loop
              const lx = fromCx + AW / 2 + 4
              const rx = lx + LOOP_R
              return (
                <g key={i}>
                  <path
                    d={`M ${fromCx} ${y - 8} H ${rx} V ${y + 8} H ${fromCx}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={step.dashed ? 1 : 1.2}
                    strokeDasharray={step.dashed ? '3 3' : undefined}
                    markerEnd={`url(#${arrowId})`}
                  />
                  <text
                    x={rx + 5} y={y + 4}
                    fontSize="9" fontFamily={FM}
                    fill="var(--color-muted)"
                  >
                    {step.label}
                  </text>
                </g>
              )
            }

            // Regular horizontal arrow
            const x1 = fromCx
            const x2 = toCx
            const midX = (x1 + x2) / 2

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y} x2={x2} y2={y}
                  stroke={strokeColor}
                  strokeWidth={step.dashed ? 1 : 1.25}
                  strokeDasharray={step.dashed ? '4 3' : undefined}
                  markerEnd={`url(#${arrowId})`}
                />

                {/* Step number */}
                <text
                  x={goRight ? x1 + 5 : x1 - 5}
                  y={y - 6}
                  fontSize="9" fontFamily={FM}
                  fill="var(--color-accent)"
                  textAnchor={goRight ? 'start' : 'end'}
                >
                  {stepNum}
                </text>

                {/* Label with bg for readability */}
                {labelBg(midX, y, step.label)}
                <text
                  x={midX} y={y - 3}
                  textAnchor="middle"
                  fontSize="9.5" fontFamily={FM}
                  fill={step.dashed ? 'var(--color-muted)' : 'var(--color-fg)'}
                  letterSpacing="0.015em"
                >
                  {step.label}
                </text>

                {/* Side note */}
                {step.note && (() => {
                  const lastRight = cx(N - 1) + AW / 2
                  const nx = lastRight + NG
                  const lines = wrapText(step.note, 24)
                  const noteH = lines.length * 13 + 12
                  const ny = y - noteH / 2
                  return (
                    <g>
                      <line
                        x1={cx(N - 1)} y1={y} x2={nx} y2={y}
                        stroke="var(--color-border)"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <rect
                        x={nx} y={ny}
                        width={NW} height={noteH}
                        fill="var(--color-surface)"
                        stroke="var(--color-border)"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        rx="3"
                      />
                      {lines.map((line, li) => (
                        <text
                          key={li}
                          x={nx + 7} y={ny + 10 + li * 13}
                          fontSize="9" fontFamily={FM}
                          fill="var(--color-muted)"
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  )
                })()}
              </g>
            )
          })}

          {/* ── Audit trail events ────────────────────────────── */}
          {auditEvents.map((label, i) => {
            const y = ay(i, regularSteps.length)
            const x1 = cx(0)
            // end before note area or near right edge
            const x2 = hasNotes
              ? cx(N - 1) + AW / 2
              : W - PX - 4

            return (
              <g key={`audit-${i}`}>
                <line
                  x1={x1} y1={y} x2={x2} y2={y}
                  stroke="var(--color-muted)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  markerEnd={`url(#${mid}-a)`}
                />
                <text
                  x={x1 + 4} y={y - 5}
                  fontSize="8.5" fontFamily={FM}
                  fill="var(--color-muted)"
                  letterSpacing="0.03em"
                >
                  audit: {label}
                </text>
                <text
                  x={x2 + 4} y={y + 4}
                  fontSize="8" fontFamily={FM}
                  fill="var(--color-accent)"
                >
                  → audit chain (P10)
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {spec.subtitle && (
        <p className="text-kicker mt-4 text-center">{spec.subtitle}</p>
      )}
    </div>
  )
}
