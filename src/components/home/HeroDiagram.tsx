// Server-rendered, CSS-animated architecture diagram for the hero.
// Deliberately not a client component: the home page ships no GSAP, so the
// signature moment has to come from SVG + CSS alone (see globals.css, "Hero
// diagram" section). Drawn in the same visual dialect as ArchitectureDiagram —
// grid-aligned rect nodes, mono uppercase labels, dashed flow edges.

interface NodeProps {
  x: number
  y: number
  label: string
  sub: string
  accent?: boolean
}

const NODE_W = 128
const NODE_H = 56

function Node({ x, y, label, sub, accent }: NodeProps) {
  return (
    <g className={`hd-node ${accent ? 'hd-node-accent' : ''}`}>
      <rect x={x} y={y} width={NODE_W} height={NODE_H} />
      <text x={x + NODE_W / 2} y={y + 25} textAnchor="middle" className="hd-label">
        {label}
      </text>
      <text x={x + NODE_W / 2} y={y + 41} textAnchor="middle" className="hd-sub">
        {sub}
      </text>
    </g>
  )
}

export function HeroDiagram() {
  return (
    <div className="hero-diagram" aria-hidden="true">
      <svg viewBox="0 0 560 420" fill="none" role="presentation" focusable="false">
        <defs>
          <marker
            id="hd-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0.8 L7.2 4 L0 7.2 Z" className="hd-arrowhead" />
          </marker>
        </defs>

        {/* static edges (structure) */}
        <path d="M144 60 H216" className="hd-edge" markerEnd="url(#hd-arrow)" />
        <path d="M344 60 H416" className="hd-edge" markerEnd="url(#hd-arrow)" />
        <path d="M280 88 V172" className="hd-edge" markerEnd="url(#hd-arrow)" />
        <path d="M480 88 V172" className="hd-edge" markerEnd="url(#hd-arrow)" />
        <path d="M280 228 V312" className="hd-edge" markerEnd="url(#hd-arrow)" />
        <path d="M416 200 H344" className="hd-edge" markerEnd="url(#hd-arrow)" />
        <path d="M144 186 L216 78" className="hd-edge" markerEnd="url(#hd-arrow)" />

        {/* animated flow overlays (current) */}
        <path d="M144 60 H216" className="hd-flow" />
        <path d="M344 60 H416" className="hd-flow" />
        <path d="M280 88 V172" className="hd-flow" style={{ animationDelay: '-0.4s' }} />
        <path d="M480 88 V172" className="hd-flow" style={{ animationDelay: '-0.8s' }} />

        {/* request packets riding the paths (hidden where offset-path unsupported) */}
        <circle r="3" className="hd-packet" style={{ offsetPath: "path('M144 60 L416 60')" }} />
        <circle
          r="3"
          className="hd-packet"
          style={{ offsetPath: "path('M280 88 L280 312')", animationDelay: '1.6s' }}
        />
        <circle
          r="3"
          className="hd-packet"
          style={{ offsetPath: "path('M480 88 L480 200 L344 200')", animationDelay: '3.1s' }}
        />

        {/* halo behind the gateway — the system's heartbeat */}
        <rect x={210} y={26} width={NODE_W + 12} height={NODE_H + 12} className="hd-halo" />

        <Node x={16} y={32} label="CLIENT" sub="untrusted input" />
        <Node x={216} y={32} label="GATEWAY" sub="authn · schema · rate" accent />
        <Node x={416} y={32} label="MODEL" sub="pinned version" />
        <Node x={16} y={158} label="TOOLS" sub="scoped capabilities" />
        <Node x={216} y={172} label="POLICY" sub="default deny" />
        <Node x={416} y={172} label="EVALS" sub="regression gate" />
        <Node x={216} y={312} label="AUDIT LOG" sub="append-only" />

        {/* status line */}
        <circle cx={224} cy={396} r={3} className="hd-status" />
        <text x={234} y={400} className="hd-caption">
          fig.00 — a system an auditor can replay
        </text>
      </svg>
    </div>
  )
}
