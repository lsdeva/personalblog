import type { ReactNode } from 'react'

export interface TourFrameProps {
  /** Scene name to activate — must exist in the DiagramSpec. */
  scene: string
  children: ReactNode
}

// Marker component. DiagramTour introspects its children for <TourFrame>
// elements and reads `scene` + `children` from them. Doesn't render anything
// itself — caption rendering happens inside the tour's sticky caption panel.
export function TourFrame(_props: TourFrameProps) {
  return null
}

TourFrame.displayName = 'TourFrame'
