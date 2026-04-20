'use client'

import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import type { DiagramSpec } from './diagram.types'
import { useScrollScene } from '@/components/scroll/useScrollScene'

interface ArchitectureDiagramProps {
  spec: DiagramSpec
  /** Optional override for the aria-describedby target id; useful if the article
   *  places a visually-hidden prose description itself. */
  descriptionId?: string
}

/* ---------- grid geometry ---------- */

const CELL_W = 200
const CELL_H = 100
const CELL_GAP_X = 40
const CELL_GAP_Y = 56
const PAD = 32

function cellToPx(x: number, y: number) {
  return {
    cx: PAD + x * (CELL_W + CELL_GAP_X) + CELL_W / 2,
    cy: PAD + y * (CELL_H + CELL_GAP_Y) + CELL_H / 2,
  }
}

function nodeRect(x: number, y: number) {
  return {
    x: PAD + x * (CELL_W + CELL_GAP_X),
    y: PAD + y * (CELL_H + CELL_GAP_Y),
    w: CELL_W,
    h: CELL_H,
  }
}

/* ---------- component ---------- */

export function ArchitectureDiagram({ spec, descriptionId }: ArchitectureDiagramProps) {
  const { activeStep, prefersReducedMotion } = useScrollScene()
  const svgRef = useRef<SVGSVGElement>(null)

  const { width, height } = useMemo(() => {
    const maxX = Math.max(...spec.nodes.map((n) => n.x))
    const maxY = Math.max(...spec.nodes.map((n) => n.y))
    return {
      width: PAD * 2 + (maxX + 1) * CELL_W + maxX * CELL_GAP_X,
      height: PAD * 2 + (maxY + 1) * CELL_H + maxY * CELL_GAP_Y,
    }
  }, [spec.nodes])

  const currentScene = useMemo(() => {
    const name = activeStep && spec.scenes[activeStep] ? activeStep : spec.defaultScene
    return { name, state: spec.scenes[name] ?? {} }
  }, [activeStep, spec])

  // Apply scene state: fade highlighted nodes in, dim others, draw active edges.
  useEffect(() => {
    if (!svgRef.current) return
    const root = svgRef.current
    const duration = prefersReducedMotion ? 0 : 0.6
    const ease = 'power3.out'

    const state = currentScene.state
    const highlights = new Set(state.highlight ?? [])
    const dims = new Set(state.dim ?? [])
    const pulses = new Set(state.pulse ?? [])
    const activeEdges = new Set(state.activeEdges ?? [])
    // If `highlight` is unset we treat all nodes as equally lit.
    const hasHighlight = highlights.size > 0

    const tl = gsap.timeline({ defaults: { duration, ease } })

    // Nodes
    spec.nodes.forEach((node) => {
      const el = root.querySelector<SVGGElement>(`[data-node="${node.id}"]`)
      if (!el) return
      const isLit = hasHighlight ? highlights.has(node.id) : true
      const isDimmed = dims.has(node.id)
      tl.to(
        el,
        {
          opacity: isDimmed ? 0.25 : isLit ? 1 : 0.45,
        },
        0,
      )
      // Pulse: use a separate infinite sub-tween on the inner highlight ring.
      const ring = el.querySelector<SVGRectElement>('[data-ring]')
      if (ring) {
        gsap.killTweensOf(ring)
        if (pulses.has(node.id) && !prefersReducedMotion) {
          gsap.fromTo(
            ring,
            { opacity: 0.9, scale: 1 },
            {
              opacity: 0,
              scale: 1.08,
              duration: 1.4,
              ease: 'power2.out',
              transformOrigin: 'center center',
              repeat: -1,
            },
          )
        } else {
          gsap.set(ring, { opacity: 0, scale: 1 })
        }
      }
    })

    // Edges
    spec.edges.forEach((edge) => {
      const id = `${edge.from}->${edge.to}`
      const path = root.querySelector<SVGPathElement>(`[data-edge="${id}"]`)
      if (!path) return
      const length = path.getTotalLength()
      const isActive = activeEdges.has(id)

      // Initialize dashoffset so first run draws cleanly.
      const currentOffset = Number(path.getAttribute('data-dashoffset') ?? length)
      path.setAttribute('stroke-dasharray', String(length))

      tl.to(
        path,
        {
          strokeDashoffset: isActive ? 0 : length,
          opacity: isActive ? 1 : 0.3,
          stroke: isActive ? 'var(--color-accent)' : 'var(--color-border-hi)',
          onUpdate: () => {
            // stash so we don't reset mid-transition
            path.setAttribute(
              'data-dashoffset',
              String(gsap.getProperty(path, 'strokeDashoffset')),
            )
          },
        },
        0,
      )
      void currentOffset
    })

    return () => {
      tl.kill()
    }
  }, [currentScene, spec.nodes, spec.edges, prefersReducedMotion])

  const titleId = `diag-${spec.id}-title`
  const descId = descriptionId ?? `diag-${spec.id}-desc`

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Screen-reader description (hidden visually, not from a11y tree). */}
      {!descriptionId && (
        <p id={descId} className="sr-only">
          {spec.a11yDescription}
        </p>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="h-auto w-full max-w-[560px] max-h-[55vh] md:max-h-[70vh]"
      >
        <title id={titleId}>{spec.title}</title>

        <defs>
          <marker
            id={`arrow-base-${spec.id}`}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="var(--color-border-hi)" />
          </marker>
          <marker
            id={`arrow-accent-${spec.id}`}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="var(--color-accent)" />
          </marker>
        </defs>

        {/* Edges first, so they sit behind the nodes. */}
        <g>
          {spec.edges.map((edge) => {
            const from = spec.nodes.find((n) => n.id === edge.from)
            const to = spec.nodes.find((n) => n.id === edge.to)
            if (!from || !to) return null
            const a = cellToPx(from.x, from.y)
            const b = cellToPx(to.x, to.y)
            // Clamp to box edges so lines visibly enter/leave the nodes.
            const sameCol = from.x === to.x
            const sameRow = from.y === to.y
            const y1 = sameCol ? a.cy + (b.cy > a.cy ? CELL_H / 2 : -CELL_H / 2) : a.cy
            const y2 = sameCol ? b.cy + (b.cy > a.cy ? -CELL_H / 2 : CELL_H / 2) : b.cy
            const x1 = sameRow ? a.cx + (b.cx > a.cx ? CELL_W / 2 : -CELL_W / 2) : a.cx
            const x2 = sameRow ? b.cx + (b.cx > a.cx ? -CELL_W / 2 : CELL_W / 2) : b.cx
            const d = `M ${x1} ${y1} L ${x2} ${y2}`
            const id = `${edge.from}->${edge.to}`
            const accent = edge.variant === 'emphasis'
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2

            return (
              <g key={id}>
                <path
                  data-edge={id}
                  d={d}
                  fill="none"
                  stroke={accent ? 'var(--color-accent)' : 'var(--color-border-hi)'}
                  strokeWidth="1.5"
                  markerEnd={`url(#arrow-${accent ? 'accent' : 'base'}-${spec.id})`}
                  opacity={0.3}
                />
                {edge.label && (
                  <text
                    x={midX + 10}
                    y={midY - 6}
                    fill="var(--color-muted)"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    letterSpacing="0.08em"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* Nodes */}
        <g>
          {spec.nodes.map((node) => {
            const { x, y, w, h } = nodeRect(node.x, node.y)
            const variant = node.variant ?? 'secondary'
            const isPrimary = variant === 'primary'
            const isGhost = variant === 'ghost'

            return (
              <g key={node.id} data-node={node.id} style={{ willChange: 'opacity, transform' }}>
                {/* Pulse ring — sized outside the rect so it radiates out. */}
                <rect
                  data-ring
                  x={x - 4}
                  y={y - 4}
                  width={w + 8}
                  height={h + 8}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1"
                  opacity="0"
                  style={{ transformOrigin: 'center center' }}
                />
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={isPrimary ? 'var(--color-surface-hi)' : 'transparent'}
                  stroke={
                    isGhost
                      ? 'var(--color-border)'
                      : isPrimary
                        ? 'var(--color-accent)'
                        : 'var(--color-border-hi)'
                  }
                  strokeWidth="1.25"
                  strokeDasharray={isGhost ? '4 4' : undefined}
                />
                <text
                  x={x + w / 2}
                  y={y + h / 2 + (node.sublabel ? -6 : 5)}
                  textAnchor="middle"
                  fill={isPrimary ? 'var(--color-ink)' : 'var(--color-fg)'}
                  fontFamily="var(--font-sans)"
                  fontSize="15"
                  fontWeight={500}
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 14}
                    textAnchor="middle"
                    fill="var(--color-muted)"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    letterSpacing="0.06em"
                  >
                    {node.sublabel}
                  </text>
                )}
                {node.tag && (
                  <text
                    x={x + w - 10}
                    y={y + 14}
                    textAnchor="end"
                    fill={isPrimary ? 'var(--color-accent)' : 'var(--color-muted)'}
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    letterSpacing="0.18em"
                  >
                    {node.tag.toUpperCase()}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {currentScene.state.caption && (
        <p className="text-kicker mt-6 text-center">{currentScene.state.caption}</p>
      )}
    </div>
  )
}
