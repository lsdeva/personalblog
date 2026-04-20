import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { readingTime } from '@/lib/reading-time'
import type { ArticleFrontmatter, ArticleListItem } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'writing')

function readAll(): ArticleListItem[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, '')
      const source = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8')
      const { data, content } = matter(source)
      const frontmatter = data as ArticleFrontmatter
      return {
        slug,
        frontmatter,
        readingMinutes: readingTime(content),
      }
    })
    .filter((a) => !a.frontmatter.draft)
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt))
}

export function getAllArticles(): ArticleListItem[] {
  return readAll()
}

export function getArticleSlugs(): string[] {
  return readAll().map((a) => a.slug)
}

export function getArticleMeta(slug: string): ArticleListItem | null {
  return readAll().find((a) => a.slug === slug) ?? null
}
