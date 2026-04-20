'use client'

import { createContext, useContext } from 'react'

export interface ScrollSceneContextValue {
  /** Name of the currently active Step, or null if none is engaged. */
  activeStep: string | null
  /** Progress (0..1) through the full scene's scroll distance. */
  progress: number
  /** Reflects `prefers-reduced-motion: reduce`; animations should snap. */
  prefersReducedMotion: boolean
  /** Register a Step element so ScrollScene can attach a ScrollTrigger to it. */
  registerStep: (name: string, el: HTMLElement) => () => void
}

export const ScrollSceneContext = createContext<ScrollSceneContextValue>({
  activeStep: null,
  progress: 0,
  prefersReducedMotion: false,
  registerStep: () => () => {},
})

export function useScrollScene(): ScrollSceneContextValue {
  return useContext(ScrollSceneContext)
}
