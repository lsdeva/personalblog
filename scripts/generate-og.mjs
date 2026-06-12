// Generates static OG images (1200×630) into public/og/ — one default card
// plus one per article — by rendering an HTML template and screenshotting it
// with headless Edge/Chrome. Zero new dependencies; the PNGs are committed,
// so this never needs to run in CI. Re-run after adding or retitling an
// article:  node scripts/generate-og.mjs
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import matter from 'gray-matter'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'content', 'writing')
const OUT_DIR = path.join(ROOT, 'public', 'og')

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
]
const browser = BROWSERS.find((p) => fs.existsSync(p))
if (!browser) {
  console.error('No Edge/Chrome found for headless rendering.')
  process.exit(1)
}

// Mirrors tokens.css (light theme). System font stacks stand in for the
// self-hosted IBM Plex Serif / JetBrains Mono, which next/font keeps private.
const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function cardHtml({ kicker, title, footer }) {
  const titleSize = title.length > 70 ? 56 : title.length > 40 ? 66 : 78
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #f5f0e8; color: #0d0d0d;
    font-family: Georgia, 'Times New Roman', serif;
    background-image:
      linear-gradient(rgba(13,13,13,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(13,13,13,.07) 1px, transparent 1px);
    background-size: 48px 48px;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 64px 72px;
  }
  .mono { font-family: Consolas, 'Courier New', monospace; }
  .kicker { font-size: 22px; letter-spacing: .22em; text-transform: uppercase; color: #5a5147; }
  .kicker b { color: #e8412a; font-weight: 400; }
  h1 { font-size: ${titleSize}px; line-height: 1.06; letter-spacing: -0.02em; font-weight: 500; max-width: 21ch; }
  .footer { display: flex; align-items: baseline; justify-content: space-between; }
  .author { font-size: 20px; letter-spacing: .08em; color: #5a5147; }
  .rule { display: inline-block; width: 40px; border-top: 2px solid #e8412a; vertical-align: middle; margin-right: 16px; }
  .nodes { position: absolute; right: 72px; top: 64px; }
</style></head><body>
  <svg class="nodes" width="180" height="64" viewBox="0 0 180 64" fill="none" aria-hidden="true">
    <rect x="1" y="20" width="48" height="24" stroke="#5a5147" opacity=".6"/>
    <rect x="131" y="20" width="48" height="24" stroke="#5a5147" opacity=".6"/>
    <rect x="66" y="20" width="48" height="24" stroke="#e8412a"/>
    <path d="M49 32 H66 M114 32 H131" stroke="#e8412a" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>
  </svg>
  <p class="mono kicker"><b>ai</b>.soa.team ${kicker ? '&nbsp;·&nbsp; ' + esc(kicker) : ''}</p>
  <h1>${esc(title)}</h1>
  <div class="footer">
    <p class="mono author"><span class="rule"></span>Lali Devamanthri — AI integration architecture</p>
  </div>
</body></html>`
}

function render(html, outFile) {
  const tmp = path.join(os.tmpdir(), `og-${path.basename(outFile, '.png')}.html`)
  fs.writeFileSync(tmp, html, 'utf8')
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=1200,630`,
    `--screenshot=${outFile}`,
    `file:///${tmp.replaceAll('\\', '/')}`,
  ])
  fs.rmSync(tmp)
  console.log('wrote', path.relative(ROOT, outFile))
}

fs.mkdirSync(OUT_DIR, { recursive: true })

render(
  cardHtml({ kicker: '', title: 'The systems behind the AI hype.' }),
  path.join(OUT_DIR, 'default.png'),
)

for (const file of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'))) {
  const slug = file.replace(/\.mdx$/, '')
  const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'))
  if (data.draft) continue
  const tags = (data.tags ?? []).slice(0, 2).join(' · ')
  render(cardHtml({ kicker: tags, title: data.title }), path.join(OUT_DIR, `${slug}.png`))
}
