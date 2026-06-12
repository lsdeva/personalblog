import Link from 'next/link'
import type { ArticleListItem } from '@/content/types'

interface Props {
  articles: ArticleListItem[]
}

// Editorial index — one large-type row per article, the whole row is the link.
// CSS-only hover states so the home page ships no animation JS.
export function ArticleIndex({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section aria-label="All articles" className="mx-auto max-w-[72rem] px-6">
      <p className="text-kicker border-b border-[var(--color-border)] pb-6">
        Index — {String(articles.length).padStart(2, '0')} entries
      </p>
      <ul role="list">
        {articles.map((article, i) => {
          const tags = article.frontmatter.tags ?? []
          return (
            <li key={article.slug} className="border-b border-[var(--color-border)]">
              <Link
                href={`/writing/${article.slug}/`}
                className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 gap-y-2 py-8 md:grid-cols-[4rem_1fr_14rem_3rem] md:gap-x-8"
              >
                <span className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.12em] text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="text-display block text-[clamp(1.375rem,2.6vw,2rem)] leading-[1.15] text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
                    {article.frontmatter.title}
                  </span>
                  <span className="mt-2 line-clamp-2 block max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
                    {article.frontmatter.description}
                  </span>
                </span>
                <span className="col-start-2 font-[var(--font-mono)] text-[0.6875rem] tracking-[0.18em] text-[var(--color-muted)] uppercase md:col-start-3 md:text-right">
                  {tags.slice(0, 2).join(' · ')}
                  <span className="block mt-1">{article.readingMinutes} min</span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden text-[var(--color-muted)] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)] md:block md:text-right"
                >
                  →
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
