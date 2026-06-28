// Static poster frame for the ATCP film — the ATCP stack at rest.
// Lives in its own module so the lazy wrapper can show it as the placeholder
// WITHOUT pulling the heavy timeline engine into the home First Load chunk.
// Used both as the reduced-motion fallback and the dynamic-import loading state.

export function Poster() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label="ATCP × EU AI Act"
    >
      <rect width="1000" height="1000" fill="#0B1220" />
      <g stroke="oklch(0.72 0.13 235)" strokeWidth="7" opacity="0.55">
        <line x1="500" y1="370" x2="500" y2="440" />
        <line x1="500" y1="560" x2="500" y2="630" />
      </g>
      <g fill="#131D2F" stroke="oklch(0.72 0.13 235)" strokeWidth="7">
        <rect x="360" y="300" width="280" height="80" rx="16" />
        <rect x="360" y="460" width="280" height="80" rx="16" />
        <rect x="360" y="620" width="280" height="80" rx="16" />
      </g>
      <text
        x="500"
        y="800"
        fontFamily="var(--font-serif)"
        fontSize="62"
        fill="#F2EFE8"
        textAnchor="middle"
      >
        ATCP
      </text>
      <text
        x="500"
        y="858"
        fontFamily="var(--font-mono)"
        fontSize="26"
        fill="oklch(0.72 0.13 292)"
        textAnchor="middle"
      >
        × EU AI ACT
      </text>
    </svg>
  )
}

export function PosterFrame() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1920 / 1080',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0B1220',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
      }}
    >
      <Poster />
    </div>
  )
}
