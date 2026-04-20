'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useScrollScene } from './useScrollScene'

interface StepProps {
  /** Name that the diagram's scenes map uses to pick the visual state. */
  trigger: string
  children: ReactNode
  className?: string
}

// A prose block inside ScrollSceneSteps. When it crosses the viewport mid-zone,
// it sets the ScrollScene's `activeStep` to its `trigger`.
export function Step({ trigger, children, className }: StepProps) {
  const { registerStep } = useScrollScene()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return registerStep(trigger, ref.current)
  }, [trigger, registerStep])

  return (
    <div
      ref={ref}
      data-step={trigger}
      className={`flex flex-col py-8 md:min-h-[80vh] md:justify-center md:py-16 ${className ?? ''}`}
    >
      <div className="max-w-[48ch]">{children}</div>
    </div>
  )
}
