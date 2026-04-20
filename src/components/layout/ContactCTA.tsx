import Link from 'next/link'

interface ContactCTAProps {
  variant?: 'inline' | 'fixed'
}

// Persistent but non-intrusive "Work with me" affordance. The fixed variant
// pins to the bottom-right and gets out of the way on narrow viewports.
export function ContactCTA({ variant = 'inline' }: ContactCTAProps) {
  if (variant === 'fixed') {
    return (
      <Link
        href="/work-with-me/"
        className="fixed right-6 bottom-6 z-30 hidden border border-[var(--color-border-hi)] bg-[var(--color-surface)]/90 px-4 py-2 font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-accent)] backdrop-blur-md transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg)] md:inline-block"
      >
        → Work with me
      </Link>
    )
  }

  return (
    <Link
      href="/work-with-me/"
      className="inline-flex items-center gap-2 border border-[var(--color-accent)] bg-transparent px-5 py-3 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
    >
      Work with me
      <span aria-hidden="true">→</span>
    </Link>
  )
}
