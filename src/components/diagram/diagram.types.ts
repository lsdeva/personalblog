export interface DiagramNode {
  /** Unique within the spec; used by edges and scene references. */
  id: string
  /** Visible label. */
  label: string
  /** Optional second line of label (kept short — a subtitle / role). */
  sublabel?: string
  /** Grid column (0-indexed from left). */
  x: number
  /** Grid row (0-indexed from top). */
  y: number
  /** Tag rendered to the top-right of the node (e.g. "L1", "optional"). */
  tag?: string
  /**
   * "primary" = filled box, terminal-card style
   * "secondary" = outlined box
   * "ghost" = dashed outline (composable / not-yet-active)
   */
  variant?: 'primary' | 'secondary' | 'ghost'
}

export interface DiagramEdge {
  from: string
  to: string
  /** Short label rendered near the midpoint of the edge. */
  label?: string
  /**
   * "solid" = baseline connector
   * "emphasis" = accent-colored, used for the current dataflow
   */
  variant?: 'solid' | 'emphasis'
}

export interface SceneFocus {
  /** Node ids the camera should frame. */
  nodes: string[]
  /** Extra space around the framed nodes, in diagram pixels. Default 40. */
  padding?: number
}

export interface SceneState {
  /** Node ids to render at full emphasis. Others are dimmed. */
  highlight?: string[]
  /** Edge ids (`${from}->${to}`) to draw in / light up. */
  activeEdges?: string[]
  /** Node ids to pulse subtly (indicates "running" / "executing"). */
  pulse?: string[]
  /** Node ids to gray out completely. */
  dim?: string[]
  /** Optional sub-caption (used by older ScrollScene layouts). */
  caption?: string
  /**
   * Camera focus for the Prezi-style DiagramTour. "full" = show the whole
   * diagram (default). Otherwise, frame the listed nodes with padding.
   */
  focus?: 'full' | SceneFocus
}

export interface DiagramSpec {
  /** Stable id — used to lazy-load the spec in article pages. */
  id: string
  /** Summary for the <title> element — one sentence. */
  title: string
  /** Long-form description of the full system, for screen readers. */
  a11yDescription: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  scenes: Record<string, SceneState>
  /** Name of the scene to render when no Step is active (usually an "overview"). */
  defaultScene: string
}
