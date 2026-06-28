'use client'

// Defers the AtcpFilm engine + scenes (~6 kB of JS) out of the home First Load
// chunk, keeping the home page at its 105 KB gz budget. The film sits below the
// hero, so loading it on mount (not first paint) is invisible to the user.
// PosterFrame (a tiny separate module) renders as the placeholder, so there's
// no layout shift when the real component swaps in.

import dynamic from 'next/dynamic'
import { PosterFrame } from './Poster'

const AtcpFilm = dynamic(() => import('./AtcpFilm').then((m) => m.AtcpFilm), {
  ssr: false,
  loading: PosterFrame,
})

export function AtcpFilmLazy() {
  return <AtcpFilm />
}
