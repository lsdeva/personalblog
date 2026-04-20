import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const promptInjectionGateDiagram: DiagramSpec = {
  id: 'prompt-injection-gate',
  title:
    'Three-stage prompt-injection gate: a heuristic pre-filter, a fine-tuned DeBERTa classifier, and an optional semantic LLM check sit between the user and the target model.',
  a11yDescription:
    'A vertical flow. User input enters the top. Stage 1 is a heuristic pre-filter running in under 2 milliseconds; obvious injections are blocked immediately. Traffic that passes continues to Stage 2, a fine-tuned DeBERTa classifier at around 15 milliseconds; confidently-malicious inputs are blocked here. Borderline cases fall through to Stage 3, an optional semantic LLM check at roughly 200 milliseconds. Only requests that clear all three gates reach the target LLM.',
  defaultScene: 'overview',

  nodes: [
    {
      id: 'user',
      label: 'User input',
      sublabel: 'raw prompt text',
      x: 1,
      y: 0,
      variant: 'secondary',
    },
    {
      id: 'stage1',
      label: 'Stage 1',
      sublabel: 'heuristic · <2ms',
      x: 1,
      y: 1,
      tag: 'fast',
      variant: 'primary',
    },
    { id: 'blocked1', label: 'Blocked', sublabel: 'regex match', x: 0, y: 1, variant: 'ghost' },
    {
      id: 'stage2',
      label: 'Stage 2',
      sublabel: 'DeBERTa · 15ms',
      x: 1,
      y: 2,
      tag: 'workhorse',
      variant: 'primary',
    },
    { id: 'blocked2', label: 'Blocked', sublabel: 'classifier', x: 0, y: 2, variant: 'ghost' },
    {
      id: 'stage3',
      label: 'Stage 3',
      sublabel: 'LLM · ~200ms',
      x: 1,
      y: 3,
      tag: 'optional',
      variant: 'secondary',
    },
    {
      id: 'llm',
      label: 'Target LLM',
      sublabel: 'your model',
      x: 1,
      y: 4,
      tag: 'goal',
      variant: 'secondary',
    },
  ],

  edges: [
    { from: 'user', to: 'stage1' },
    { from: 'stage1', to: 'blocked1' },
    { from: 'stage1', to: 'stage2' },
    { from: 'stage2', to: 'blocked2' },
    { from: 'stage2', to: 'stage3' },
    { from: 'stage3', to: 'llm', variant: 'emphasis' },
  ],

  scenes: {
    overview: { focus: 'full' },
    problem: {
      highlight: ['user', 'llm'],
      dim: ['stage1', 'blocked1', 'stage2', 'blocked2', 'stage3'],
      focus: 'full',
    },
    stage1: {
      highlight: ['user', 'stage1', 'blocked1'],
      activeEdges: ['user->stage1', 'stage1->blocked1'],
      dim: ['stage2', 'blocked2', 'stage3', 'llm'],
      focus: { nodes: ['user', 'stage1', 'blocked1'], padding: 50 },
    },
    stage2: {
      highlight: ['stage1', 'stage2', 'blocked2'],
      activeEdges: ['stage1->stage2', 'stage2->blocked2'],
      pulse: ['stage2'],
      dim: ['user', 'blocked1', 'stage3', 'llm'],
      focus: { nodes: ['stage1', 'stage2', 'blocked2'], padding: 50 },
    },
    stage3: {
      highlight: ['stage2', 'stage3'],
      activeEdges: ['stage2->stage3'],
      dim: ['user', 'stage1', 'blocked1', 'blocked2', 'llm'],
      focus: { nodes: ['stage2', 'stage3'], padding: 60 },
    },
    llm: {
      highlight: ['stage3', 'llm'],
      activeEdges: ['stage3->llm'],
      pulse: ['llm'],
      dim: ['user', 'stage1', 'blocked1', 'stage2', 'blocked2'],
      focus: { nodes: ['stage3', 'llm'], padding: 60 },
    },
    principle: {
      highlight: ['user', 'stage1', 'stage2', 'stage3', 'llm'],
      activeEdges: ['user->stage1', 'stage1->stage2', 'stage2->stage3', 'stage3->llm'],
      focus: 'full',
    },
  },
}
