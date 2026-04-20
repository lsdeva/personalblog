'use client'

import {
  useCallback,
  useEffect,
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

// Two-column scroll scene: a sticky visual on the left, scrolling prose on the right.
// At ≤md, collapses to a single column where the visual sticks above the prose.
export function ScrollScene({ children, className }: ScrollSceneProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const stepsRef = useRef<Map<string, HTMLElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Mirror the OS reduced-motion preference reactively.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const registerStep = useCallback((name: string, el: HTMLElement) => {
    stepsRef.current.set(name, el)
    return () => {
      stepsRef.current.delete(name)
    }
  }, [])

  // Wire ScrollTriggers once the DOM has all steps mounted.
  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Per-step triggers: activate when the step crosses the viewport mid-zone.
      stepsRef.current.forEach((el, name) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 65%',
          end: 'bottom 35%',
          onEnter: () => setActiveStep(name),
          onEnterBack: () => setActiveStep(name),
        })
      })

      // Scene-wide progress (0..1) — useful for scrubbed diagram animations.
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setProgress(self.progress),
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <ScrollSceneContext.Provider
      value={{ activeStep, progress, prefersReducedMotion, registerStep }}
    >
      <div
        ref={containerRef}
        className={`full-bleed relative grid grid-cols-1 gap-x-16 md:grid-cols-2 ${className ?? ''}`}
      >
        {children}
      </div>
    </ScrollSceneContext.Provider>
  )
}

interface ScrollSceneStickyProps {
  children: ReactNode
  className?: string
}

export function ScrollSceneSticky({ children, className }: ScrollSceneStickyProps) {
  return (
    <div
      className={`sticky top-0 flex h-[80vh] min-h-[480px] items-center justify-center md:h-screen ${className ?? ''}`}
    >
      <div className="w-full">{children}</div>
    </div>
  )
}

interface ScrollSceneStepsProps {
  children: ReactNode
  className?: string
}

export function ScrollSceneSteps({ children, className }: ScrollSceneStepsProps) {
  return <div className={`flex flex-col ${className ?? ''}`}>{children}</div>
}
