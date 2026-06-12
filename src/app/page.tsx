import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllArticles, getFeaturedArticle } from '@/content/loader'
import { HeroDiagram } from '@/components/home/HeroDiagram'
import { ArticleIndex } from '@/components/home/ArticleIndex'
import { ContactCTA } from '@/components/layout/ContactCTA'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// WebSite + Person — machine-readable identity for the whole site.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
      description: site.description,
    },
    {
      '@type': 'Person',
      name: site.author.name,
      jobTitle: site.author.role,
      email: `mailto:${site.author.email}`,
      url: site.url,
      sameAs: [site.author.linkedin],
    },
  ],
}

// The home page is deliberately curated, not exhaustive: hero → featured
// piece → full index. Articles live at /writing/[slug]/ (their canonical
// home, where the GSAP scroll scenes load). Home ships no GSAP/Lenis, which
// is what keeps it inside the 105 KB gz budget.
export default function HomePage() {
  const articles = getAllArticles()
  const featured = getFeaturedArticle()
  const rest = featured ? articles.filter((a) => a.slug !== featured.slug) : articles

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — headline beside a living diagram drawn in the site's own dialect */}
      <section className="flex min-h-[calc(100svh-4rem)] items-center px-6">
        <div className="mx-auto grid w-full max-w-[72rem] items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div>
            <h1 className="text-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] text-[var(--color-ink)]">
              <span className="reveal-line">
                <span>The systems behind</span>
              </span>
              <span className="reveal-line">
                <span style={{ animationDelay: '120ms' }} className="text-[var(--color-accent)]">
                  the AI hype.
                </span>
              </span>
            </h1>
            <p
              className="fade-up mt-8 max-w-[52ch] text-[1.125rem] leading-relaxed text-[var(--color-muted)] md:text-[1.25rem]"
              style={{ animationDelay: '350ms' }}
            >
              Long-form architecture notes on AI integration — evals, failure modes,
              observability, and the plumbing that moves a model past the demo.
            </p>
            <p
              className="fade-up mt-12 flex items-center gap-3 font-[var(--font-mono)] text-[0.75rem] tracking-[0.22em] text-[var(--color-muted)] uppercase"
              style={{ animationDelay: '550ms' }}
            >
              <span
                aria-hidden="true"
                className="inline-block w-6 border-t border-[var(--color-muted)]"
              />
              Scroll to read
            </p>
          </div>
          <div className="fade-up hidden lg:block" style={{ animationDelay: '250ms' }}>
            <HeroDiagram />
          </div>
        </div>
      </section>

      {/* Featured piece */}
      {featured && (
        <section
          aria-labelledby="featured-heading"
          className="border-t border-[var(--color-border)] py-20 md:py-28"
        >
          <div className="mx-auto max-w-[72rem] px-6">
            <p className="text-kicker mb-8" style={{ color: 'var(--color-accent)' }}>
              Featured
            </p>
            <h2 id="featured-heading" className="max-w-[24ch]">
              <Link
                href={`/writing/${featured.slug}/`}
                className="text-display block text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] text-[var(--color-ink)] transition-colors duration-200 hover:text-[var(--color-accent)]"
              >
                {featured.frontmatter.title}
              </Link>
            </h2>
            <p className="mt-6 max-w-[62ch] text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
              {featured.frontmatter.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <p className="font-[var(--font-mono)] text-[0.6875rem] tracking-[0.18em] text-[var(--color-muted)] uppercase">
                {(featured.frontmatter.tags ?? []).slice(0, 3).join(' · ')} ·{' '}
                {featured.readingMinutes} min
              </p>
              <Link
                href={`/writing/${featured.slug}/`}
                className="group inline-flex items-baseline gap-2 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)]"
              >
                Read the article
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Full index */}
      <div className="py-12 md:py-16">
        <ArticleIndex articles={rest} />
      </div>

      {/* Closing CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[72rem] px-6 text-center">
          <p className="text-kicker mb-6">Working on something regulated?</p>
          <p className="text-display mx-auto max-w-[24ch] text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.15] text-[var(--color-ink)]">
            I help teams move AI past the demo.
          </p>
          <div className="mt-10 flex justify-center">
            <ContactCTA />
          </div>
        </div>
      </section>
    </>
  )
}
