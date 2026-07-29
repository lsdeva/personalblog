'use client'

import { useEffect, useRef, useState } from 'react'
import { systemFlow } from '@/diagrams/system-flow'

const FM = 'var(--font-mono)'
const FS = 'var(--font-sans)'

const NODE_W = 150
const NODE_H = 54
const STEP_MS = 950 // dwell per trace hop while playing
const END_HOLD_MS = 1500

// Text is left-anchored at n.x + 12, so the room before the right edge is the
// box width minus that inset and a small right margin.
const SF_TEXT_W = NODE_W - 12 - 10

/** Clamp an over-wide SVG text run to `SF_TEXT_W` via textLength; undefined (no
 *  clamp) when it already fits. perCharEm ≈ average glyph advance for the font. */
function sfFit(text: string, fontSize: number, perCharEm: number, letterSpacing = 0): number | undefined {
  const est = text.length * (fontSize * perCharEm + letterSpacing)
  return est > SF_TEXT_W ? SF_TEXT_W : undefined
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

/** Trim a segment so it starts/ends on the node-box border, not the centre. */
function trimToBox(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const hw = NODE_W / 2 + 4
  const hh = NODE_H / 2 + 4
  const clip = (cx: number, cy: number, tx: number, ty: number) => {
    const dx = tx - cx
    const dy = ty - cy
    if (dx === 0 && dy === 0) return { x: cx, y: cy }
    const sx = dx !== 0 ? hw / Math.abs(dx) : Infinity
    const sy = dy !== 0 ? hh / Math.abs(dy) : Infinity
    const s = Math.min(sx, sy)
    return { x: cx + dx * s, y: cy + dy * s }
  }
  const p1 = clip(ax, ay, bx, by)
  const p2 = clip(bx, by, ax, ay)
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
}

export function SystemFlow() {
  const { nodes, edges, auditSources, trace, vw, vh } = systemFlow
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const cx = (id: string) => (byId.get(id)?.x ?? 0) + NODE_W / 2
  const cy = (id: string) => (byId.get(id)?.y ?? 0) + NODE_H / 2

  const reduced = usePrefersReducedMotion()
  const W = vw
  const H = vh

  // active = index of the trace hop the packet is currently on (-1 = idle).
  const [active, setActive] = useState(trace.length - 1) // SSR/no-JS: fully lit
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [hasPlayed, setHasPlayed] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const stop = () => {
    setPlaying(false)
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }
  const play = () => {
    setHasPlayed(true)
    setActive((a) => (a >= trace.length - 1 ? -1 : a))
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing) return
    if (active >= trace.length - 1) {
      if (!loop) {
        setPlaying(false)
        return
      }
      timerRef.current = window.setTimeout(() => setActive(-1), END_HOLD_MS)
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current)
      }
    }
    timerRef.current = window.setTimeout(() => setActive((a) => a + 1), active < 0 ? 420 : STEP_MS)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [playing, active, trace.length, loop])

  useEffect(() => {
    if (reduced) {
      stop()
      setActive(trace.length - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, trace.length])

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
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, hasPlayed])

  // Visited nodes + the live node (the trace hop the packet just reached).
  const visited = new Set<string>()
  for (let i = 0; i <= active && i < trace.length; i++) visited.add(trace[i])
  const liveNode = active >= 0 && active < trace.length ? trace[active] : null
  const prevNode = active > 0 && active < trace.length ? trace[active - 1] : null

  // The live trace segment (prev -> live) gets the travelling packet.
  let livePath: { x1: number; y1: number; x2: number; y2: number } | null = null
  if (prevNode && liveNode && prevNode !== liveNode) {
    livePath = trimToBox(cx(prevNode), cy(prevNode), cx(liveNode), cy(liveNode))
  }

  const auditNode = byId.get('audit')!
  const auditCx = auditNode.x + NODE_W / 2
  const auditTop = auditNode.y

  return (
    <div className="seq-diagram seq-console my-10 w-full" ref={rootRef}>
      <div className="seq-head">
        <span className="seq-head-rule" aria-hidden="true" />
        <span className="seq-head-code">{systemFlow.code}</span>
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
            <marker id="sf-arr" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <path d="M0,0 L0,8 L7,4 z" fill="var(--color-border-hi)" />
            </marker>
            <marker id="sf-arr-a" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <path d="M0,0 L0,8 L7,4 z" fill="var(--color-accent)" />
            </marker>
            <marker id="sf-arr-d" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <path d="M0,0 L0,8 L7,4 z" fill="var(--color-danger, #e0556b)" />
            </marker>
          </defs>

          {/* ── audit fan-in (dotted links into the chain) ───────── */}
          {auditSources.map((id) => {
            const seg = trimToBox(cx(id), cy(id), auditCx, auditTop - 6)
            const on = visited.has(id)
            return (
              <line
                key={`af-${id}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={auditCx}
                y2={auditTop - 4}
                stroke={on ? 'var(--color-accent)' : 'var(--color-border)'}
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity={on ? 0.7 : 0.4}
                style={{ transition: 'stroke 300ms ease, opacity 300ms ease' }}
              />
            )
          })}

          {/* ── structural edges ─────────────────────────────────── */}
          {edges.map((e, i) => {
            const seg = trimToBox(cx(e.from), cy(e.from), cx(e.to), cy(e.to))
            const danger = e.tone === 'danger'
            // an edge is "on" once both endpoints have been visited in order
            const on = visited.has(e.from) && visited.has(e.to)
            const stroke = danger
              ? 'var(--color-danger, #e0556b)'
              : on
                ? 'var(--color-accent)'
                : 'var(--color-border-hi)'
            const arrow = danger ? 'url(#sf-arr-d)' : on ? 'url(#sf-arr-a)' : 'url(#sf-arr)'
            const mx = (seg.x1 + seg.x2) / 2
            const my = (seg.y1 + seg.y2) / 2
            const lw = e.label.length * 5 + 8
            return (
              <g key={`e-${i}`} opacity={e.faint ? 0.5 : 1}>
                <line
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke={stroke}
                  strokeWidth={on || danger ? 1.6 : 1.2}
                  strokeDasharray={e.faint ? '5 5' : undefined}
                  markerEnd={arrow}
                  style={{ transition: 'stroke 320ms ease, stroke-width 320ms ease' }}
                />
                <rect x={mx - lw / 2} y={my - 8} width={lw} height={14} rx="3" fill="#08090c" opacity="0.85" />
                <text
                  x={mx}
                  y={my + 2}
                  textAnchor="middle"
                  fontFamily={FM}
                  fontSize="8.5"
                  fill={danger ? 'var(--color-danger, #e0556b)' : on ? 'var(--color-fg)' : 'var(--color-muted)'}
                  style={{ transition: 'fill 320ms ease' }}
                >
                  {e.label}
                </text>
              </g>
            )
          })}

          {/* ── travelling packet on the live trace segment ──────── */}
          {livePath && !reduced && (
            <g key={`pkt-${active}`}>
              <line
                x1={livePath.x1}
                y1={livePath.y1}
                x2={livePath.x2}
                y2={livePath.y2}
                stroke="var(--color-accent)"
                strokeWidth="2.2"
                opacity="0.9"
              />
              <circle r="4.5" fill="var(--color-accent)">
                <animate
                  attributeName="cx"
                  from={livePath.x1}
                  to={livePath.x2}
                  dur="0.7s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.16 1 0.3 1"
                  keyTimes="0;1"
                />
                <animate
                  attributeName="cy"
                  from={livePath.y1}
                  to={livePath.y2}
                  dur="0.7s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.16 1 0.3 1"
                  keyTimes="0;1"
                />
                <animate attributeName="opacity" values="0;1;1;0.3" keyTimes="0;0.15;0.8;1" dur="0.7s" fill="freeze" />
              </circle>
            </g>
          )}

          {/* ── nodes ────────────────────────────────────────────── */}
          {nodes.map((n) => {
            const on = visited.has(n.id)
            const live = n.id === liveNode
            return (
              <g key={n.id} style={{ opacity: on ? 1 : 0.55, transition: 'opacity 300ms ease' }}>
                {live && !reduced && (
                  <rect
                    x={n.x - 4}
                    y={n.y - 4}
                    width={NODE_W + 8}
                    height={NODE_H + 8}
                    rx="12"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1"
                    opacity="0.4"
                  >
                    <animate attributeName="opacity" values="0.55;0.12;0.55" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}
                <rect
                  x={n.x}
                  y={n.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="10"
                  fill={live ? 'color-mix(in oklab, var(--color-accent) 16%, var(--color-surface))' : 'var(--color-surface)'}
                  stroke={on ? 'var(--color-accent)' : 'var(--color-border-hi)'}
                  strokeWidth={live ? 2 : 1.25}
                  style={{ transition: 'stroke 300ms ease, fill 300ms ease, stroke-width 300ms ease' }}
                />
                {n.tag && (
                  <text
                    x={n.x + NODE_W - 10}
                    y={n.y + 16}
                    textAnchor="end"
                    fontFamily={FM}
                    fontSize="9"
                    fontWeight="600"
                    letterSpacing="0.05em"
                    fill="var(--color-accent)"
                  >
                    {n.tag}
                  </text>
                )}
                <text
                  x={n.x + 12}
                  y={n.y + 23}
                  fontFamily={FS}
                  fontSize="13"
                  fontWeight="500"
                  fill={on ? 'var(--color-ink)' : 'var(--color-fg)'}
                  textLength={sfFit(n.label, 13, 0.56)}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text
                    x={n.x + 12}
                    y={n.y + 40}
                    fontFamily={FM}
                    fontSize="8.5"
                    letterSpacing="0.02em"
                    fill="var(--color-muted)"
                    textLength={sfFit(n.sub, 8.5, 0.6, 0.02)}
                    lengthAdjust="spacingAndGlyphs"
                  >
                    {n.sub}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* live caption */}
      <p className="sf-caption" aria-live="polite">
        {systemFlow.caption}
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
            aria-label="Previous step"
          >
            ‹
          </button>
          <button
            type="button"
            className="seq-btn"
            onClick={() => {
              stop()
              setHasPlayed(true)
              setActive((a) => Math.min(trace.length - 1, a + 1))
            }}
            disabled={active >= trace.length - 1}
            aria-label="Next step"
          >
            ›
          </button>
          <input
            type="range"
            className="seq-scrub"
            min={-1}
            max={trace.length - 1}
            value={active}
            step={1}
            onChange={(e) => {
              stop()
              setHasPlayed(true)
              setActive(Number(e.target.value))
            }}
            aria-label="Scrub trace"
          />
          <span className="seq-count" aria-live="polite">
            {Math.max(0, active + 1)} / {trace.length}
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
