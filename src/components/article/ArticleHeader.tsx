import type { ArticleFrontmatter } from '@/content/types'
import { ArticleMeta } from './ArticleMeta'

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter
  readingMinutes: number
  /** "page" for a standalone article page (uses H1), "inline" for a home-feed
   *  entry where the page H1 is the hero (uses H2 + section-number badge). */
  variant?: 'page' | 'inline'
  /** Zero-based position and total — only rendered when variant is "inline". */
  sectionIndex?: number
  sectionTotal?: number
}

export function ArticleHeader({
  frontmatter,
  readingMinutes,
  variant = 'page',
  sectionIndex,
  sectionTotal,
}: ArticleHeaderProps) {
  const isInline = variant === 'inline'
  const Heading = isInline ? 'h2' : 'h1'

  return (
    <header
      className={`mx-auto max-w-[68ch] px-6 ${
        isInline ? 'pt-20 pb-12 md:pt-28' : 'pt-28 pb-12 md:pt-36'
      }`}
    >
      {isInline && typeof sectionIndex === 'number' && typeof sectionTotal === 'number' && (
        <p className="font-[var(--font-mono)] text-[0.75rem] tracking-[0.22em] text-[var(--color-muted)] uppercase mb-6">
          <span className="text-[var(--color-accent)]">
            {String(sectionIndex + 1).padStart(2, '0')}
          </span>
          {' / '}
          {String(sectionTotal).padStart(2, '0')}
        </p>
      )}
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
          {frontmatter.tags.slice(0, 2).join(' · ')}
        </p>
      )}
      <Heading className="text-display text-[clamp(2.25rem,5vw,3.75rem)] text-[var(--color-ink)]">
        {frontmatter.title}
      </Heading>
      <p className="mt-6 text-[1.125rem] leading-relaxed text-[var(--color-muted)]">
        {frontmatter.description}
      </p>
      <div className="mt-8 border-t border-[var(--color-border)] pt-6">
        <ArticleMeta frontmatter={frontmatter} readingMinutes={readingMinutes} />
      </div>
    </header>
  )
}
