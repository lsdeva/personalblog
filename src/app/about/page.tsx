import { site } from '@/lib/site'
import { ContactCTA } from '@/components/layout/ContactCTA'

export const metadata = {
  title: 'About',
  description: `${site.author.role} — ${site.author.location}. AWS 3×, ex-MOH Singapore, 12+ years architecting regulated systems.`,
}

const focusAreas = [
  {
    title: 'AI integration in regulated production',
    body: 'Moving LLMs past the demo. Eval pipelines, failure-mode budgets, audit trails, and the plumbing that lets a model be a component of a system rather than the system itself.',
  },
  {
    title: 'Healthcare IT integration',
    body: 'FHIR, HL7, hospital-to-cloud integration. What it means to architect for an environment where every request might be the one an auditor picks.',
  },
  {
    title: 'Fintech infrastructure under latency budgets',
    body: 'Payments, settlement, compliance-adjacent workloads on AWS. When the SLA is tight and the regulator is real, architecture choices narrow fast.',
  },
]

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

      <div className="mt-14 border-t border-[var(--color-border)] pt-10">
        <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
          What I work on
        </p>
        <ul className="space-y-8">
          {focusAreas.map((area) => (
            <li key={area.title}>
              <h2 className="text-display text-[1.25rem] text-[var(--color-ink)]">
                {area.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
                {area.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 border-t border-[var(--color-border)] pt-10">
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

      <div className="mt-14 border-t border-[var(--color-border)] pt-10">
        <p className="text-kicker mb-4">Elsewhere</p>
        <ul className="space-y-2 font-[var(--font-mono)] text-[0.875rem]">
          <li>
            <a
              href={site.author.linkedin}
              rel="me noopener noreferrer"
              target="_blank"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              LinkedIn → {site.author.linkedin.replace('https://www.', '')}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${site.author.email}`}
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Email → {site.author.email}
            </a>
          </li>
        </ul>
      </div>

      <div className="mt-14">
        <ContactCTA />
      </div>
    </div>
  )
}
