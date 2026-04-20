import type { ArticleFrontmatter } from '@/content/types'
import { ArticleMeta } from './ArticleMeta'

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter
  readingMinutes: number
}

export function ArticleHeader({ frontmatter, readingMinutes }: ArticleHeaderProps) {
  return (
    <header className="mx-auto max-w-[68ch] px-6 pt-28 pb-12 md:pt-36">
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <p className="text-kicker mb-6" style={{ color: 'var(--color-accent)' }}>
          {frontmatter.tags.slice(0, 2).join(' · ')}
        </p>
      )}
      <h1 className="text-display text-[clamp(2.25rem,5vw,3.75rem)] text-[var(--color-ink)]">
        {frontmatter.title}
      </h1>
      <p className="mt-6 text-[1.125rem] leading-relaxed text-[var(--color-muted)]">
        {frontmatter.description}
      </p>
      <div className="mt-8 border-t border-[var(--color-border)] pt-6">
        <ArticleMeta frontmatter={frontmatter} readingMinutes={readingMinutes} />
      </div>
    </header>
  )
}
