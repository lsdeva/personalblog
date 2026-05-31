'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ScrollSceneContext, useScrollScene } from './useScrollScene'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollSceneProps {
  children: ReactNode
  className?: string
}

export function ScrollScene({ children, className }: ScrollSceneProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  // Increments on step mount/unmount to trigger ScrollTrigger rebuilds.
  // Kept as state (not a ref) so the effect re-runs; content is in a ref
  // so content updates don't cause rebuilds.
  const [stepVersion, setStepVersion] = useState(0)
  const [progress, setProgress] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const stepsRef = useRef<Map<string, HTMLElement>>(new Map())
  const contentsRef = useRef<Map<string, ReactNode>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const registerStep = useCallback((name: string, el: HTMLElement) => {
    stepsRef.current.set(name, el)
    setStepVersion((v) => v + 1)
    return () => {
      stepsRef.current.delete(name)
      contentsRef.current.delete(name)
      setStepVersion((v) => v + 1)
    }
  }, [])

  // Updates the content ref only — no state change, no ScrollTrigger rebuild.
  const setStepContent = useCallback((name: string, content: ReactNode) => {
    contentsRef.current.set(name, content)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Sort by DOM order so first/last are correct regardless of registration order.
      const sorted = Array.from(stepsRef.current.entries()).sort(([, a], [, b]) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )

      sorted.forEach(([name, el], index) => {
        const isFirst = index === 0
        const isLast = index === sorted.length - 1
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter: () => setActiveStep(name),
          onEnterBack: () => setActiveStep(name),
          ...(isFirst && { onLeaveBack: () => setActiveStep(null) }),
          ...(isLast && { onLeave: () => setActiveStep(null) }),
        })
      })

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setProgress(self.progress),
      })
    }, containerRef)

    return () => ctx.revert()
  }, [stepVersion])

  const value = useMemo(
    () => ({
      activeStep,
      // Read from the ref at render time — reactive to activeStep changes,
      // not to content-ref mutations (acceptable: MDX content is static).
      activeContent: activeStep ? (contentsRef.current.get(activeStep) ?? null) : null,
      progress,
      prefersReducedMotion,
      registerStep,
      setStepContent,
    }),
    [activeStep, progress, prefersReducedMotion, registerStep, setStepContent],
  )

  return (
    <ScrollSceneContext.Provider value={value}>
      <div ref={containerRef} className={`full-bleed relative ${className ?? ''}`}>
        {children}
      </div>
    </ScrollSceneContext.Provider>
  )
}

interface ScrollSceneStickyProps {
  children: ReactNode
  className?: string
}

// Desktop: sticky band at top of viewport with diagram on the left and a
// floating balloon card on the right showing the active step's prose.
// Mobile: natural flow — diagram renders once at size; steps render their
// prose inline below it (see Step component).
export function ScrollSceneSticky({ children, className }: ScrollSceneStickyProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-6 py-6
        md:sticky md:top-[4rem] md:z-10 md:h-[78vh] md:flex-row
        md:items-stretch md:gap-8 md:border-b md:border-[var(--color-border)]
        md:py-6
        ${className ?? ''}
      `}
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="flex w-full min-w-0 flex-1 items-center justify-center">{children}</div>
      <Balloon />
    </div>
  )
}

function Balloon() {
  const { activeStep, activeContent } = useScrollScene()

  return (
    <aside
      aria-live="polite"
      className="hidden md:flex md:w-[360px] md:shrink-0 md:items-center"
    >
      <div
        key={activeStep ?? '__empty'}
        className="scroll-scene-balloon relative w-full border border-[var(--color-border-hi)] bg-[var(--color-surface)] p-6 shadow-xl"
      >
        {activeContent ? (
          <div className="text-[0.9375rem] leading-relaxed text-[var(--color-fg)]">
            {activeContent}
          </div>
        ) : (
          <p className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.12em] text-[var(--color-muted)] uppercase">
            Scroll to begin the tour →
          </p>
        )}
      </div>
    </aside>
  )
}

interface ScrollSceneStepsProps {
  children: ReactNode
  className?: string
}

// Renders Step children. On desktop each Step is an invisible scroll-spacer;
// its prose appears in the Balloon. On mobile Steps render their prose inline.
export function ScrollSceneSteps({ children, className }: ScrollSceneStepsProps) {
  return <div className={`relative ${className ?? ''}`}>{children}</div>
}
