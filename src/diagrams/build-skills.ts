import type { DiagramSpec } from '@/components/diagram/diagram.types'

export const buildSkillsDiagram: DiagramSpec = {
  id: 'build-skills',
  title:
    'Four layers of a skills-first agent system: AI Engineer instructs the Agent, which accesses MCP servers and the filesystem, which in turn hosts the executable Skills Layer.',
  a11yDescription:
    'A vertical architecture diagram with four layers. At the top, the AI Engineer defines intent by writing SKILL.md files. Below, the Claude Agent reads those files and orchestrates calls. Flanking the agent, two MCP servers extend its reach — one for tools, one for APIs. Below the agent sits the Filesystem, the persistent layer where SKILL.md and outputs live. At the bottom is the Skills Layer: two active skills (read/write/search and parse/transform) and two composable skills (summarise/draft and analyse/report) — each a self-contained, testable unit.',
  defaultScene: 'overview',

  nodes: [
    { id: 'engineer', label: 'AI Engineer', x: 1, y: 0, tag: 'L1', variant: 'primary' },
    { id: 'agent', label: 'Claude', sublabel: 'agent', x: 1, y: 1, tag: 'L2', variant: 'primary' },
    {
      id: 'mcp-tools',
      label: 'MCP',
      sublabel: 'tools',
      x: 0,
      y: 1,
      variant: 'secondary',
    },
    {
      id: 'mcp-apis',
      label: 'MCP',
      sublabel: 'APIs',
      x: 2,
      y: 1,
      variant: 'secondary',
    },
    {
      id: 'filesystem',
      label: 'Filesystem',
      sublabel: 'SKILL.md · outputs',
      x: 1,
      y: 2,
      tag: 'L3',
      variant: 'secondary',
    },
    {
      id: 'skill-io',
      label: 'Skill',
      sublabel: 'read · write · search',
      x: 0,
      y: 3,
      tag: 'active',
      variant: 'primary',
    },
    {
      id: 'skill-transform',
      label: 'Skill',
      sublabel: 'parse · transform',
      x: 2,
      y: 3,
      tag: 'active',
      variant: 'primary',
    },
    {
      id: 'skill-summarize',
      label: 'Skill',
      sublabel: 'summarise · draft',
      x: 0,
      y: 4,
      variant: 'ghost',
    },
    {
      id: 'skill-analyze',
      label: 'Skill',
      sublabel: 'analyse · report',
      x: 2,
      y: 4,
      variant: 'ghost',
    },
  ],

  edges: [
    { from: 'engineer', to: 'agent', label: 'instructs' },
    { from: 'agent', to: 'mcp-tools' },
    { from: 'agent', to: 'mcp-apis' },
    { from: 'agent', to: 'filesystem' },
    { from: 'filesystem', to: 'skill-io', variant: 'emphasis' },
    { from: 'filesystem', to: 'skill-transform', variant: 'emphasis' },
  ],

  scenes: {
    overview: {
      focus: 'full',
      caption: 'Four layers. One direction of intent.',
    },
    engineer: {
      highlight: ['engineer'],
      dim: [
        'mcp-tools',
        'mcp-apis',
        'filesystem',
        'skill-io',
        'skill-transform',
        'skill-summarize',
        'skill-analyze',
      ],
      focus: { nodes: ['engineer', 'agent'], padding: 80 },
      caption: 'The human in the loop.',
    },
    agent: {
      highlight: ['engineer', 'agent'],
      activeEdges: ['engineer->agent'],
      dim: ['skill-summarize', 'skill-analyze'],
      focus: { nodes: ['engineer', 'agent'], padding: 60 },
      caption: 'The orchestrator — holds intent, not logic.',
    },
    tools: {
      highlight: ['agent', 'mcp-tools', 'mcp-apis'],
      activeEdges: ['agent->mcp-tools', 'agent->mcp-apis'],
      dim: [
        'engineer',
        'filesystem',
        'skill-io',
        'skill-transform',
        'skill-summarize',
        'skill-analyze',
      ],
      focus: { nodes: ['mcp-tools', 'agent', 'mcp-apis'], padding: 40 },
      caption: 'Tools extend reach — but tools are not skills.',
    },
    filesystem: {
      highlight: ['agent', 'filesystem'],
      activeEdges: ['agent->filesystem'],
      dim: ['mcp-tools', 'mcp-apis', 'skill-summarize', 'skill-analyze'],
      focus: { nodes: ['agent', 'filesystem'], padding: 60 },
      caption: 'The persistent layer. Source of truth.',
    },
    skills: {
      highlight: ['filesystem', 'skill-io', 'skill-transform'],
      activeEdges: ['filesystem->skill-io', 'filesystem->skill-transform'],
      pulse: ['skill-io', 'skill-transform'],
      dim: ['engineer', 'agent', 'mcp-tools', 'mcp-apis'],
      focus: {
        nodes: ['filesystem', 'skill-io', 'skill-transform', 'skill-summarize', 'skill-analyze'],
        padding: 30,
      },
      caption: 'Self-contained. Composable. Testable.',
    },
    principle: {
      highlight: ['engineer', 'agent', 'filesystem', 'skill-io', 'skill-transform'],
      activeEdges: ['engineer->agent', 'agent->filesystem', 'filesystem->skill-io'],
      focus: 'full',
      caption: "The agent's only job: decide which skill to call — and when.",
    },
  },
}
