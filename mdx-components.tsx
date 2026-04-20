import type { MDXComponents } from 'mdx/types'
import { mdxComponents } from '@/components/mdx/MDXComponents'

// Next.js 15 convention: this file is picked up automatically and its exported
// map is merged into the MDX rendering context for every .mdx file.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...mdxComponents,
  }
}
