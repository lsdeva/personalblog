export interface SequenceActor {
  id: string
  label: string
  sublabel?: string
  /** primary = accent border + filled; secondary = outlined (default); ghost = dashed */
  variant?: 'primary' | 'secondary' | 'ghost'
}

export interface SequenceStep {
  /** Source actor id. Use same value as `to` for a self-referential step. */
  from: string
  /** Destination actor id. */
  to: string
  label: string
  /** True → dashed line (return / async / response). */
  dashed?: boolean
  /** Optional callout text rendered in a dashed box to the right of all actors. */
  note?: string
}

export interface SequenceDiagramSpec {
  id: string
  /** Used as aria-label. */
  title: string
  /** Rendered as a small caption below the SVG. */
  subtitle?: string
  actors: SequenceActor[]
  steps: SequenceStep[]
  /** Zero or more labels for audit-trail lines rendered at the bottom. */
  auditEvents?: string[]
}
