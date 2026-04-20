import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { getAllArticles } from '@/content/loader'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/about/`, changeFrequency: 'monthly', priority: 0.8 },
  ]
  const articles: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${site.url}/writing/${a.slug}/`,
    lastModified: a.frontmatter.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  return [...staticRoutes, ...articles]
}
