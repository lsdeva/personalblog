'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface LenisProviderProps {
  children: ReactNode
}

// Smooth scrolling wired to GSAP's ticker. ScrollTrigger calls `update()` on
// every raf, so Lenis driving the page scroll stays in phase with triggers.
// Respects prefers-reduced-motion by disabling smoothing entirely.
export function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const prm =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prm) {
      // Let the browser do native scrolling; GSAP ScrollTriggers still fire.
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.25,
    })

    // Feed Lenis into GSAP's RAF so ScrollTrigger stays in sync.
    function raf(time: number) {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Lenis fires a scroll event; forward to ScrollTrigger.
    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
