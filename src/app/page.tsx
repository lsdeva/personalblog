import Link from 'next/link'
import { getAllArticles } from '@/content/loader'
import { ScrollRevealStack } from '@/components/home/ScrollRevealStack'
import { ArticleCard } from '@/components/home/ArticleCard'

export default function HomePage() {
  const articles = getAllArticles()

  return (
    <div className="home-sequence">
      <section
        data-reveal
        data-hero
        className="flex min-h-[100svh] snap-start items-center px-6"
      >
        <div className="mx-auto w-full max-w-[72rem]">
          <h1 className="text-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.02] text-[var(--color-ink)]">
            The systems behind
            <br />
            <span className="text-[var(--color-accent)]">the AI hype.</span>
          </h1>
          <p className="mt-10 max-w-[56ch] text-[1.125rem] leading-relaxed text-[var(--color-muted)] md:text-[1.25rem]">
            Long-form architecture notes on AI integration — evals, failure modes, observability,
            and the plumbing that moves a model past the demo.
          </p>
          <p className="mt-16 flex items-center gap-3 font-[var(--font-mono)] text-[0.75rem] tracking-[0.22em] text-[var(--color-muted)] uppercase">
            <span aria-hidden="true" className="inline-block w-6 border-t border-[var(--color-muted)]" />
            Scroll to read
          </p>
        </div>
      </section>

      <ScrollRevealStack>
        {articles.map((article, i) => (
          <ArticleCard
            key={article.slug}
            article={article}
            index={i}
            total={articles.length}
          />
        ))}
      </ScrollRevealStack>

      {articles.length === 0 && (
        <section className="flex min-h-[50vh] items-center justify-center px-6 text-[var(--color-muted)]">
          No articles yet.
        </section>
      )}

      <section className="border-t border-[var(--color-border)] py-24">
        <div className="mx-auto max-w-[72rem] px-6 text-center">
          <p className="text-kicker mb-4">End of reel</p>
          <p className="text-display text-[clamp(1.5rem,3vw,2rem)] text-[var(--color-muted)]">
            That's the archive so far.
          </p>
          <div className="mt-10">
            <Link
              href="/about/"
              className="inline-flex items-baseline gap-2 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)]"
            >
              About the author →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
