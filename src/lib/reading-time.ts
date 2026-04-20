// Lightweight reading-time estimator. Strips MDX/JSX and common markdown
// markers, then divides word count by a standard adult reading rate.
// Zero-dep — avoids pulling in `reading-time` (40KB) for a 10-line function.

const WORDS_PER_MINUTE = 220

export function readingTime(source: string): number {
  const text = source
    // import/export lines
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"][\s;]*$/gm, '')
    .replace(/^export\s+[\s\S]*?$/gm, '')
    // fenced code blocks
    .replace(/```[\s\S]*?```/g, '')
    // JSX/HTML tags
    .replace(/<[^>]+>/g, ' ')
    // markdown syntax
    .replace(/[#*_`~>[\]()!|-]+/g, ' ')

  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
