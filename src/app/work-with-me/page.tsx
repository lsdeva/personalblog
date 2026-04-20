// /work-with-me — full content lands in step 6.
import { site } from '@/lib/site'

export const metadata = {
  title: 'Work with me',
  description: 'Engagement options for AI integration architecture work.',
}

export default function WorkWithMePage() {
  const subject = encodeURIComponent('Work with me — from ai.soa.team')

  return (
    <div className="mx-auto max-w-[60ch] px-6 pt-28 pb-24">
      <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
        Work with me
      </p>
      <h1 className="text-display text-[clamp(2.25rem,5vw,3.5rem)] text-[var(--color-ink)]">
        Short, focused engagements.
      </h1>
      <p className="mt-6 text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
        I work with a small number of teams at a time on AI integration architecture — usually
        healthcare IT or fintech — where the stakes are regulated, the latency budget is narrow,
        and the demos aren't the hard part.
      </p>

      <div className="mt-12 space-y-8">
        <article className="border border-[var(--color-border)] p-6">
          <p className="text-kicker mb-3">Advisory</p>
          <h2 className="text-display text-[1.5rem] text-[var(--color-ink)]">
            Architecture review
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
            1–2 week engagement. I read your existing design, interview your engineers, and hand
            back a written review with the failure modes I'd worry about and the first three
            changes I'd make.
          </p>
        </article>

        <article className="border border-[var(--color-border)] p-6">
          <p className="text-kicker mb-3">Build</p>
          <h2 className="text-display text-[1.5rem] text-[var(--color-ink)]">
            Integration design &amp; build
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
            4–12 weeks. I design the integration, write the reference implementation, and leave
            your team with a system they can extend — eval harnesses, observability, and the
            documentation for the parts that aren't obvious.
          </p>
        </article>
      </div>

      <div className="mt-14 border-t border-[var(--color-border)] pt-8">
        <p className="text-kicker mb-4">Get in touch</p>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-fg)]">
          Email{' '}
          <a
            href={`mailto:${site.author.email}?subject=${subject}`}
            className="text-[var(--color-accent)] underline underline-offset-4"
          >
            {site.author.email}
          </a>{' '}
          with a paragraph about what you're building and where you're stuck. I'll reply within a
          few days if I think I can help.
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
  )
}
