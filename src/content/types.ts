export interface ArticleFrontmatter {
  title: string
  description: string
  publishedAt: string // ISO 8601
  tags?: string[]
  diagramId?: string // references a spec in /src/diagrams/
  draft?: boolean
}

export interface ArticleListItem {
  slug: string
  frontmatter: ArticleFrontmatter
  readingMinutes: number
}
