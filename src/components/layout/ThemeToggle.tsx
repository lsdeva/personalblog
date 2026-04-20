'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function readStoredTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.dataset.theme
  if (attr === 'light') return 'light'
  return 'dark'
}

// Theme toggle — flips [data-theme] on <html> and persists. The <head>
// init script (in layout.tsx) reads localStorage before first paint so
// there's no flash on reload.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(readStoredTheme())
    setMounted(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage disabled — toggle still works for this session */
    }
  }

  // Before hydration, render a placeholder with the same size so layout
  // doesn't shift. aria-hidden so SR users don't encounter a mystery control.
  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className="inline-block w-[3.5rem] font-[var(--font-mono)] text-[0.75rem] tracking-[0.12em] text-[var(--color-muted)] uppercase"
      >
        &nbsp;
      </span>
    )
  }

  const nextLabel = theme === 'dark' ? 'Light' : 'Dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${nextLabel.toLowerCase()} theme`}
      title={`Switch to ${nextLabel.toLowerCase()} theme`}
      className="inline-flex items-center gap-1.5 font-[var(--font-mono)] text-[0.75rem] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors hover:text-[var(--color-accent)]"
    >
      <span aria-hidden="true" className="text-[0.625rem]">
        {theme === 'dark' ? '○' : '●'}
      </span>
      {nextLabel}
    </button>
  )
}
