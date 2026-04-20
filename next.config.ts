import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // Static export for GitHub Pages. No server actions, no runtime.
  output: 'export',
  // GH Pages has no image optimizer; serve images as-is.
  images: { unoptimized: true },
  // Trailing slashes match GH Pages directory routing.
  trailingSlash: true,
  // .mdx files under /app/ could become routes — we don't want that; we load
  // MDX from /content/ via the loader. So we DO NOT add mdx to pageExtensions.
  reactStrictMode: true,
  typedRoutes: true,
}

// @next/mdx gives us a webpack/Turbopack MDX loader so we can `import foo.mdx`
// from content/ at build time. We picked it over next-mdx-remote because:
//   - zero runtime eval (smaller article bundle, fully static)
//   - first-party, no separate serialization step
//   - build-time compilation composes cleanly with `output: 'export'`
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
