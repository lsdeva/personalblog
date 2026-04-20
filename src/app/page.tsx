import Link from 'next/link'
import { getAllArticles } from '@/content/loader'
import { LenisProvider } from '@/components/scroll/LenisProvider'
import { ArticleHeader } from '@/components/article/ArticleHeader'
import type { ComponentType } from 'react'

interface InlineArticle {
  slug: string
  frontmatter: import('@/content/types').ArticleFrontmatter
  readingMinutes: number
  Content: ComponentType
}

export default async function HomePage() {
  const articles = getAllArticles()
  const sections: InlineArticle[] = await Promise.all(
    articles.map(async (a) => {
      const mod = await import(`../../content/writing/${a.slug}.mdx`)
      return {
        slug: a.slug,
        frontmatter: a.frontmatter,
        readingMinutes: a.readingMinutes,
        Content: mod.default as ComponentType,
      }
    }),
  )

  return (
    <LenisProvider>
      {/* Hero — always visible, first viewport */}
      <section className="flex min-h-[100svh] items-center px-6">
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
            <span
              aria-hidden="true"
              className="inline-block w-6 border-t border-[var(--color-muted)]"
            />
            Scroll to read
          </p>
        </div>
      </section>

      {/* Each article rendered inline — header + full MDX body.
          Readers scroll continuously through hero → article → article → article. */}
      {sections.map(({ slug, frontmatter, readingMinutes, Content }, i) => (
        <section
          key={slug}
          id={slug}
          className="border-t border-[var(--color-border)] pt-12 pb-24 md:pt-16"
          aria-labelledby={`${slug}-heading`}
        >
          <ArticleHeader
            frontmatter={frontmatter}
            readingMinutes={readingMinutes}
            variant="inline"
            sectionIndex={i}
            sectionTotal={sections.length}
          />
          <article className="prose-article">
            <Content />
          </article>
        </section>
      ))}

      {sections.length === 0 && (
        <section className="flex min-h-[50vh] items-center justify-center px-6 text-[var(--color-muted)]">
          No articles yet.
        </section>
      )}

      <section className="border-t border-[var(--color-border)] py-24">
        <div className="mx-auto max-w-[72rem] px-6 text-center">
          <p className="text-kicker mb-4">End of reel</p>
          <p className="text-display text-[clamp(1.75rem,3vw,2.25rem)] text-[var(--color-muted)]">
            That's the archive so far.
          </p>
          <div className="mt-10">
            <Link
              href="/about/"
              className="inline-flex items-baseline gap-2 font-[var(--font-mono)] text-[0.8125rem] tracking-[0.08em] text-[var(--color-accent)]"
            >
              Let's talk →
            </Link>
          </div>
        </div>
      </section>
    </LenisProvider>
  )
}
