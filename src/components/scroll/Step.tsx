'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useScrollScene } from './useScrollScene'

interface StepProps {
  /** Name that the diagram's scenes map uses to pick the visual state. */
  trigger: string
  children: ReactNode
  className?: string
}

// Registers its children with the ScrollScene context so they appear in the
// floating balloon when this step is active. The element itself is an
// invisible scroll-spacer — it only provides scroll distance for the
// ScrollTrigger. The actual prose is rendered in <ScrollSceneSticky>'s balloon.
export function Step({ trigger, children, className }: StepProps) {
  const { registerStep } = useScrollScene()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return registerStep(trigger, ref.current, children)
  }, [trigger, children, registerStep])

  return (
    <div
      ref={ref}
      data-step={trigger}
      aria-hidden="true"
      className={`hidden md:block md:h-[55vh] ${className ?? ''}`}
    />
  )
}
