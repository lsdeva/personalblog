import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[40rem] flex-col items-center px-6 pt-32 pb-24 text-center">
      <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
        404
      </p>
      <h1 className="text-display text-[2.5rem] text-[var(--color-ink)]">Page not found.</h1>
      <p className="mt-4 max-w-[36ch] text-[var(--color-muted)]">
        The page you're looking for doesn't exist, or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)]"
      >
        ← Home
      </Link>
    </div>
  )
}
