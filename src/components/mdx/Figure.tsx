import type { ReactNode } from 'react'

interface FigureProps {
  caption?: string
  children: ReactNode
}

export function Figure({ caption, children }: FigureProps) {
  return (
    <figure className="my-10">
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        {children}
      </div>
      {caption && (
        <figcaption className="text-kicker mt-3 text-center">{caption}</figcaption>
      )}
    </figure>
  )
}
