import type { Metadata } from 'next'
import './globals.css'
import { inter, serifDisplay, jetbrainsMono } from '@/lib/fonts'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { site } from '@/lib/site'

// Runs inline in <head> before first paint — no FOUC when the user has
// chosen light. Reads localStorage and sets [data-theme] on <html>.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.author.name, url: site.author.linkedin }],
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: 'website',
    locale: 'en_SG',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serifDisplay.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Raw inline script (not next/script) so it runs synchronously
            during HTML parse, before any CSS applies — prevents a
            flash of dark when the user has saved light. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only-focusable fixed top-2 left-2 z-50 border border-[var(--color-accent)] bg-[var(--color-bg)] px-3 py-2 font-[var(--font-mono)] text-xs text-[var(--color-accent)]">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="relative z-10 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
