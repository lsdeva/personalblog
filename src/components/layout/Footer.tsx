import Link from 'next/link'
import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer
      className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg)] py-10"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-[72rem] flex-col gap-4 px-6 text-[0.8125rem] md:flex-row md:items-center md:justify-between">
        <p className="font-[var(--font-mono)] text-[var(--color-muted)]">
          © {new Date().getFullYear()} {site.author.name}
        </p>
        <ul className="flex gap-6 font-[var(--font-mono)]">
          <li>
            <a
              href={site.author.linkedin}
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
              rel="me noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href={`mailto:${site.author.email}`}
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              {site.author.email}
            </a>
          </li>
          <li>
            <Link
              href="/rss.xml"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              RSS
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}
