import Link from 'next/link'
import { getAllArticles } from '@/content/loader'

export const metadata = {
  title: 'Writing',
  description: 'Long-form writing on AI integration architecture.',
}

export default function WritingIndexPage() {
  const articles = getAllArticles()

  return (
    <div className="mx-auto max-w-[72rem] px-6 pt-28 pb-24">
      <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
        Writing
      </p>
      <h1 className="text-display text-[clamp(2.25rem,5vw,3.5rem)] text-[var(--color-ink)]">
        Architecture notes from the field.
      </h1>
      <p className="mt-4 max-w-[56ch] text-[var(--color-muted)]">
        Long-form pieces on AI integration, usually with a diagram or three. Written from working
        engagements in healthcare IT and fintech.
      </p>

      <ul className="mt-14 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
        {articles.length === 0 && (
          <li className="py-8 text-[var(--color-muted)]">No articles yet.</li>
        )}
        {articles.map(({ slug, frontmatter, readingMinutes }) => (
          <li key={slug}>
            <Link
              href={`/writing/${slug}/`}
              className="group grid gap-4 py-8 md:grid-cols-[10rem_1fr_auto] md:items-baseline md:gap-10"
            >
              <div>
                <time
                  dateTime={frontmatter.publishedAt}
                  className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)]"
                >
                  {new Date(frontmatter.publishedAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                {frontmatter.tags && (
                  <p className="mt-2 font-[var(--font-mono)] text-[0.6875rem] tracking-[0.1em] text-[var(--color-accent)]">
                    {frontmatter.tags.slice(0, 2).join(' · ').toUpperCase()}
                  </p>
                )}
              </div>
              <div>
                <h2 className="text-display text-[1.625rem] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]">
                  {frontmatter.title}
                </h2>
                <p className="mt-2 max-w-[58ch] text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
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
    </div>
  )
}
