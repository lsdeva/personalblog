'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { site } from '@/lib/site'
import { ThemeToggle } from './ThemeToggle'

// CSS-only hover/focus transitions. Framer Motion is reserved for pages that
// already ship JS (article pages), so the home bundle stays under its budget.
export function Nav() {
  const pathname = usePathname()
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)

  // Watch [data-article-section] elements in the current page and show the
  // active one's title in the nav's middle slot. "Active" = currently crossing
  // the viewport's midpoint band (-45% margin top and bottom → 10% band).
  useEffect(() => {
    setCurrentTitle(null)

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-article-section]'),
    )
    if (sections.length === 0) return

    const activeSet = new Set<HTMLElement>()

    const update = () => {
      for (const s of sections) {
        if (activeSet.has(s)) {
          setCurrentTitle(s.getAttribute('data-article-title'))
          return
        }
      }
      setCurrentTitle(null)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) activeSet.add(el)
          else activeSet.delete(el)
        }
        update()
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [pathname])

  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/80 backdrop-blur-md"
      role="banner"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[72rem] items-center gap-4 px-6 py-4"
      >
        <Link
          href="/"
          className="shrink-0 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-ink)] transition-opacity hover:opacity-90"
        >
          <span className="text-[var(--color-accent)]">ai</span>.soa.team
        </Link>

        {/* Middle slot: current article title while reading. Hidden below md. */}
        <div
          className="nav-title-slot hidden min-w-0 flex-1 justify-center md:flex"
          data-visible={currentTitle ? 'true' : 'false'}
          aria-hidden={currentTitle ? undefined : 'true'}
        >
          <span className="max-w-full truncate font-[var(--font-mono)] text-[0.75rem] tracking-[0.04em] text-[var(--color-muted)]">
            {currentTitle ?? '\u00A0'}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-6 md:ml-0">
          <ul className="flex items-center gap-7">
            {site.nav.map((item) => {
              const isActive = pathname.startsWith(item.href.replace(/\/$/, ''))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`font-[var(--font-mono)] text-[0.8125rem] tracking-[0.04em] transition-colors duration-150 ${
                      isActive
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-[var(--color-border)] md:inline-block"
          />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
