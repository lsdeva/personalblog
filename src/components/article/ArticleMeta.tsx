import type { ArticleFrontmatter } from '@/content/types'
import { site } from '@/lib/site'

interface ArticleMetaProps {
  frontmatter: ArticleFrontmatter
  readingMinutes: number
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ArticleMeta({ frontmatter, readingMinutes }: ArticleMetaProps) {
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-2 font-[var(--font-mono)] text-[0.75rem] tracking-[0.08em] text-[var(--color-muted)]">
      <div>
        <dt className="sr-only">Author</dt>
        <dd>{site.author.name}</dd>
      </div>
      <div>
        <dt className="sr-only">Published</dt>
        <dd>
          <time dateTime={frontmatter.publishedAt}>{formatDate(frontmatter.publishedAt)}</time>
        </dd>
      </div>
      <div>
        <dt className="sr-only">Reading time</dt>
        <dd>{readingMinutes} min read</dd>
      </div>
    </dl>
  )
}
