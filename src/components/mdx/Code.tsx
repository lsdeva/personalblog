import type { ReactNode } from 'react'

interface CodeProps {
  lang?: string
  children: ReactNode
}

// Simple pre-formatted code block. No syntax highlighting in v1 to keep the
// article bundle lean. If a future article needs it, add shiki at build time.
export function Code({ lang, children }: CodeProps) {
  return (
    <pre
      className="my-8 overflow-x-auto border border-[var(--color-border)] bg-[var(--color-surface)] p-5 font-[var(--font-mono)] text-[0.8125rem] leading-relaxed text-[var(--color-fg)]"
      data-lang={lang}
    >
      <code>{children}</code>
    </pre>
  )
}
