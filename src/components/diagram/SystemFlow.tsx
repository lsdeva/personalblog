'use client'

import { useEffect, useRef, useState } from 'react'
import { systemFlow } from '@/diagrams/system-flow'

const FM = 'var(--font-mono)'
const FS = 'var(--font-sans)'

/* layout */
const NODE_W = 150
const NODE_H = 54
const COLS = 4 // nodes per row (wraps boustrophedon: → then ←)
const GAP_X = 30
const GAP_Y = 58
const PAD = 24
const STAGE_MS = 1300 // dwell per stage while playing
const END_HOLD_MS = 1600

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

/** Boustrophedon grid position: row 0 left→right, row 1 right→left, … */
function gridPos(i: number) {
  const row = Math.floor(i / COLS)
  const colInRow = i % COLS
  const col = row % 2 === 0 ? colInRow : COLS - 1 - colInRow
  return { row, col }
}

export function SystemFlow() {
  const stages = systemFlow.stages
  const n = stages.length
  const reduced = usePrefersReducedMotion()

  // active = index of the stage the packet is currently on (-1 = idle/start).
  const [active, setActive] = useState(n - 1) // SSR/no-JS: fully lit
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [hasPlayed, setHasPlayed] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const rows = Math.ceil(n / COLS)
  const W = PAD * 2 + COLS * NODE_W + (COLS - 1) * GAP_X
  const H = PAD * 2 + rows * NODE_H + (rows - 1) * GAP_Y + 86 // +audit rail

  const nodeX = (col: number) => PAD + col * (NODE_W + GAP_X)
  const nodeY = (row: number) => PAD + row * (NODE_H + GAP_Y)
  const cxOf = (i: number) => {
    const { col } = gridPos(i)
    return nodeX(col) + NODE_W / 2
  }
  const cyOf = (i: number) => {
    const { row } = gridPos(i)
    return nodeY(row) + NODE_H / 2
  }

  const stop = () => {
    setPlaying(false)
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }
  const play = () => {
    setHasPlayed(true)
    setActive((a) => (a >= n - 1 ? -1 : a))
    setPlaying(true)
  }

  // advance the packet
  useEffect(() => {
    if (!playing) return
    if (active >= n - 1) {
      if (!loop) {
        setPlaying(false)
        return
      }
      timerRef.current = window.setTimeout(() => setActive(-1), END_HOLD_MS)
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current)
      }
    }
    timerRef.current = window.setTimeout(() => setActive((a) => a + 1), active < 0 ? 500 : STAGE_MS)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [playing, active, n, loop])

  // reduced motion → fully lit, no controls
  useEffect(() => {
    if (reduced) {
      stop()
      setActive(n - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, n])

  // autoplay (loops) when scrolled into view
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
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, hasPlayed])

  // audit events revealed so far
  const auditRevealed = stages
    .map((s, i) => ({ ...s, i }))
    .filter((s) => s.audit && s.i <= active)

  const auditY = PAD + rows * NODE_H + (rows - 1) * GAP_Y + 34
  const liveStage = active >= 0 && active < n ? stages[active] : null

  return (
    <div className="seq-diagram seq-console my-10 w-full" ref={rootRef}>
      <div className="seq-head">
        <span className="seq-head-rule" aria-hidden="true" />
        <span className="seq-head-code">FIT</span>
        <span className="seq-head-title">{systemFlow.title}</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={systemFlow.title}
          style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block' }}
        >
          <title>{systemFlow.title}</title>
          <defs>
            <marker id="sf-arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="var(--color-border-hi)" />
            </marker>
            <marker id="sf-arr-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="var(--color-accent)" />
            </marker>
          </defs>

          {/* ── edges between consecutive stages ─────────────── */}
          {stages.slice(1).map((stage, idx) => {
            const i = idx + 1
            const a = gridPos(i - 1)
            const b = gridPos(i)
            const x1 = cxOf(i - 1)
            const y1 = cyOf(i - 1)
            const x2 = cxOf(i)
            const y2 = cyOf(i)
            const isLive = i === active
            const reached = i <= active
            const stroke = isLive
              ? 'var(--color-accent)'
              : reached
                ? 'color-mix(in oklab, var(--color-accent) 45%, transparent)'
                : 'var(--color-border-hi)'
            const arrow = reached ? 'url(#sf-arr-a)' : 'url(#sf-arr)'

            // same row → straight; row change → elbow down then across
            let d: string
            let labelX = (x1 + x2) / 2
            let labelY = (y1 + y2) / 2 - 6
            if (a.row === b.row) {
              const dir = x2 >= x1 ? 1 : -1
              const sx = x1 + dir * (NODE_W / 2)
              const ex = x2 - dir * (NODE_W / 2)
              d = `M ${sx} ${y1} H ${ex}`
              labelX = (sx + ex) / 2
              labelY = y1 - 7
            } else {
              // drop from bottom of node a, across, up into node b
              const sy = y1 + NODE_H / 2
              const ey = y2 - NODE_H / 2
              const my = (sy + ey) / 2
              d = `M ${x1} ${sy} V ${my} H ${x2} V ${ey}`
              labelX = (x1 + x2) / 2
              labelY = my - 5
            }

            return (
              <g key={`e-${i}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isLive ? 1.8 : 1.2}
                  markerEnd={arrow}
                  style={{ transition: 'stroke 300ms ease, stroke-width 300ms ease' }}
                />
                {/* traveling packet on the live edge */}
                {isLive && !reduced && (
                  <circle r="3.4" fill="var(--color-accent)">
                    <animateMotion dur="0.7s" begin="0s" fill="freeze" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.16 1 0.3 1" />
                    <animate attributeName="opacity" values="0;1;1;0.2" keyTimes="0;0.15;0.85;1" dur="0.7s" fill="freeze" />
                  </circle>
                )}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontFamily={FM}
                  fontSize="8"
                  fill={reached ? 'var(--color-fg)' : 'var(--color-muted)'}
                  style={{ transition: 'fill 300ms ease' }}
                >
                  {stage.edge}
                </text>
              </g>
            )
          })}

          {/* ── stage nodes ──────────────────────────────────── */}
          {stages.map((stage, i) => {
            const { row, col } = gridPos(i)
            const x = nodeX(col)
            const y = nodeY(row)
            const reached = i <= active
            const isLive = i === active
            const primary = stage.variant === 'primary'
            const gate = stage.variant === 'gate'
            return (
              <g
                key={stage.tag}
                style={{ opacity: reached ? 1 : 0.5, transition: 'opacity 300ms ease' }}
              >
                <rect
                  x={x}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="9"
                  fill={isLive ? 'color-mix(in oklab, var(--color-accent) 14%, var(--color-surface))' : primary ? 'var(--color-surface-hi)' : 'var(--color-surface)'}
                  stroke={isLive || reached ? 'var(--color-accent)' : 'var(--color-border-hi)'}
                  strokeWidth={isLive ? 2 : 1.25}
                  strokeDasharray={gate ? '5 4' : undefined}
                  style={{ transition: 'stroke 300ms ease, fill 300ms ease, stroke-width 300ms ease' }}
                />
                {/* live halo */}
                {isLive && !reduced && (
                  <rect x={x - 3} y={y - 3} width={NODE_W + 6} height={NODE_H + 6} rx="11" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.35">
                    <animate attributeName="opacity" values="0.5;0.12;0.5" dur="1.6s" repeatCount="indefinite" />
                  </rect>
                )}
                <text x={x + 11} y={y + 21} fontFamily={FM} fontSize="10" fontWeight="600" letterSpacing="0.06em" fill="var(--color-accent)">
                  {stage.tag}
                </text>
                <text x={x + 11} y={y + 39} fontFamily={FS} fontSize="12" fontWeight="500" fill={reached ? 'var(--color-fg)' : 'var(--color-muted)'} style={{ transition: 'fill 300ms ease' }}>
                  {stage.label}
                </text>
              </g>
            )
          })}

          {/* ── audit rail ───────────────────────────────────── */}
          <line
            x1={PAD}
            y1={auditY}
            x2={W - PAD}
            y2={auditY}
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <text x={PAD} y={auditY - 8} fontFamily={FM} fontSize="9" letterSpacing="0.08em" fill="var(--color-muted)">
            AUDIT CHAIN (P10) — hash-linked, append-only
          </text>
          {auditRevealed.map((s, k) => {
            const total = stages.filter((st) => st.audit).length
            const span = W - PAD * 2
            const ax = PAD + ((k + 0.5) / total) * span
            const fromX = cxOf(s.i)
            const fromY = cyOf(s.i) + NODE_H / 2
            const isLatest = s.i === active
            return (
              <g key={`a-${s.i}`} style={{ animation: reduced ? undefined : 'seq-step-in 360ms var(--ease-out-expo) both' }}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={ax}
                  y2={auditY}
                  stroke={isLatest ? 'var(--color-accent)' : 'color-mix(in oklab, var(--color-accent) 35%, transparent)'}
                  strokeWidth={isLatest ? 1.4 : 1}
                  strokeDasharray="2 3"
                  markerEnd="url(#sf-arr-a)"
                />
                <circle cx={ax} cy={auditY} r={isLatest ? 4 : 3} fill="var(--color-accent)" opacity={isLatest ? 1 : 0.7} />
                <text x={ax} y={auditY + 16} textAnchor="middle" fontFamily={FM} fontSize="7.5" fill="var(--color-muted)">
                  {s.audit}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* live caption */}
      <p className="sf-caption" aria-live="polite">
        {liveStage ? (
          <>
            <span className="sf-caption-tag">{liveStage.tag}</span>
            {liveStage.caption}
          </>
        ) : (
          systemFlow.subtitle
        )}
      </p>

      {/* controls */}
      {!reduced && (
        <div className="seq-player" role="group" aria-label="Playback controls for the system flow">
          <button type="button" className="seq-btn" onClick={() => (playing ? stop() : play())} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="seq-btn"
            onClick={() => {
              stop()
              setHasPlayed(true)
              setActive((a) => Math.max(-1, a - 1))
            }}
            disabled={active < 0}
            aria-label="Previous stage"
          >
            ‹
          </button>
          <button
            type="button"
            className="seq-btn"
            onClick={() => {
              stop()
              setHasPlayed(true)
              setActive((a) => Math.min(n - 1, a + 1))
            }}
            disabled={active >= n - 1}
            aria-label="Next stage"
          >
            ›
          </button>
          <input
            type="range"
            className="seq-scrub"
            min={-1}
            max={n - 1}
            value={active}
            step={1}
            onChange={(e) => {
              stop()
              setHasPlayed(true)
              setActive(Number(e.target.value))
            }}
            aria-label="Scrub stages"
          />
          <span className="seq-count" aria-live="polite">
            {Math.max(0, active + 1)} / {n}
          </span>
          <button
            type="button"
            className={`seq-btn seq-btn-toggle${loop ? ' is-on' : ''}`}
            onClick={() => setLoop((v) => !v)}
            aria-pressed={loop}
            aria-label={loop ? 'Looping on' : 'Looping off'}
            title={loop ? 'Looping on' : 'Looping off'}
          >
            ↻
          </button>
        </div>
      )}
    </div>
  )
}
