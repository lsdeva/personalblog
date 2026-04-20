import { site } from '@/lib/site'
import { ContactCTA } from '@/components/layout/ContactCTA'

export function ArticleFooterCTA() {
  return (
    <section
      aria-labelledby="article-footer-cta-heading"
      className="mx-auto mt-24 max-w-[68ch] border-t border-[var(--color-border)] px-6 pt-16 pb-20"
    >
      <p className="text-kicker mb-4">End of article</p>
      <h2
        id="article-footer-cta-heading"
        className="text-display text-[1.875rem] text-[var(--color-ink)] md:text-[2.25rem]"
      >
        Building something AI-shaped for healthcare or fintech?
      </h2>
      <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
        I work with a small number of teams at a time on integration architecture, eval pipelines,
        and getting models into regulated production. If the system you're designing rhymes with
        the one above, let's talk.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <ContactCTA />
        <a
          href={`mailto:${site.author.email}?subject=${encodeURIComponent("Let's talk — from ai.soa.team")}`}
          className="font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
        >
          or email {site.author.email}
        </a>
      </div>
    </section>
  )
}
