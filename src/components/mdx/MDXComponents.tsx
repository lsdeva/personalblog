import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { Code } from './Code'
import { Figure } from './Figure'
import { ArchitectureDiagram } from '@/components/diagram/ArchitectureDiagram'
import { DiagramTour } from '@/components/diagram/DiagramTour'
import { TourFrame } from '@/components/diagram/TourFrame'
import { ScrollScene, ScrollSceneSticky, ScrollSceneSteps } from '@/components/scroll/ScrollScene'
import { Step } from '@/components/scroll/Step'

export const mdxComponents: MDXComponents = {
  // Content components
  Callout,
  Code,
  Figure,

  // Diagram tour (current default for articles)
  DiagramTour,
  TourFrame,

  // Raw diagram (for static embeds)
  ArchitectureDiagram,

  // Legacy scroll-scene primitive — still exposed for any article that
  // wants the side-by-side layout. Rollback point: tag v1-sidebar-scroll.
  ScrollScene,
  ScrollSceneSticky,
  ScrollSceneSteps,
  Step,
}
