'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SequenceDiagramSpec } from './sequence.types'

/* ── layout constants (shared with the static SequenceDiagram) ── */
const AW = 136 // actor box width
const AH = 50 // actor box height
const COL = 192 // center-to-center column spacing
const PX = 26 // horizontal padding
const PY = 14 // vertical padding
const SH = 40 // height per step row
const NW = 162 // side-note box width
const NG = 18 // gap: last-actor right edge → note box
const AUDIT_H = 28 // height per audit-event row
const AUDIT_GAP = 10 // gap above first audit event
const LOOP_R = 22 // half-width of the self-loop bulge

const FM = 'var(--font-mono)'
const FS = 'var(--font-sans)'

/* one "frame" per step, plus one trailing frame per audit event so the
   audit lines land after the steps that produced them. */
const STEP_MS = 1100 // dwell per step while playing

/* ── helpers ─────────────────────────────────────────────────── */
function cx(col: number) {
  return PX + AW / 2 + col * COL
}
function sy(step: number) {
  return PY + AH + (step + 0.55) * SH
}
function ay(i: number, steps: number) {
  return PY + AH + steps * SH + AUDIT_GAP + (i + 0.5) * AUDIT_H
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > maxChars && cur) {
      lines.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/* ── component ───────────────────────────────────────────────── */
export function AnimatedSequenceDiagram({ spec }: { spec: SequenceDiagramSpec }) {
  const N = spec.actors.length
  const colOf = new Map(spec.actors.map((a, i) => [a.id, i]))

  const regularSteps = spec.steps
  const auditEvents = spec.auditEvents ?? []
  const hasNotes = regularSteps.some((s) => s.note)

  // A "frame" reveals one more step; the last `auditEvents.length` frames
  // reveal the audit lines one by one. Frame 0 = nothing revealed yet.
  const totalFrames = regularSteps.length + auditEvents.length
  const reduced = usePrefersReducedMotion()

  // Start fully revealed so SSR / no-JS / pre-hydration shows the complete
  // diagram. Once hydrated, the in-view autoplay rewinds to 0 and plays.
  const [frame, setFrame] = useState(totalFrames) // 0..totalFrames
  const [playing, setPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const atEnd = frame >= totalFrames

  const stop = useCallback(() => {
    setPlaying(false)
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const play = useCallback(() => {
    setHasPlayed(true)
    setFrame((f) => (f >= totalFrames ? 0 : f)) // restart if at end
    setPlaying(true)
  }, [totalFrames])

  const stepBy = useCallback(
    (d: number) => {
      stop()
      setHasPlayed(true)
      setFrame((f) => Math.max(0, Math.min(totalFrames, f + d)))
    },
    [stop, totalFrames],
  )

  // Advance frames while playing.
  useEffect(() => {
    if (!playing) return
    if (frame >= totalFrames) {
      setPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setFrame((f) => f + 1)
    }, STEP_MS)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [playing, frame, totalFrames])

  // Reduced motion → show the full diagram, no autoplay, no controls.
  useEffect(() => {
    if (reduced) {
      stop()
      setFrame(totalFrames)
    }
  }, [reduced, stop, totalFrames])

  // Autoplay once when scrolled into view (respects reduced motion).
  useEffect(() => {
    if (reduced || hasPlayed) return
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play()
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, hasPlayed, play])

  // SVG dimensions
  const W = PX * 2 + AW + (N - 1) * COL + (hasNotes ? NG + NW : 0)
  const H =
    PY * 2 +
    AH +
    regularSteps.length * SH +
    (auditEvents.length > 0 ? AUDIT_GAP + auditEvents.length * AUDIT_H : 0)

  const lifelineBot = H - PY
  const mid = `arr-${spec.id}`

  const stepsShown = Math.min(frame, regularSteps.length)
  const auditShown = Math.max(0, frame - regularSteps.length)

  // Which actor columns are "active" (have participated in a revealed step).
  const activeCols = new Set<number>()
  for (let i = 0; i < stepsShown; i++) {
    const s = regularSteps[i]
    const fc = colOf.get(s.from)
    const tc = colOf.get(s.to)
    if (fc !== undefined) activeCols.add(fc)
    if (tc !== undefined) activeCols.add(tc)
  }
  // The step currently "landing" (most recently revealed) gets emphasis.
  const liveStep = stepsShown - 1

  return (
    <div className="my-10 w-full" ref={rootRef}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={spec.title}
          style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block' }}
        >
          <title>{spec.title}</title>

          <defs>
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
            const active = activeCols.has(col)
            return (
              <g
                key={actor.id}
                style={{
                  opacity: active ? 1 : 0.55,
                  transition: 'opacity 320ms ease',
                }}
              >
                <rect
                  x={ax}
                  y={PY}
                  width={AW}
                  height={AH}
                  fill={primary ? 'var(--color-surface-hi)' : 'transparent'}
                  stroke={
                    active
                      ? 'var(--color-accent)'
                      : ghost
                        ? 'var(--color-border)'
                        : primary
                          ? 'var(--color-accent)'
                          : 'var(--color-border-hi)'
                  }
                  strokeWidth={active ? 1.5 : 1.25}
                  strokeDasharray={ghost ? '4 4' : undefined}
                  rx="1"
                  style={{ transition: 'stroke 320ms ease, stroke-width 320ms ease' }}
                />
                <text
                  x={acx}
                  y={PY + AH / 2 + (actor.sublabel ? -7 : 4)}
                  textAnchor="middle"
                  fill={primary ? 'var(--color-ink)' : 'var(--color-fg)'}
                  fontFamily={FS}
                  fontSize="13"
                  fontWeight="500"
                >
                  {actor.label}
                </text>
                {actor.sublabel && (
                  <text
                    x={acx}
                    y={PY + AH / 2 + 9}
                    textAnchor="middle"
                    fill="var(--color-muted)"
                    fontFamily={FM}
                    fontSize="9"
                    letterSpacing="0.05em"
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
              x1={cx(col)}
              y1={PY + AH}
              x2={cx(col)}
              y2={lifelineBot}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          ))}

          {/* ── Steps (revealed progressively) ────────────────── */}
          {regularSteps.map((step, i) => {
            if (i >= stepsShown) return null
            const fromCol = colOf.get(step.from)
            const toCol = colOf.get(step.to)
            if (fromCol === undefined || toCol === undefined) return null

            const y = sy(i)
            const isSelf = fromCol === toCol
            const fromCx = cx(fromCol)
            const toCx = cx(toCol)
            const goRight = toCx >= fromCx
            const isLive = i === liveStep
            const strokeColor = isLive
              ? 'var(--color-accent)'
              : step.dashed
                ? 'var(--color-muted)'
                : 'var(--color-border-hi)'
            const arrowId = isLive ? `${mid}-a` : step.dashed ? `${mid}-d` : mid
            const stepNum = i + 1

            const labelBg = (lx: number, ly: number, label: string) => {
              const approxW = label.length * 5.6 + 8
              return (
                <rect x={lx - approxW / 2} y={ly - 12} width={approxW} height={12} fill="var(--color-bg)" />
              )
            }

            // Per-step entrance: fade the whole group in.
            const groupStyle: React.CSSProperties = {
              animation: reduced ? undefined : 'seq-step-in 360ms var(--ease-out-expo) both',
            }

            if (isSelf) {
              const lx = fromCx + AW / 2 + 4
              const rx = lx + LOOP_R
              return (
                <g key={i} style={groupStyle}>
                  <path
                    d={`M ${fromCx} ${y - 8} H ${rx} V ${y + 8} H ${fromCx}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={step.dashed ? 1 : 1.2}
                    strokeDasharray={step.dashed ? '3 3' : undefined}
                    markerEnd={`url(#${arrowId})`}
                    style={{ transition: 'stroke 280ms ease' }}
                  />
                  <text x={rx + 5} y={y + 4} fontSize="9" fontFamily={FM} fill="var(--color-muted)">
                    {step.label}
                  </text>
                </g>
              )
            }

            const x1 = fromCx
            const x2 = toCx
            const midX = (x1 + x2) / 2

            return (
              <g key={i} style={groupStyle}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={strokeColor}
                  strokeWidth={isLive ? 1.6 : step.dashed ? 1 : 1.25}
                  strokeDasharray={step.dashed ? '4 3' : undefined}
                  markerEnd={`url(#${arrowId})`}
                  style={{ transition: 'stroke 280ms ease, stroke-width 280ms ease' }}
                />

                <text
                  x={goRight ? x1 + 5 : x1 - 5}
                  y={y - 6}
                  fontSize="9"
                  fontFamily={FM}
                  fill="var(--color-accent)"
                  textAnchor={goRight ? 'start' : 'end'}
                >
                  {stepNum}
                </text>

                {labelBg(midX, y, step.label)}
                <text
                  x={midX}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontFamily={FM}
                  fill={isLive ? 'var(--color-fg)' : step.dashed ? 'var(--color-muted)' : 'var(--color-fg)'}
                  letterSpacing="0.015em"
                >
                  {step.label}
                </text>

                {step.note &&
                  (() => {
                    const lastRight = cx(N - 1) + AW / 2
                    const nx = lastRight + NG
                    const lines = wrapText(step.note, 24)
                    const noteH = lines.length * 13 + 12
                    const ny = y - noteH / 2
                    return (
                      <g>
                        <line
                          x1={cx(N - 1)}
                          y1={y}
                          x2={nx}
                          y2={y}
                          stroke="var(--color-border)"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        <rect
                          x={nx}
                          y={ny}
                          width={NW}
                          height={noteH}
                          fill="var(--color-surface)"
                          stroke="var(--color-border)"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          rx="3"
                        />
                        {lines.map((line, li) => (
                          <text
                            key={li}
                            x={nx + 7}
                            y={ny + 10 + li * 13}
                            fontSize="9"
                            fontFamily={FM}
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

          {/* ── Audit trail events (revealed after their steps) ─── */}
          {auditEvents.map((label, i) => {
            if (i >= auditShown) return null
            const y = ay(i, regularSteps.length)
            const x1 = cx(0)
            const x2 = hasNotes ? cx(N - 1) + AW / 2 : W - PX - 4
            return (
              <g
                key={`audit-${i}`}
                style={{ animation: reduced ? undefined : 'seq-step-in 360ms var(--ease-out-expo) both' }}
              >
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="var(--color-muted)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  markerEnd={`url(#${mid}-a)`}
                />
                <text
                  x={x1 + 4}
                  y={y - 5}
                  fontSize="8.5"
                  fontFamily={FM}
                  fill="var(--color-muted)"
                  letterSpacing="0.03em"
                >
                  audit: {label}
                </text>
                <text x={x2 + 4} y={y + 4} fontSize="8" fontFamily={FM} fill="var(--color-accent)">
                  → audit chain (P10)
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── Player controls (hidden under reduced motion) ──────── */}
      {!reduced && (
        <div className="seq-player" role="group" aria-label={`Playback controls for ${spec.title}`}>
          <button
            type="button"
            className="seq-btn"
            onClick={() => (playing ? stop() : atEnd ? play() : play())}
            aria-label={playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          >
            {playing ? '❚❚' : atEnd ? '↺' : '▶'}
          </button>
          <button
            type="button"
            className="seq-btn"
            onClick={() => stepBy(-1)}
            disabled={frame <= 0}
            aria-label="Previous step"
          >
            ‹
          </button>
          <button
            type="button"
            className="seq-btn"
            onClick={() => stepBy(1)}
            disabled={frame >= totalFrames}
            aria-label="Next step"
          >
            ›
          </button>
          <input
            type="range"
            className="seq-scrub"
            min={0}
            max={totalFrames}
            value={frame}
            step={1}
            onChange={(e) => {
              stop()
              setHasPlayed(true)
              setFrame(Number(e.target.value))
            }}
            aria-label="Scrub steps"
          />
          <span className="seq-count" aria-live="polite">
            {Math.min(frame, totalFrames)} / {totalFrames}
          </span>
        </div>
      )}

      {spec.subtitle && <p className="text-kicker mt-4 text-center">{spec.subtitle}</p>}
    </div>
  )
}
