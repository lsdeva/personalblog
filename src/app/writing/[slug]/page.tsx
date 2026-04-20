import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllArticles, getArticleMeta } from '@/content/loader'
import { ArticleHeader } from '@/components/article/ArticleHeader'
import { ArticleFooterCTA } from '@/components/article/ArticleFooterCTA'
import { LenisProvider } from '@/components/scroll/LenisProvider'
import { site } from '@/lib/site'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = getArticleMeta(slug)
  if (!meta) return {}
  return {
    title: meta.frontmatter.title,
    description: meta.frontmatter.description,
    openGraph: {
      title: meta.frontmatter.title,
      description: meta.frontmatter.description,
      type: 'article',
      publishedTime: meta.frontmatter.publishedAt,
      authors: [site.author.name],
      url: `${site.url}/writing/${slug}/`,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const meta = getArticleMeta(slug)
  if (!meta) notFound()

  // Relative path here (not @content alias) because webpack's dynamic-import
  // context scanning is more reliable with a static relative prefix.
  const mod = await import(`../../../../content/writing/${slug}.mdx`).catch(() => null)
  if (!mod) notFound()
  const Content = mod.default

  return (
    <LenisProvider>
      <ArticleHeader frontmatter={meta.frontmatter} readingMinutes={meta.readingMinutes} />
      <article className="prose-article mx-auto max-w-[68ch] px-6">
        <Content />
      </article>
      <ArticleFooterCTA />
    </LenisProvider>
  )
}
