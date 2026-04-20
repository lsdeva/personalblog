import Link from 'next/link'

interface ContactCTAProps {
  label?: string
}

export function ContactCTA({ label = "Let's talk" }: ContactCTAProps) {
  return (
    <Link
      href="/about/"
      className="inline-flex items-center gap-2 border border-[var(--color-accent)] bg-transparent px-5 py-3 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  )
}
