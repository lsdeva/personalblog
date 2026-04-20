export const site = {
  name: 'ai.soa.team',
  title: 'ai.soa.team — AI integration architecture',
  description:
    'AI integration architect for healthcare & fintech. Writing about the systems behind the hype.',
  url: 'https://ai.soa.team',
  author: {
    name: 'Lali Devamanthri',
    role: 'AI integration architect',
    location: 'Singapore / SEA',
    bio: [
      'Solution architect with 12+ years designing systems for regulated industries.',
      'AWS 3× certified. Former solution review board member at Singapore Ministry of Health.',
      'Now focused on AI integration: moving LLMs past demos into production systems that hold up under audit, latency, and real traffic.',
    ],
    credentials: [
      '12+ years as a solution architect',
      'AWS 3× certified',
      'Ex-MOH (Singapore Ministry of Health) solution review board',
      'Healthcare IT & fintech focus, SEA',
    ],
    email: 'deva@soa.team',
    linkedin: 'https://www.linkedin.com/in/lalisd/',
  },
  nav: [
    { href: '/writing/', label: 'Writing' },
    { href: '/about/', label: 'About' },
    { href: '/work-with-me/', label: 'Work with me' },
  ],
} as const

export type Site = typeof site
