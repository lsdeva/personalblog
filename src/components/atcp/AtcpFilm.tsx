'use client'

// ATCP × EU AI Act — a self-contained timeline "film" for the landing page.
//
// Ported from the social-video export (a React timeline engine: Stage/Sprite/
// easing + six scenes). Adapted for "land and watch":
//   • auto-plays + loops only while scrolled into view (IntersectionObserver);
//     pauses off-screen to spare the RAF loop.
//   • prefers-reduced-motion → renders a static poster frame, no animation.
//   • minimal scrub/pause bar that fades in on hover.
//   • carries its own dark "film" palette by design (like ResearchLineage),
//     but reuses the site's already-loaded fonts (--font-serif/sans/mono),
//     so it adds zero extra font weight.
//
// This is the 1920×1080 widescreen variant, scaled to fit its container width.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Poster } from './Poster'

// ── Easing ───────────────────────────────────────────────────────────────────
type EaseFn = (t: number) => number
const Easing: Record<string, EaseFn> = {
  linear: (t) => t,
  easeOutQuad: (t) => t * (2 - t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuad: (t) => t * t,
  easeOutBack: (t) => {
    const c1 = 1.70158,
      c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic,
}: {
  from?: number
  to?: number
  start?: number
  end?: number
  ease?: EaseFn
}) {
  return (t: number) => {
    if (t <= start) return from
    if (t >= end) return to
    const local = (t - start) / (end - start)
    return from + (to - from) * ease(local)
  }
}

const eo = Easing.easeOutCubic
const eio = Easing.easeInOutCubic

// ── Timeline + sprite context ─────────────────────────────────────────────────
interface TimelineValue {
  time: number
  duration: number
}
const TimelineContext = createContext<TimelineValue>({ time: 0, duration: 10 })
const useTime = () => useContext(TimelineContext).time

interface SpriteValue {
  localTime: number
  progress: number
  duration: number
  visible: boolean
}
const SpriteContext = createContext<SpriteValue>({
  localTime: 0,
  progress: 0,
  duration: 0,
  visible: true,
})
const useSprite = () => useContext(SpriteContext)

function Sprite({
  start = 0,
  end = Infinity,
  children,
}: {
  start?: number
  end?: number
  children: ReactNode
}) {
  const { time } = useContext(TimelineContext)
  const visible = time >= start && time <= end
  if (!visible) return null
  const duration = end - start
  const localTime = Math.max(0, time - start)
  const progress =
    duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0
  return (
    <SpriteContext.Provider value={{ localTime, progress, duration, visible }}>
      {children}
    </SpriteContext.Provider>
  )
}

// ── Palette + type (film carries its own dark identity) ───────────────────────
const W = 1920,
  H = 1080
const C = {
  ink: '#0B1220',
  panel: '#131D2F',
  line: 'rgba(255,255,255,0.10)',
  hi: '#F2EFE8',
  mid: '#98A3B6',
  dim: '#5C6680',
  azure: 'oklch(0.72 0.13 235)', // ATCP control
  act: 'oklch(0.72 0.13 292)', // EU AI Act
  amber: 'oklch(0.76 0.13 64)', // risk / the gap
  green: 'oklch(0.74 0.12 150)', // verified / recorded
}
// Reuse the site's already-loaded fonts rather than shipping new faces.
const SERIF = 'var(--font-serif)'
const SANS = 'var(--font-sans)'
const MONO = 'var(--font-mono)'

const NODES = (() => {
  let s = 9176
  const r = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
  const arr: { x: number; y: number; risk: boolean }[] = []
  for (let i = 0; i < 32; i++) arr.push({ x: r(), y: r(), risk: r() < 0.22 })
  return arr
})()

const rise = (lt: number, delay: number, dur = 0.6): CSSProperties => {
  const t = eo(clamp((lt - delay) / dur, 0, 1))
  return { opacity: t, transform: `translateY(${(1 - t) * 22}px)` }
}
const sceneOut = (lt: number, dur: number, outd = 0.5) =>
  clamp((dur - lt) / outd, 0, 1)

function Kicker({
  children,
  color,
}: {
  children: ReactNode
  color?: string
}) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 18,
        fontWeight: 500,
        letterSpacing: '0.34em',
        textTransform: 'uppercase',
        color: color || C.azure,
      }}
    >
      {children}
    </div>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 13,
          background: C.azure,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: 5, background: C.ink }} />
      </div>
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 36,
          color: C.hi,
          letterSpacing: '-0.01em',
        }}
      >
        <span style={{ color: C.azure }}>ai.</span>soa.team
      </span>
    </div>
  )
}

function Backdrop() {
  const t = useTime()
  const gx = 50 + Math.sin(t * 0.16) * 16,
    gy = 42 + Math.cos(t * 0.12) * 9
  const cols = []
  for (let i = 1; i < 16; i++)
    cols.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: (i / 16) * W,
          top: 0,
          width: 1,
          height: H,
          background: C.line,
        }}
      />,
    )
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.ink, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(1150px 820px at ${gx}% ${gy}%, rgba(64,114,196,0.18), rgba(11,18,32,0) 62%)`,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>{cols}</div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1500px 1050px at 50% 124%, rgba(0,0,0,0.5), rgba(0,0,0,0) 60%)',
        }}
      />
    </div>
  )
}

// ── Scene 1 — The agentic shift / attribution gap ─────────────────────────────
function SceneProblem() {
  const { localTime: lt, duration: dur } = useSprite()
  const o = sceneOut(lt, dur)
  const nodes = NODES.map((n, i) => {
    const ap = clamp((lt - 0.3 - i * 0.02) / 0.5, 0, 1)
    const px = 1075 + n.x * 720 + Math.sin(lt * 1.0 + i) * 4
    const py = 150 + n.y * 330 + Math.cos(lt * 0.8 + i * 1.2) * 4
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: px,
          top: py,
          width: 16,
          height: 16,
          borderRadius: 4,
          background: n.risk ? C.amber : 'rgba(152,163,182,0.30)',
          border: `1px solid ${n.risk ? C.amber : C.line}`,
          opacity: ap * (n.risk ? 0.9 : 0.55),
        }}
      />
    )
  })
  const q = eo(clamp((lt - 3.7) / 0.8, 0, 1))
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      {nodes}
      <div style={{ position: 'absolute', left: 160, top: 252, ...rise(lt, 0.1) }}>
        <Kicker color={C.amber}>The agentic shift</Kicker>
      </div>
      <div style={{ position: 'absolute', left: 158, top: 302, ...rise(lt, 0.3, 0.7) }}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: 94,
            lineHeight: 1.02,
            color: C.hi,
            letterSpacing: '-0.02em',
          }}
        >
          AI agents now act
          <br />
          on your behalf.
        </div>
      </div>
      <div
        style={{ position: 'absolute', left: 162, top: 552, width: 760, ...rise(lt, 0.9, 0.7) }}
      >
        <div style={{ fontFamily: SANS, fontSize: 29, lineHeight: 1.5, color: C.mid }}>
          They spend money, call tools and access data — autonomously, and often on behalf
          of one another.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 742,
          opacity: q,
          transform: `translateY(${(1 - q) * 20}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: `2px solid ${C.amber}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.amber,
              fontFamily: SERIF,
              fontSize: 32,
            }}
          >
            ?
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 52, color: C.hi }}>
            When an action goes wrong —{' '}
            <span style={{ color: 'oklch(0.70 0.17 25)' }}>who authorized it?</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Scene 2 — What the EU AI Act demands ──────────────────────────────────────
function SceneAct() {
  const { localTime: lt, duration: dur } = useSprite()
  const o = sceneOut(lt, dur)
  const reqs = [
    ['Art. 14', 'Human oversight', 'Effective oversight, with the ability to intervene or stop'],
    ['Art. 12', 'Record-keeping', 'Automatic logging and end-to-end traceability of events'],
    [
      'Art. 15',
      'Robustness & cybersecurity',
      'Resilience against misuse, manipulation and unauthorized access',
    ],
    ['Art. 9', 'Risk management', 'Identify, evaluate and mitigate risk across the lifecycle'],
    ['Art. 26', 'Accountability', 'Deployers must attribute, monitor and evidence agent use'],
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div style={{ position: 'absolute', left: 160, top: 168, ...rise(lt, 0.1) }}>
        <Kicker color={C.act}>Regulation (EU) — The AI Act</Kicker>
      </div>
      <div
        style={{ position: 'absolute', left: 158, top: 210, width: 1320, ...rise(lt, 0.28, 0.7) }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: 72,
            lineHeight: 1.04,
            color: C.hi,
            letterSpacing: '-0.02em',
          }}
        >
          What the EU AI Act demands of high-risk AI.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 160,
          right: 160,
          top: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {reqs.map((r, i) => {
          const d = 0.6 + i * 0.18,
            a = eo(clamp((lt - d) / 0.5, 0, 1))
          return (
            <div
              key={i}
              style={{
                opacity: a,
                transform: `translateX(${(1 - a) * 26}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '24px 30px',
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  minWidth: 116,
                  fontFamily: MONO,
                  fontSize: 21,
                  color: C.act,
                  letterSpacing: '0.04em',
                }}
              >
                {r[0]}
              </div>
              <div
                style={{
                  width: 440,
                  flexShrink: 0,
                  fontFamily: SERIF,
                  fontSize: 33,
                  color: C.hi,
                  lineHeight: 1.1,
                }}
              >
                {r[1]}
              </div>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 23, color: C.mid }}>
                {r[2]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Scene 3 — ATCP, the principle ─────────────────────────────────────────────
function SceneCore() {
  const { localTime: lt, duration: dur } = useSprite()
  const o = sceneOut(lt, dur)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: o,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 200px',
      }}
    >
      <div style={rise(lt, 0.1)}>
        <Kicker>The control plane</Kicker>
      </div>
      <div
        style={{
          ...rise(lt, 0.35, 0.7),
          marginTop: 26,
          textAlign: 'center',
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: 98,
          lineHeight: 1.0,
          color: C.hi,
          letterSpacing: '-0.02em',
        }}
      >
        Agent Trust Control Plane
      </div>
      <div
        style={{
          ...rise(lt, 0.7, 0.7),
          marginTop: 16,
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          color: C.azure,
        }}
      >
        A T C P
      </div>
      <div
        style={{
          ...rise(lt, 1.2, 0.8),
          marginTop: 54,
          maxWidth: 1200,
          textAlign: 'center',
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: 41,
          lineHeight: 1.42,
          color: C.mid,
        }}
      >
        Every agent action is traceable to a{' '}
        <span style={{ color: C.hi }}>human who authorized it</span> — and that authority is{' '}
        <span style={{ color: C.hi }}>cryptographically attenuable</span>,{' '}
        <span style={{ color: C.hi }}>revocable in real time</span>, and{' '}
        <span style={{ color: C.hi }}>unbypassable by the agent itself</span>.
      </div>
      <div
        style={{
          ...rise(lt, 1.9, 0.7),
          marginTop: 46,
          fontFamily: SANS,
          fontSize: 22,
          color: C.dim,
        }}
      >
        Eleven processes, pressure-tested against the OWASP ASI threat model.
      </div>
    </div>
  )
}

// ── Scene 4 — The architecture (one action, traced) ───────────────────────────
function ArchNode({
  x,
  y,
  w,
  h,
  p,
  title,
  sub,
  accent,
  lt,
  delay,
  active,
  pcolor,
}: {
  x: number
  y: number
  w: number
  h: number
  p: string
  title: string
  sub?: string
  accent?: string
  lt: number
  delay: number
  active?: boolean
  pcolor?: string
}) {
  const a = eo(clamp((lt - delay) / 0.5, 0, 1))
  const ac = accent || C.azure
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: a,
        transform: `translateY(${(1 - a) * 14}px)`,
        background: active ? 'rgba(64,118,200,0.16)' : C.panel,
        border: `1px solid ${active ? ac : C.line}`,
        borderRadius: 13,
        padding: '0 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: active
          ? `0 0 0 1px ${ac}, 0 14px 36px rgba(40,90,170,0.28)`
          : 'none',
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', color: pcolor || ac }}>
        {p}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 23,
          color: C.hi,
          marginTop: 5,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ fontFamily: SANS, fontSize: 16, color: C.mid, marginTop: 3 }}>{sub}</div>
      )}
    </div>
  )
}

function SceneArch() {
  const { localTime: lt, duration: dur } = useSprite()
  const o = sceneOut(lt, dur, 0.5)
  const z = 1 + 0.02 * eio(clamp(lt / dur, 0, 1))
  const dotX = animate({ from: 220, to: 1595, start: 6.0, end: 10.4, ease: eio })(lt)
  const dotOn = lt > 5.8 && lt < 11.2
  const dotFade = clamp((lt - 5.8) / 0.3, 0, 1) * clamp((11.2 - lt) / 0.4, 0, 1)
  const act = (cx: number) => dotOn && Math.abs(dotX - cx) < 72
  const drawn = (d: number, du = 0.5) => eo(clamp((lt - d) / du, 0, 1))
  const L = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    d: number,
    color?: string,
    dashed?: boolean,
  ) => {
    const len = Math.hypot(x2 - x1, y2 - y1),
      p = drawn(d)
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color || 'rgba(152,163,182,0.55)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={dashed ? '2 9' : `${len}`}
        strokeDashoffset={dashed ? 0 : len * (1 - p)}
        opacity={dashed ? 0.4 * p : p}
      />
    )
  }
  const stops = [220, 550, 905, 1260, 1595]
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div style={{ position: 'absolute', left: 160, top: 116, ...rise(lt, 0.1) }}>
        <Kicker>The architecture</Kicker>
      </div>
      <div style={{ position: 'absolute', left: 158, top: 158, ...rise(lt, 0.28, 0.6) }}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: 56,
            color: C.hi,
            letterSpacing: '-0.01em',
          }}
        >
          One action, traced end to end.
        </div>
      </div>
      <div
        style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 56%' }}
      >
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {L(320, 524, 430, 524, 2.0)}
          {L(670, 524, 780, 524, 2.2)}
          {L(1030, 524, 1140, 524, 2.4)}
          {L(1380, 524, 1490, 524, 2.6)}
          {L(905, 384, 905, 470, 3.0, C.azure)}
          {L(1260, 384, 1260, 470, 3.1, C.azure)}
          {L(1260, 700, 1260, 578, 3.2, C.amber)}
          {L(550, 700, 550, 578, 3.0, C.azure)}
          {L(220, 578, 220, 900, 3.6, C.green, true)}
          {L(905, 578, 905, 900, 3.7, C.green, true)}
          {L(1595, 578, 1595, 900, 3.8, C.green, true)}
        </svg>
        <ArchNode lt={lt} delay={0.6} x={120} y={470} w={200} h={108} p="P1 · human" title="Human mandate" sub="signed · scoped" active={act(220)} />
        <ArchNode lt={lt} delay={0.8} x={430} y={470} w={240} h={108} p="P3 · SPIFFE" title="Agent identity" sub="non-spoofable SVID" active={act(550)} />
        <ArchNode lt={lt} delay={1.0} x={780} y={470} w={250} h={108} p="P4 · exchange" title="Capability token" sub="key-bound IBCT" active={act(905)} />
        <ArchNode lt={lt} delay={1.2} x={1140} y={470} w={240} h={108} p="P6 · enforce" title="PEP + policy" sub="unbypassable gate" active={act(1260)} />
        <ArchNode lt={lt} delay={1.4} x={1490} y={470} w={210} h={108} p="resource" title="Tool / API / peer" accent={C.mid} pcolor={C.dim} active={act(1595)} />
        <ArchNode lt={lt} delay={1.7} x={790} y={292} w={230} h={92} p="P9 · consent" title="Human step-up" sub="high-risk pause" />
        <ArchNode lt={lt} delay={1.8} x={1150} y={292} w={220} h={92} p="P8 · budget" title="Spend ceiling" />
        <ArchNode lt={lt} delay={1.9} x={1150} y={700} w={220} h={92} p="P7 · revoke" title="<1s kill-switch" accent={C.amber} pcolor={C.amber} />
        <ArchNode lt={lt} delay={1.75} x={430} y={700} w={240} h={92} p="P2 · policy" title="Default-deny" />
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 900,
            width: 1580,
            height: 72,
            ...rise(lt, 3.4, 0.6),
            background: C.panel,
            border: `1px solid ${C.line}`,
            borderRadius: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 24px',
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', color: C.green }}>
            P10 · P11
          </span>
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.hi }}>
            Tamper-evident audit chain
          </span>
          <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {stops.map((cx, i) => {
              const on = dotOn && dotX > cx - 30
              return (
                <div
                  key={i}
                  style={{
                    width: 124,
                    height: 32,
                    borderRadius: 7,
                    background: on ? 'rgba(76,175,120,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${on ? C.green : C.line}`,
                    opacity: on ? 1 : 0.45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: MONO,
                    fontSize: 13,
                    color: on ? C.green : C.dim,
                  }}
                >
                  {['mandate', 'identity', 'token', 'decision', 'access'][i]}
                </div>
              )
            })}
          </div>
        </div>
        {dotOn && (
          <div
            style={{
              position: 'absolute',
              left: dotX - 9,
              top: 515,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: C.azure,
              opacity: dotFade,
              boxShadow: `0 0 0 6px rgba(64,118,200,0.22), 0 0 24px 4px ${C.azure}`,
            }}
          />
        )}
      </div>
    </div>
  )
}

// ── Scene 5 — The mapping: Act requirement ↔ ATCP controls ────────────────────
const MAP = [
  {
    art: 'Art. 14',
    req: 'Human oversight',
    controls: ['P1 — Human-signed mandate', 'P9 — Consent step-up', 'P7 — <1s revocation kill-switch'],
    note: 'Authority begins with a signed human grant; high-risk actions pause for approval; any action is revocable fleet-wide in under a second.',
  },
  {
    art: 'Art. 12',
    req: 'Record-keeping & traceability',
    controls: ['P10 — Hash-chained audit trail', 'P11 — Completion reporting'],
    note: 'Every governed event is appended to a tamper-evident chain — provenance by construction, not retrospective log-mining.',
  },
  {
    art: 'Art. 15',
    req: 'Robustness & cybersecurity',
    controls: [
      'P3 — SPIFFE workload identity',
      'P4 — Key-bound capability token',
      'P6 — Unbypassable PEP',
      'P2 — Default-deny',
    ],
    note: 'Non-spoofable identities and proof-of-possession tokens, enforced outside the agent’s own trust boundary.',
  },
  {
    art: 'Art. 9',
    req: 'Risk management',
    controls: ['P5 — Attenuated delegation', 'P8 — Budget ceiling enforcement', 'P9 — Consent step-up'],
    note: 'Delegated authority can only narrow, spend is bounded automatically, and genuine risk surfaces to a human by exception.',
  },
]

function SceneMapping() {
  const { localTime: lt, duration: dur } = useSprite()
  const o = sceneOut(lt, dur, 0.5)
  const z = 1 + 0.012 * eio(clamp(lt / dur, 0, 1))
  const seg = 3.5
  const idx = clamp(Math.floor((lt - 1.0) / seg), 0, MAP.length - 1)
  const local = lt - 1.0 - idx * seg
  const m = MAP[idx]
  const artY = (i: number) => 326 + i * 138
  const activeCY = artY(idx) + 60
  const controls = m.controls
  const n = controls.length,
    chipH = 64,
    gap = 18,
    total = n * chipH + (n - 1) * gap,
    start = activeCY - total / 2
  const chipCY = (j: number) => start + j * (chipH + gap) + chipH / 2
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div style={{ position: 'absolute', left: 160, top: 146, ...rise(lt, 0.1) }}>
        <Kicker>The mapping</Kicker>
      </div>
      <div style={{ position: 'absolute', left: 158, top: 188, ...rise(lt, 0.28, 0.6) }}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: 62,
            color: C.hi,
            letterSpacing: '-0.01em',
          }}
        >
          How ATCP covers the Act.
        </div>
      </div>
      <div
        style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 60%' }}
      >
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 282,
            fontFamily: MONO,
            fontSize: 15,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.act,
          }}
        >
          EU AI Act requirement
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1180,
            top: 282,
            fontFamily: MONO,
            fontSize: 15,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.azure,
          }}
        >
          ATCP controls that satisfy it
        </div>
        {MAP.map((a, i) => {
          const on = i === idx
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 160,
                top: artY(i),
                width: 560,
                height: 120,
                borderRadius: 14,
                padding: '0 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: on ? 'rgba(120,96,210,0.16)' : C.panel,
                border: `1px solid ${on ? C.act : C.line}`,
                boxShadow: on ? `0 0 0 1px ${C.act}, 0 16px 40px rgba(104,82,190,0.22)` : 'none',
                opacity: on ? 1 : 0.45,
                transition: 'opacity 0.3s',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 18, color: C.act }}>{a.art}</div>
              <div style={{ fontFamily: SERIF, fontSize: 34, color: C.hi, marginTop: 4 }}>
                {a.req}
              </div>
            </div>
          )
        })}
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {controls.map((c, j) => {
            const p = eo(clamp((local - 0.3 - j * 0.12) / 0.45, 0, 1))
            const x1 = 720,
              y1 = activeCY,
              x2 = 1180,
              y2 = chipCY(j),
              mx = (x1 + x2) / 2
            const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
              len = 920
            return (
              <path
                key={j}
                d={d}
                fill="none"
                stroke={C.azure}
                strokeWidth="2"
                strokeOpacity="0.7"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - p)}
              />
            )
          })}
        </svg>
        {controls.map((c, j) => {
          const p = eo(clamp((local - 0.3 - j * 0.12) / 0.45, 0, 1))
          return (
            <div
              key={idx + '-' + j}
              style={{
                position: 'absolute',
                left: 1180,
                top: chipCY(j) - chipH / 2,
                width: 600,
                height: chipH,
                borderRadius: 12,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: C.panel,
                border: `1px solid ${C.azure}`,
                opacity: p,
                transform: `translateX(${(1 - p) * 24}px)`,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: C.azure, flexShrink: 0 }} />
              <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 23, color: C.hi }}>{c}</span>
            </div>
          )
        })}
        <div
          key={idx}
          style={{ position: 'absolute', left: 160, right: 160, top: 916, ...rise(local, 0.4, 0.6) }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: 30,
              lineHeight: 1.4,
              color: C.mid,
              maxWidth: 1560,
            }}
          >
            {m.note}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Scene 6 — Close ────────────────────────────────────────────────────────────
function SceneClose() {
  const { localTime: lt, duration: dur } = useSprite()
  const o = sceneOut(lt, dur, 0.4)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: o,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={rise(lt, 0.1)}>
        <Logo />
      </div>
      <div
        style={{
          ...rise(lt, 0.4, 0.7),
          marginTop: 48,
          width: 1320,
          textAlign: 'center',
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: 72,
          lineHeight: 1.12,
          color: C.hi,
          letterSpacing: '-0.02em',
        }}
      >
        Compliance by construction —<br />
        not by retrospective log-mining.
      </div>
      <div
        style={{
          ...rise(lt, 0.9, 0.6),
          marginTop: 40,
          width: 1100,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 26,
          lineHeight: 1.5,
          color: C.mid,
        }}
      >
        Map your agent governance to the EU AI Act with the Agent Trust Control Plane.
      </div>
      <div
        style={{
          ...rise(lt, 1.3, 0.6),
          marginTop: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            padding: '20px 42px',
            borderRadius: 999,
            background: C.azure,
            color: C.ink,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 25,
          }}
        >
          Read the article →
        </div>
        <div style={{ fontFamily: MONO, fontSize: 23, letterSpacing: '0.08em', color: C.mid }}>
          ai.soa.team/writing
        </div>
      </div>
    </div>
  )
}

// ── Scenes timeline ───────────────────────────────────────────────────────────
const DURATION = 62
function Scenes() {
  return (
    <>
      <Backdrop />
      <Sprite start={0} end={8.2}>
        <SceneProblem />
      </Sprite>
      <Sprite start={8.0} end={17.0}>
        <SceneAct />
      </Sprite>
      <Sprite start={16.8} end={23.5}>
        <SceneCore />
      </Sprite>
      <Sprite start={23.3} end={39.6}>
        <SceneArch />
      </Sprite>
      <Sprite start={39.4} end={56.4}>
        <SceneMapping />
      </Sprite>
      <Sprite start={56.2} end={62}>
        <SceneClose />
      </Sprite>
    </>
  )
}

// ── Player ────────────────────────────────────────────────────────────────────
export function AtcpFilm() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  const [mounted, setMounted] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)
  const [hover, setHover] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Scale the fixed 1920×1080 canvas to the wrapper's measured width.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setScale(el.clientWidth / W)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted])

  // Play only while in view and not user-paused; pause off-screen.
  useEffect(() => {
    const el = wrapRef.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  useEffect(() => {
    setPlaying(inView && !userPaused && !reduced)
  }, [inView, userPaused, reduced])

  // RAF loop
  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null
      return
    }
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setTime((t) => {
        let next = t + dt
        if (next >= DURATION) next = next % DURATION
        return next
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
    }
  }, [playing])

  const togglePlay = useCallback(() => setUserPaused((p) => !p), [])
  const replay = useCallback(() => {
    setTime(0)
    setUserPaused(false)
  }, [])
  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    setTime(x * DURATION)
  }, [])

  const ctxValue = useMemo<TimelineValue>(() => ({ time, duration: DURATION }), [time])
  const pct = (time / DURATION) * 100
  const showStatic = !mounted || reduced

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${W} / ${H}`,
        borderRadius: 16,
        overflow: 'hidden',
        background: C.ink,
        border: `1px solid ${C.line}`,
        boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
      }}
    >
      {showStatic ? (
        <Poster />
      ) : (
        <>
          {/* 1920×1080 canvas scaled to the wrapper width. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <TimelineContext.Provider value={ctxValue}>
              <Scenes />
            </TimelineContext.Provider>
          </div>

          {/* Minimal control bar — fades in on hover. */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              background: 'linear-gradient(to top, rgba(11,18,32,0.85), rgba(11,18,32,0))',
              opacity: hover ? 1 : 0,
              transition: 'opacity 200ms',
            }}
          >
            <button
              onClick={togglePlay}
              aria-label={userPaused ? 'Play' : 'Pause'}
              style={ctrlBtn}
            >
              {userPaused ? (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <rect x="3" y="2" width="3" height="10" fill="currentColor" />
                  <rect x="8" y="2" width="3" height="10" fill="currentColor" />
                </svg>
              )}
            </button>
            <button onClick={replay} aria-label="Restart" style={ctrlBtn}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 2v10M12 2L5 7l7 5V2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              onClick={seek}
              style={{
                flex: 1,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.14)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: `${pct}%`,
                  height: 3,
                  borderRadius: 2,
                  background: C.azure,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const ctrlBtn: CSSProperties = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  color: C.hi,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
}
