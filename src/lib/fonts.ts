import { Inter, IBM_Plex_Serif, JetBrains_Mono } from 'next/font/google'

// next/font fetches and self-hosts these at build time. No runtime CDN hit.
// Each font becomes a CSS variable available globally.

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const serifDisplay = IBM_Plex_Serif({
  subsets: ['latin'],
  variable: '--font-serif-display',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const fontVariables = [inter.variable, serifDisplay.variable, jetbrainsMono.variable].join(
  ' ',
)
