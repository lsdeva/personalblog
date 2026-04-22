'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSceneContext } from './useScrollScene'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollSceneProps {
  children: ReactNode
  className?: string
}

export function ScrollScene({ children, className }: ScrollSceneProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [contents, setContents] = useState<Map<string, ReactNode>>(new Map())
  const [progress, setProgress] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const stepsRef = useRef<Map<string, HTMLElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const registerStep = useCallback(
    (name: string, el: HTMLElement, content: ReactNode) => {
      stepsRef.current.set(name, el)
      setContents((prev) => {
        const next = new Map(prev)
        next.set(name, content)
        return next
      })
      return () => {
        stepsRef.current.delete(name)
        setContents((prev) => {
          const next = new Map(prev)
          next.delete(name)
          return next
        })
      }
    },
    [],
  )

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      stepsRef.current.forEach((el, name) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter: () => setActiveStep(name),
          onEnterBack: () => setActiveStep(name),
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
  }, [contents])

  const activeContent = useMemo<ReactNode>(() => {
    if (!activeStep) return null
    return contents.get(activeStep) ?? null
  }, [activeStep, contents])

  const value = useMemo(
    () => ({
      activeStep,
      activeContent,
      progress,
      prefersReducedMotion,
      registerStep,
    }),
    [activeStep, activeContent, progress, prefersReducedMotion, registerStep],
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
// Mobile: natural flow — diagram renders once at size, balloon stacks below.
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
  const { activeStep, activeContent } = useScrollSceneForBalloon()

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

// Small indirection so we can re-use useScrollScene without circular imports
// at component-definition time.
function useScrollSceneForBalloon() {
  const { activeStep, activeContent } = useScrollScene()
  return { activeStep, activeContent }
}

// Re-export the hook locally to avoid a circular module dependency.
import { useScrollScene } from './useScrollScene'

interface ScrollSceneStepsProps {
  children: ReactNode
  className?: string
}

// Provides scroll distance — renders all <Step> children as invisible
// spacers. Steps register their content with context; the active step's
// content is rendered in <Balloon> inside the sticky.
export function ScrollSceneSteps({ children, className }: ScrollSceneStepsProps) {
  return <div className={`relative ${className ?? ''}`}>{children}</div>
}
