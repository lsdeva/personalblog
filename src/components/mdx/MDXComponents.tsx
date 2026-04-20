import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { Code } from './Code'
import { Figure } from './Figure'
import { ArchitectureDiagram } from '@/components/diagram/ArchitectureDiagram'
import { ScrollScene, ScrollSceneSticky, ScrollSceneSteps } from '@/components/scroll/ScrollScene'
import { Step } from '@/components/scroll/Step'

// Map HTML tags → styled equivalents + expose custom components to MDX.
// Only the tag overrides need explicit typing; custom components are passed through.
export const mdxComponents: MDXComponents = {
  // Tag-level overrides: the article body uses the .prose-article class on its
  // wrapper, so we don't need per-tag styling here — inherit from CSS.
  // Custom components available in any .mdx file:
  Callout,
  Code,
  Figure,
  ArchitectureDiagram,
  ScrollScene,
  ScrollSceneSticky,
  ScrollSceneSteps,
  Step,
}
