// /about — full content lands in step 6.
import { site } from '@/lib/site'
import { ContactCTA } from '@/components/layout/ContactCTA'

export const metadata = {
  title: 'About',
  description: `${site.author.role} — ${site.author.location}`,
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[60ch] px-6 pt-28 pb-24">
      <p className="text-kicker mb-6">About</p>
      <h1 className="text-display text-[clamp(2.25rem,5vw,3.5rem)] text-[var(--color-ink)]">
        {site.author.name}
      </h1>
      <p className="mt-4 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-muted)]">
        {site.author.role} · {site.author.location}
      </p>
      <div className="mt-10 space-y-6 text-[1.0625rem] leading-relaxed text-[var(--color-fg)]">
        {site.author.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-12 border-t border-[var(--color-border)] pt-8">
        <p className="text-kicker mb-4">Credentials</p>
        <ul className="space-y-2 text-[0.9375rem] text-[var(--color-muted)]">
          {site.author.credentials.map((c) => (
            <li key={c} className="flex gap-3">
              <span aria-hidden="true" className="text-[var(--color-accent)]">
                →
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-12">
        <ContactCTA />
      </div>
    </div>
  )
}
