import { site } from '@/lib/site'

export const metadata = {
  title: "Let's talk",
  description: `${site.author.role}. AWS 3×, former Ministry of Health solution review board, 12+ years architecting regulated systems.`,
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

const engagements = [
  {
    tag: 'Advisory',
    title: 'Architecture review',
    duration: '1–2 weeks',
    body: 'I read your existing design, interview your engineers, and hand back a written review: the failure modes I would worry about, the first three changes I would make, and the parts that are already in good shape. Output is a document, not a deck.',
  },
  {
    tag: 'Build',
    title: 'Integration design & build',
    duration: '4–12 weeks',
    body: 'I design the integration, write the reference implementation, and leave your team with a system they can extend — eval harnesses, observability wiring, and the documentation for the parts that aren’t obvious from the code.',
  },
  {
    tag: 'Retainer',
    title: 'Monthly technical sounding board',
    duration: 'Rolling · 4 hours/month',
    body: 'For teams already mid-flight. A fixed block of my time each month for design reviews, reading diffs, or being the second pair of eyes on hard architecture calls. Small, reliable, cancellable.',
  },
]

const outOfScope = [
  'Fine-tuning for its own sake',
  'Prompt-engineering consulting as a standalone',
  'AI-strategy decks without implementation',
  'Anything that doesn’t end in a running system',
]

export default function AboutPage() {
  const subject = encodeURIComponent("Let's talk — from ai.soa.team")

  return (
    <div className="mx-auto max-w-[60ch] px-6 pt-28 pb-24">
      <p className="text-kicker mb-6">About</p>
      <h1 className="text-display text-[clamp(2.25rem,5vw,3.5rem)] text-[var(--color-ink)]">
        {site.author.name}
      </h1>
      <p className="mt-4 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-muted)]">
        {site.author.role}
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
              <h2 className="text-display text-[1.25rem] text-[var(--color-ink)]">{area.title}</h2>
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

      <div className="mt-20 border-t border-[var(--color-border)] pt-10">
        <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
          Let's talk
        </p>
        <h2 className="text-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--color-ink)]">
          Short, focused engagements.
        </h2>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
          I work with a small number of teams at a time on AI integration architecture — usually
          healthcare IT or fintech — where the stakes are regulated, the latency budget is narrow,
          and the demo isn't the hard part.
        </p>

        <div className="mt-10 space-y-6">
          {engagements.map((e) => (
            <article key={e.title} className="border border-[var(--color-border)] p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-[var(--font-mono)] text-[0.6875rem] tracking-[0.22em] text-[var(--color-accent)] uppercase">
                  {e.tag}
                </p>
                <p className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)]">
                  {e.duration}
                </p>
              </div>
              <h3 className="text-display mt-3 text-[1.375rem] text-[var(--color-ink)]">
                {e.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
                {e.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-kicker mb-4">Out of scope</p>
          <ul className="space-y-2 text-[0.9375rem] text-[var(--color-muted)]">
            {outOfScope.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="text-[var(--color-border-hi)]">
                  ×
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <p className="text-kicker mb-4">Get in touch</p>
          <p className="text-[1.0625rem] leading-relaxed text-[var(--color-fg)]">
            Email{' '}
            <a
              href={`mailto:${site.author.email}?subject=${subject}`}
              className="text-[var(--color-accent)] underline underline-offset-4"
            >
              {site.author.email}
            </a>{' '}
            with a paragraph about what you're building and where you're stuck. I'll reply within
            a few days if I think I can help — and tell you honestly if I can't.
          </p>
          <p className="mt-4 text-[0.875rem] text-[var(--color-muted)]">
            Or reach me on{' '}
            <a
              href={site.author.linkedin}
              rel="me noopener noreferrer"
              target="_blank"
              className="text-[var(--color-accent)] underline underline-offset-4"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
