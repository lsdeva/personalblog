'use client'

import { forwardRef, useEffect, useMemo, useRef, useImperativeHandle } from 'react'
import gsap from 'gsap'
import type { DiagramSpec } from './diagram.types'
import { cellToPx, nodeRect, totalViewBox, CELL_W, CELL_H } from './diagram-geometry'
import { useScrollScene } from '@/components/scroll/useScrollScene'

interface ArchitectureDiagramProps {
  spec: DiagramSpec
  descriptionId?: string
  /** If true, skip rendering the <svg>'s viewBox attribute — caller controls it
   *  (e.g. DiagramTour animates viewBox over scroll). */
  externallyControlledViewBox?: boolean
}

export interface ArchitectureDiagramHandle {
  getSvg: () => SVGSVGElement | null
}

export const ArchitectureDiagram = forwardRef<ArchitectureDiagramHandle, ArchitectureDiagramProps>(
  function ArchitectureDiagram(
    { spec, descriptionId, externallyControlledViewBox = false },
    handleRef,
  ) {
    const { activeStep, prefersReducedMotion } = useScrollScene()
    const svgRef = useRef<SVGSVGElement>(null)

    useImperativeHandle(handleRef, () => ({
      getSvg: () => svgRef.current,
    }))

    const defaultViewBox = useMemo(() => totalViewBox(spec.nodes), [spec.nodes])

    const currentScene = useMemo(() => {
      const name = activeStep && spec.scenes[activeStep] ? activeStep : spec.defaultScene
      return { name, state: spec.scenes[name] ?? {} }
    }, [activeStep, spec])

    // Apply scene state: highlight, dim, pulse, activeEdges. Camera (viewBox) is
    // either set once here from the default or animated externally by DiagramTour.
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
      const hasHighlight = highlights.size > 0

      const tl = gsap.timeline({ defaults: { duration, ease } })

      spec.nodes.forEach((node) => {
        const el = root.querySelector<SVGGElement>(`[data-node="${node.id}"]`)
        if (!el) return
        const isLit = hasHighlight ? highlights.has(node.id) : true
        const isDimmed = dims.has(node.id)
        const isPulsed = pulses.has(node.id)
        tl.to(el, { opacity: isDimmed ? 0.15 : isLit ? 1 : 0.5 }, 0)

        const ring = el.querySelector<SVGRectElement>('[data-ring]')
        if (ring) {
          gsap.killTweensOf(ring)
          if (isPulsed && !prefersReducedMotion) {
            gsap.fromTo(
              ring,
              { opacity: 0.9, scale: 1 },
              {
                opacity: 0,
                scale: 1.1,
                duration: 1.4,
                ease: 'power2.out',
                transformOrigin: 'center center',
                repeat: -1,
              },
            )
          } else if (isLit && hasHighlight) {
            gsap.to(ring, { opacity: 0.55, scale: 1, duration })
          } else {
            gsap.set(ring, { opacity: 0, scale: 1 })
          }
        }
      })

      spec.edges.forEach((edge) => {
        const id = `${edge.from}->${edge.to}`
        const path = root.querySelector<SVGPathElement>(`[data-edge="${id}"]`)
        if (!path) return
        const length = path.getTotalLength()
        const isActive = activeEdges.has(id)
        path.setAttribute('stroke-dasharray', String(length))

        tl.to(
          path,
          {
            strokeDashoffset: isActive ? 0 : length,
            opacity: isActive ? 1 : 0.3,
            stroke: isActive ? 'var(--color-accent)' : 'var(--color-border-hi)',
          },
          0,
        )
      })

      return () => {
        tl.kill()
      }
    }, [currentScene, spec.nodes, spec.edges, prefersReducedMotion])

    const titleId = `diag-${spec.id}-title`
    const descId = descriptionId ?? `diag-${spec.id}-desc`

    const initialViewBox = `${defaultViewBox.x} ${defaultViewBox.y} ${defaultViewBox.width} ${defaultViewBox.height}`

    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        {!descriptionId && (
          <p id={descId} className="sr-only">
            {spec.a11yDescription}
          </p>
        )}

        <svg
          ref={svgRef}
          viewBox={initialViewBox}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          style={{
            maxWidth: externallyControlledViewBox ? '100%' : 'min(760px, 92vw)',
            maxHeight: externallyControlledViewBox ? '100%' : undefined,
          }}
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

          <g>
            {spec.edges.map((edge) => {
              const from = spec.nodes.find((n) => n.id === edge.from)
              const to = spec.nodes.find((n) => n.id === edge.to)
              if (!from || !to) return null
              const a = cellToPx(from.x, from.y)
              const b = cellToPx(to.x, to.y)
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

          <g>
            {spec.nodes.map((node) => {
              const { x, y, w, h } = nodeRect(node.x, node.y)
              const variant = node.variant ?? 'secondary'
              const isPrimary = variant === 'primary'
              const isGhost = variant === 'ghost'

              return (
                <g key={node.id} data-node={node.id} style={{ willChange: 'opacity, transform' }}>
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
      </div>
    )
  },
)
