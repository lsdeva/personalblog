'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { site } from '@/lib/site'

// CSS-only hover/focus transitions. Framer Motion is reserved for pages that
// already ship JS (article pages), so the home bundle stays under 80KB gz.
export function Nav() {
  const pathname = usePathname()

  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/80 backdrop-blur-md"
      role="banner"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[72rem] items-center justify-between px-6 py-4"
      >
        <Link
          href="/"
          className="font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-ink)] transition-opacity hover:opacity-90"
        >
          <span className="text-[var(--color-accent)]">ai</span>.soa.team
        </Link>
        <ul className="flex items-center gap-7">
          {site.nav.map((item) => {
            const isActive = pathname.startsWith(item.href.replace(/\/$/, ''))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link font-[var(--font-mono)] text-[0.8125rem] tracking-[0.04em] transition-colors duration-150 ${
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
      </nav>
    </header>
  )
}
