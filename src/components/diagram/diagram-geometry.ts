import type { DiagramNode, DiagramSpec, SceneState } from './diagram.types'

// Single source of truth for grid → pixel maths. Shared by ArchitectureDiagram
// (rendering) and DiagramTour (camera focus computation).

export const CELL_W = 200
export const CELL_H = 100
export const CELL_GAP_X = 40
export const CELL_GAP_Y = 56
export const PAD = 32

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export function cellToPx(x: number, y: number) {
  return {
    cx: PAD + x * (CELL_W + CELL_GAP_X) + CELL_W / 2,
    cy: PAD + y * (CELL_H + CELL_GAP_Y) + CELL_H / 2,
  }
}

export function nodeRect(x: number, y: number) {
  return {
    x: PAD + x * (CELL_W + CELL_GAP_X),
    y: PAD + y * (CELL_H + CELL_GAP_Y),
    w: CELL_W,
    h: CELL_H,
  }
}

export function totalViewBox(nodes: DiagramNode[]): Box {
  const maxX = Math.max(...nodes.map((n) => n.x))
  const maxY = Math.max(...nodes.map((n) => n.y))
  return {
    x: 0,
    y: 0,
    width: PAD * 2 + (maxX + 1) * CELL_W + maxX * CELL_GAP_X,
    height: PAD * 2 + (maxY + 1) * CELL_H + maxY * CELL_GAP_Y,
  }
}

// Compute the camera-focus box for a scene. Pads around the target nodes,
// then expands the box to match the full-diagram aspect ratio so the zoom
// doesn't letterbox. Clamps to the full diagram bounds.
export function computeFocusBox(
  scene: SceneState | undefined,
  spec: DiagramSpec,
  defaultBox: Box,
): Box {
  if (!scene || !scene.focus || scene.focus === 'full') return defaultBox

  const { nodes: nodeIds, padding = 40 } = scene.focus
  const nodes = nodeIds
    .map((id) => spec.nodes.find((n) => n.id === id))
    .filter((n): n is DiagramNode => Boolean(n))
  if (nodes.length === 0) return defaultBox

  const rects = nodes.map((n) => nodeRect(n.x, n.y))
  const minX = Math.min(...rects.map((r) => r.x)) - padding
  const minY = Math.min(...rects.map((r) => r.y)) - padding
  const maxX = Math.max(...rects.map((r) => r.x + r.w)) + padding
  const maxY = Math.max(...rects.map((r) => r.y + r.h)) + padding

  let x = minX
  let y = minY
  let width = maxX - minX
  let height = maxY - minY

  // Match the default (container) aspect ratio to avoid letterboxing.
  const defaultAR = defaultBox.width / defaultBox.height
  const currentAR = width / height
  if (currentAR < defaultAR) {
    const newWidth = height * defaultAR
    x -= (newWidth - width) / 2
    width = newWidth
  } else if (currentAR > defaultAR) {
    const newHeight = width / defaultAR
    y -= (newHeight - height) / 2
    height = newHeight
  }

  // Clamp to the full diagram bounds.
  if (x < defaultBox.x) x = defaultBox.x
  if (y < defaultBox.y) y = defaultBox.y
  if (x + width > defaultBox.x + defaultBox.width) width = defaultBox.x + defaultBox.width - x
  if (y + height > defaultBox.y + defaultBox.height) height = defaultBox.y + defaultBox.height - y

  return { x, y, width, height }
}
