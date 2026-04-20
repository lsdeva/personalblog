import type { ReactNode } from 'react'

type Tone = 'info' | 'warn' | 'accent'

interface CalloutProps {
  tone?: Tone
  title?: string
  children: ReactNode
}

const toneBorder: Record<Tone, string> = {
  info: 'border-[var(--color-border-hi)]',
  warn: 'border-[var(--color-accent-dim)]',
  accent: 'border-[var(--color-accent)]',
}

export function Callout({ tone = 'info', title, children }: CalloutProps) {
  return (
    <aside
      className={`my-8 border-l-2 bg-[var(--color-surface)] px-6 py-5 ${toneBorder[tone]}`}
      role="note"
    >
      {title && (
        <p className="text-kicker mb-2" style={{ color: 'var(--color-accent)' }}>
          {title}
        </p>
      )}
      <div className="text-[0.9375rem] leading-relaxed text-[var(--color-fg)]">{children}</div>
    </aside>
  )
}
