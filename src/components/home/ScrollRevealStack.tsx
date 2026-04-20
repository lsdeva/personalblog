'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// Tiny IntersectionObserver wrapper — no GSAP, no Lenis. Keeps the home
// bundle clean (these engines are reserved for article pages). Adds
// `data-in-view` to each child section as it enters the viewport; CSS
// handles the actual transition.
export function ScrollRevealStack({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prm) {
      // Show everything immediately — no animation path.
      rootRef.current
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((el) => el.setAttribute('data-in-view', 'true'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in-view', 'true')
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -15% 0px' },
    )

    const els = rootRef.current.querySelectorAll<HTMLElement>('[data-reveal]')
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return <div ref={rootRef}>{children}</div>
}
