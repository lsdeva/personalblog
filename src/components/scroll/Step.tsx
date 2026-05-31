'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useScrollScene } from './useScrollScene'

interface StepProps {
  /** Name that the diagram's scenes map uses to pick the visual state. */
  trigger: string
  children: ReactNode
  className?: string
}

// On desktop: an invisible scroll-spacer that drives the ScrollTrigger. Its
// prose is rendered by <Balloon> inside <ScrollSceneSticky> when this step
// is active. On mobile: renders children inline as normal document flow.
export function Step({ trigger, children, className }: StepProps) {
  const { registerStep, setStepContent } = useScrollScene()
  const ref = useRef<HTMLDivElement>(null)

  // Register the DOM element for ScrollTrigger. Dep array has no `children`
  // so this only fires on mount/unmount — not on every parent re-render.
  useEffect(() => {
    if (!ref.current) return
    return registerStep(trigger, ref.current)
  }, [trigger, registerStep])

  // Keep the content ref in sync. setStepContent only mutates a ref (no state
  // change, no ScrollTrigger rebuild), so re-running on children changes is safe.
  useEffect(() => {
    setStepContent(trigger, children)
  }, [trigger, children, setStepContent])

  return (
    <>
      {/* Desktop: invisible spacer that provides scroll distance for the trigger. */}
      <div
        ref={ref}
        data-step={trigger}
        aria-hidden="true"
        className={`hidden md:block md:h-[55vh] ${className ?? ''}`}
      />
      {/* Mobile: render prose inline so content is never hidden from users. */}
      <div className="md:hidden py-8 px-6 max-w-[60ch] mx-auto">{children}</div>
    </>
  )
}
