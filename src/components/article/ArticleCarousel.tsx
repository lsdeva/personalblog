import Link from 'next/link'
import type { ArticleListItem } from '@/content/types'

interface Props {
  articles: ArticleListItem[]
}

export function ArticleCarousel({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section aria-label="Article index">
      <div className="mx-auto max-w-[72rem] px-6 pt-12 pb-6">
        <p className="font-[var(--font-mono)] text-[0.6875rem] tracking-[0.22em] text-[var(--color-muted)] uppercase">
          In this archive
        </p>
      </div>

      <div
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        <ul className="flex snap-x snap-mandatory gap-4 px-6 pb-12" role="list">
          {articles.map((article, i) => {
            const tags = article.frontmatter.tags ?? []
            return (
              <li
                key={article.slug}
                className="w-[min(20rem,80vw)] shrink-0 snap-start"
              >
                <Link
                  href={`#${article.slug}`}
                  className="group flex h-full flex-col gap-3 border border-[var(--color-border)] p-6 transition-colors duration-150 hover:border-[var(--color-border-hi)]"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-[var(--font-mono)] text-[0.6875rem] tracking-[0.22em] text-[var(--color-accent)] uppercase">
                      {tags.slice(0, 2).join(' · ') || 'Article'}
                    </p>
                    <p className="shrink-0 font-[var(--font-mono)] text-[0.6875rem] tracking-[0.08em] text-[var(--color-muted)]">
                      {article.readingMinutes} min
                    </p>
                  </div>

                  <p className="text-display text-[1.0625rem] leading-snug text-[var(--color-ink)] transition-colors duration-150 group-hover:text-[var(--color-accent)]">
                    {article.frontmatter.title}
                  </p>

                  <p className="line-clamp-3 flex-1 text-[0.875rem] leading-relaxed text-[var(--color-muted)]">
                    {article.frontmatter.description}
                  </p>

                  <p className="font-[var(--font-mono)] text-[0.6875rem] tracking-[0.18em] text-[var(--color-muted)] uppercase transition-colors duration-150 group-hover:text-[var(--color-accent)]">
                    {String(i + 1).padStart(2, '0')} ↓
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
