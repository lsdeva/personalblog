# ai.soa.team

Scroll-driven AI architecture writing by [Lali Devamanthri](https://www.linkedin.com/in/lalisd/).
Deployed as a fully static site to GitHub Pages at **[ai.soa.team](https://ai.soa.team)**.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript strict) — static export
- **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`)
- **GSAP 3 + ScrollTrigger** — all scroll-bound animation
- **Lenis** — smooth scroll, wired to GSAP's ticker
- **@next/mdx** — MDX compiled at build time (no runtime eval)
- **gray-matter** — frontmatter parsing

No CMS. No runtime. No dark-mode toggle. No 3D.

---

## Running locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # strict TS
pnpm build        # static export to ./out
```

Requirements: Node `>=20.10`, pnpm 10.x.

---

## Adding a new article

Writing a new article is **one MDX file + one diagram spec** (if the article has a diagram).

1. Create `content/writing/my-slug.mdx`:

   ```mdx
   ---
   title: My article title
   description: One-sentence summary for the index and meta tags.
   publishedAt: '2026-05-01'
   tags: [architecture, fintech]
   diagramId: my-diagram       # optional — must match the spec id
   ---

   import { myDiagram } from '@/diagrams/my-diagram'

   Intro prose here.

   <ScrollScene>
     <ScrollSceneSticky>
       <ArchitectureDiagram spec={myDiagram} />
     </ScrollSceneSticky>
     <ScrollSceneSteps>
       <Step trigger="intro">### Step 1: prose…</Step>
       <Step trigger="act">### Step 2: prose…</Step>
     </ScrollSceneSteps>
   </ScrollScene>

   Closing prose.
   ```

2. (Optional) Add the diagram spec at `src/diagrams/my-diagram.ts`.
   See [`Defining a diagram spec`](#defining-a-diagram-spec) below.

3. Run `pnpm dev` — the article appears at `/writing/my-slug/` and on the index automatically.

### Available MDX components

These are globally available in any article — no `import` needed:

- `<ScrollScene>`, `<ScrollSceneSticky>`, `<ScrollSceneSteps>`, `<Step trigger="...">` — the scroll primitive
- `<ArchitectureDiagram spec={...} />` — renders a diagram spec
- `<Callout tone="info|warn|accent" title="...">` — side box
- `<Code lang="...">` — code block (no syntax highlighting by design)
- `<Figure caption="...">` — bordered figure with caption

Draft articles (`draft: true` in frontmatter) are filtered out of all listings but still build.

---

## Defining a diagram spec

Diagrams are declared as **data**, not hand-coded SVG. A spec lives in `src/diagrams/<id>.ts`:

```ts
import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const myDiagram: DiagramSpec = {
  id: 'my-diagram',
  title: 'One-sentence summary for <title>.',
  a11yDescription: 'Full prose description for screen readers — say what the system does without relying on animation.',
  defaultScene: 'overview',

  nodes: [
    { id: 'user',    label: 'User',    x: 0, y: 0 },
    { id: 'server',  label: 'Server',  x: 1, y: 0, variant: 'primary' },
    { id: 'db',      label: 'DB',      x: 1, y: 1, variant: 'secondary' },
  ],
  edges: [
    { from: 'user',   to: 'server' },
    { from: 'server', to: 'db', variant: 'emphasis' },
  ],

  scenes: {
    overview: { caption: 'The shape at rest.' },
    request:  { highlight: ['user', 'server'], activeEdges: ['user->server'] },
    query:    { highlight: ['server', 'db'], activeEdges: ['server->db'], pulse: ['db'] },
  },
}
```

**Nodes** are placed on a grid by `(x, y)` coords (0-indexed). Variants:
- `primary` — filled, the current focus of a scene
- `secondary` — outlined (default)
- `ghost` — dashed outline, for "composable / not-yet-active"

**Edges** are drawn between node ids. `variant: 'emphasis'` uses the accent color.

**Scenes** are referenced by name from `<Step trigger="...">` elements. Each scene can:
- `highlight` — node ids to light up (others dim to 45%)
- `activeEdges` — edges to draw-in (use `"from->to"` ids)
- `pulse` — node ids to pulse (indicates "running")
- `dim` — node ids to gray out completely
- `caption` — sub-caption under the diagram

Scenes compose cleanly: the scene associated with whichever `<Step>` is currently in the
viewport mid-zone becomes the active scene. The `defaultScene` shows when no step is engaged.

---

## Performance budgets

Enforced in review:

| Page | First Load JS | Status |
|---|---|---|
| `/` (home) | ≤ **105 KB gz** | driven by Next.js 15 + React 19 baseline |
| `/writing/[slug]/` (article) | ≤ **180 KB gz** | includes GSAP + Lenis |

Verify with:

```bash
pnpm build       # summary at end of output
# Or detailed, per-chunk:
du -b out/_next/static/chunks/*.js | sort -rn
```

GSAP and Lenis are only loaded on article pages — `LenisProvider` is imported from
`src/app/writing/[slug]/page.tsx` so home and index ship near-zero animation JS.

---

## Accessibility

- Every diagram has `<title>`, `<desc>`, and an adjacent visually-hidden prose description.
- Scroll scenes degrade cleanly under `prefers-reduced-motion: reduce` — Lenis disables
  itself, GSAP timelines snap to final states.
- All CTAs keyboard-accessible with an accent-colored focus ring.
- Body/muted text contrast AA+ on the dark background.

---

## Deploying to GitHub Pages

This repo deploys automatically on every push to `main` via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) using the
GitHub Actions-native flow (no `gh-pages` branch).

### One-time setup

In the repo on GitHub:

1. **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. That's it. The next push to `main` will build and deploy.

### Custom domain

The apex `ai.soa.team` is configured via `public/CNAME` — Next.js copies it into
`out/CNAME` at build time, which GitHub Pages honors.

DNS (on whoever hosts `soa.team`) needs:
- An `A` record for `ai` pointing at GitHub Pages IPs:
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- (Optional but recommended) Enable HTTPS in GH Pages once DNS is live.

`basePath` is empty because this deploys at the apex of `ai.soa.team`, not a
subpath. If the deploy target ever moves to `username.github.io/repo`, set
`basePath: '/repo'` in `next.config.ts`.

---

## Repo layout

```
content/writing/           MDX articles — write here, not under src/
public/                    static assets + CNAME
src/
├─ app/                    App Router pages + metadata routes
├─ components/
│  ├─ scroll/              ScrollScene primitive + LenisProvider
│  ├─ diagram/             ArchitectureDiagram + DiagramSpec types
│  ├─ mdx/                 MDX component map (Callout, Code, Figure)
│  ├─ layout/              Nav, Footer, ContactCTA
│  └─ article/             per-article header/meta/footer-CTA
├─ content/                MDX loader + frontmatter types
├─ diagrams/               one file per article diagram spec
├─ lib/                    fonts, site metadata, reading-time util
└─ styles/                 design tokens
mdx-components.tsx         Next 15 convention — global MDX component map
```

---

## License

Content © Lali Devamanthri. Code under no specific license — treat as
all-rights-reserved unless otherwise noted.
