import Link from 'next/link'
import type { ArticleListItem } from '@/content/types'

interface ArticleCardProps {
  article: ArticleListItem
  index: number
  total: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Server component — renders one article preview at full-viewport height.
// The animation is driven by the data-reveal / data-in-view pair picked up
// by ScrollRevealStack on the client.
export function ArticleCard({ article, index, total }: ArticleCardProps) {
  const { slug, frontmatter, readingMinutes } = article
  const href = `/writing/${slug}/` as const

  return (
    <section
      data-reveal
      data-article-index={index}
      aria-labelledby={`article-${slug}-title`}
      className="article-card flex min-h-[100svh] snap-start items-center px-6 py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-[72rem]">
        <div className="flex items-baseline justify-between gap-6">
          <p className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.18em] text-[var(--color-muted)] uppercase">
            <span className="text-[var(--color-accent)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            {' / '}
            {String(total).padStart(2, '0')}
          </p>
          <p className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)]">
            {readingMinutes} min read
          </p>
        </div>

        <Link href={href} className="group mt-10 block">
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <p className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.2em] text-[var(--color-accent)] uppercase">
              {frontmatter.tags.slice(0, 2).join(' · ')}
            </p>
          )}
          <h2
            id={`article-${slug}-title`}
            className="text-display mt-6 text-[clamp(2.25rem,7vw,5rem)] leading-[1.02] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]"
          >
            {frontmatter.title}
          </h2>
          <p className="mt-8 max-w-[60ch] text-[1.125rem] leading-relaxed text-[var(--color-muted)] md:text-[1.25rem]">
            {frontmatter.description}
          </p>
        </Link>

        <div className="mt-12 flex flex-wrap items-baseline gap-x-10 gap-y-4">
          <Link
            href={href}
            className="inline-flex items-baseline gap-3 font-[var(--font-mono)] text-[0.875rem] tracking-[0.1em] text-[var(--color-accent)] transition-opacity hover:opacity-80"
          >
            <span>Read</span>
            <span aria-hidden="true" className="translate-y-[-1px]">
              →
            </span>
          </Link>
          <time
            dateTime={frontmatter.publishedAt}
            className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)]"
          >
            {formatDate(frontmatter.publishedAt)}
          </time>
        </div>
      </div>
    </section>
  )
}
