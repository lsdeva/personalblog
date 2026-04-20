'use client'

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArchitectureDiagram, type ArchitectureDiagramHandle } from './ArchitectureDiagram'
import type { DiagramSpec } from './diagram.types'
import { computeFocusBox, totalViewBox } from './diagram-geometry'
import { ScrollSceneContext } from '@/components/scroll/useScrollScene'
import { TourFrame, type TourFrameProps } from './TourFrame'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface DiagramTourProps {
  spec: DiagramSpec
  /** TourFrame children — each frame = one camera position + caption. */
  children: ReactNode
}

interface ResolvedFrame {
  scene: string
  caption: ReactNode
}

// Prezi-style camera tour of an architecture diagram. Children are <TourFrame>
// elements; each references a scene in the spec (camera focus + node emphasis)
// and carries the caption to display at that moment. Scroll-scrubbed GSAP
// timeline animates the svg viewBox through each frame's focus box.
export function DiagramTour({ spec, children }: DiagramTourProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const diagramHandleRef = useRef<ArchitectureDiagramHandle>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const frames: ResolvedFrame[] = useMemo(() => {
    return Children.toArray(children)
      .filter(
        (c): c is ReactElement<TourFrameProps> =>
          isValidElement(c) && (c.type as { displayName?: string })?.displayName === 'TourFrame',
      )
      .map((c) => ({
        scene: c.props.scene,
        caption: c.props.children,
      }))
  }, [children])

  const defaultBox = useMemo(() => totalViewBox(spec.nodes), [spec.nodes])
  const activeScene = frames[activeIndex]?.scene ?? spec.defaultScene

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Scroll-scrubbed viewBox animation.
  useEffect(() => {
    if (!sectionRef.current || frames.length === 0) return
    const svg = diagramHandleRef.current?.getSvg()
    if (!svg) return

    // Skip animation under reduced-motion OR on mobile (diagram flows inline).
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (prefersReducedMotion || isMobile) {
      svg.setAttribute(
        'viewBox',
        `${defaultBox.x} ${defaultBox.y} ${defaultBox.width} ${defaultBox.height}`,
      )
      setActiveIndex(0)
      return
    }

    const state = {
      x: defaultBox.x,
      y: defaultBox.y,
      w: defaultBox.width,
      h: defaultBox.height,
    }
    const apply = () => {
      svg.setAttribute('viewBox', `${state.x} ${state.y} ${state.w} ${state.h}`)
    }
    apply()

    const focusBoxes = frames.map((f) => computeFocusBox(spec.scenes[f.scene], spec, defaultBox))

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self) => {
            const idx = Math.min(
              frames.length - 1,
              Math.floor(self.progress * frames.length + 0.001),
            )
            setActiveIndex(idx)
          },
        },
      })

      focusBoxes.forEach((box) => {
        tl.to(state, {
          x: box.x,
          y: box.y,
          w: box.width,
          h: box.height,
          duration: 1,
          onUpdate: apply,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [frames, spec, defaultBox, prefersReducedMotion])

  // Mobile: no sticky, no scroll-scrub. Flat inline layout — diagram then
  // captions listed one after another. Reader gets the same information,
  // just in a linear form.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const ctxValue = useMemo(
    () => ({
      activeStep: activeScene,
      progress: 0,
      prefersReducedMotion,
      registerStep: () => () => {},
    }),
    [activeScene, prefersReducedMotion],
  )

  if (isMobile) {
    return (
      <ScrollSceneContext.Provider value={ctxValue}>
        <div className="full-bleed my-12 space-y-8 px-6">
          <div className="mx-auto flex max-w-[680px] justify-center">
            <ArchitectureDiagram spec={spec} ref={diagramHandleRef} />
          </div>
          <ol className="mx-auto max-w-[60ch] space-y-6 border-t border-[var(--color-border)] pt-8">
            {frames.map((f, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 font-[var(--font-mono)] text-[0.75rem] tracking-[0.18em] text-[var(--color-accent)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="text-[1rem] leading-relaxed text-[var(--color-fg)]">
                  {f.caption}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </ScrollSceneContext.Provider>
    )
  }

  // Desktop: sticky stage, scroll-scrubbed camera + captions.
  const sectionHeight = `${Math.max(160, frames.length * 70 + 60)}vh`

  return (
    <ScrollSceneContext.Provider value={ctxValue}>
      <div
        ref={sectionRef}
        className="full-bleed relative"
        style={{ minHeight: sectionHeight }}
      >
        <div className="sticky top-[4rem] flex h-[calc(100vh-4rem)] flex-col">
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-6">
            <ArchitectureDiagram spec={spec} ref={diagramHandleRef} externallyControlledViewBox />
          </div>
          {/* Frame indicator */}
          <div className="flex items-center justify-center gap-2 pb-2">
            {frames.map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`h-[2px] w-8 transition-colors duration-300 ${
                  i === activeIndex
                    ? 'bg-[var(--color-accent)]'
                    : 'bg-[var(--color-border-hi)] opacity-40'
                }`}
              />
            ))}
          </div>
          {/* Caption */}
          <div
            className="relative mx-auto w-full max-w-[64ch] border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 px-6 py-5 text-center backdrop-blur-sm"
            aria-live="polite"
          >
            <p className="font-[var(--font-mono)] text-[0.6875rem] tracking-[0.22em] text-[var(--color-muted)] uppercase">
              <span className="text-[var(--color-accent)]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              {' / '}
              {String(frames.length).padStart(2, '0')}
            </p>
            <div
              key={activeIndex}
              className="diagram-tour-caption mt-3 text-[1.0625rem] leading-relaxed text-[var(--color-fg)]"
            >
              {frames[activeIndex]?.caption}
            </div>
          </div>
        </div>
      </div>
    </ScrollSceneContext.Provider>
  )
}

// Re-export so MDX authors can import both from one place in future tooling.
export { TourFrame }
