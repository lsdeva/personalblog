'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface ScrollSceneContextValue {
  /** Name of the currently active Step, or null if none is engaged. */
  activeStep: string | null
  /** Children of the currently active Step — rendered in the floating balloon. */
  activeContent: ReactNode
  /** Progress (0..1) through the full scene's scroll distance. */
  progress: number
  /** Reflects `prefers-reduced-motion: reduce`; animations should snap. */
  prefersReducedMotion: boolean
  /** Register a Step element + its children so ScrollScene can attach a
   *  ScrollTrigger and route the content to the balloon. */
  registerStep: (name: string, el: HTMLElement, content: ReactNode) => () => void
}

export const ScrollSceneContext = createContext<ScrollSceneContextValue>({
  activeStep: null,
  activeContent: null,
  progress: 0,
  prefersReducedMotion: false,
  registerStep: () => () => {},
})

export function useScrollScene(): ScrollSceneContextValue {
  return useContext(ScrollSceneContext)
}
