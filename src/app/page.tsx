// Home — full content lands in step 6. This stub renders a clean hero + article
// list so the scaffold is runnable end-to-end before content is written.

import Link from 'next/link'
import { getAllArticles } from '@/content/loader'
import { ContactCTA } from '@/components/layout/ContactCTA'
import { site } from '@/lib/site'

export default function HomePage() {
  const articles = getAllArticles()

  return (
    <div className="mx-auto max-w-[72rem] px-6">
      <section className="pt-24 pb-20 md:pt-32">
        <p className="text-kicker mb-6">{site.author.location}</p>
        <h1 className="text-display text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--color-ink)]">
          AI integration architect for
          <br />
          <span className="text-[var(--color-accent)]">healthcare &amp; fintech.</span>
        </h1>
        <p className="mt-8 max-w-[52ch] text-[1.125rem] leading-relaxed text-[var(--color-muted)]">
          I write about the systems behind the hype — the integration, the guardrails, the
          observability, the actual architecture that moves an LLM from a demo to something you
          can ship under audit.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <ContactCTA />
          <Link
            href="/writing/"
            className="font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            Read the writing →
          </Link>
        </div>
      </section>

      <section aria-labelledby="writing-heading" className="border-t border-[var(--color-border)] pt-16 pb-24">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 id="writing-heading" className="text-kicker" style={{ color: 'var(--color-accent)' }}>
            Recent writing
          </h2>
          <Link
            href="/writing/"
            className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            All →
          </Link>
        </div>
        <ul className="divide-y divide-[var(--color-border)]">
          {articles.length === 0 && (
            <li className="py-8 text-[var(--color-muted)]">No articles yet.</li>
          )}
          {articles.slice(0, 6).map(({ slug, frontmatter, readingMinutes }) => (
            <li key={slug}>
              <Link
                href={`/writing/${slug}/`}
                className="group grid gap-3 py-7 md:grid-cols-[9rem_1fr_auto] md:items-baseline md:gap-8"
              >
                <time
                  dateTime={frontmatter.publishedAt}
                  className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)]"
                >
                  {new Date(frontmatter.publishedAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </time>
                <div>
                  <h3 className="text-display text-[1.5rem] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]">
                    {frontmatter.title}
                  </h3>
                  <p className="mt-2 max-w-[58ch] text-[0.9375rem] text-[var(--color-muted)]">
                    {frontmatter.description}
                  </p>
                </div>
                <span className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)] md:justify-self-end">
                  {readingMinutes} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-[var(--color-border)] pt-16 pb-24">
        <p className="text-kicker mb-6">About</p>
        <p className="max-w-[60ch] text-[1.0625rem] leading-relaxed text-[var(--color-fg)]">
          {site.author.bio[0]} {site.author.bio[1]} {site.author.bio[2]}
        </p>
        <div className="mt-8">
          <Link
            href="/about/"
            className="font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)] transition-opacity hover:opacity-80"
          >
            More about me →
          </Link>
        </div>
      </section>
    </div>
  )
}
