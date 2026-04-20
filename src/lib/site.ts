export const site = {
  name: 'ai.soa.team',
  title: 'ai.soa.team — AI integration architecture',
  description:
    'Long-form writing on AI integration architecture — the systems behind the hype.',
  url: 'https://ai.soa.team',
  author: {
    name: 'Lali Devamanthri',
    role: 'AI integration architect',
    bio: [
      'Solution architect with 12+ years designing systems for regulated industries.',
      'AWS 3× certified. Former solution review board member at the Ministry of Health.',
      'Now focused on AI integration: moving LLMs past demos into production systems that hold up under audit, latency, and real traffic.',
    ],
    credentials: [
      '12+ years as a solution architect',
      'AWS 3× certified',
      'Former solution review board member, Ministry of Health',
      'Healthcare IT & fintech focus',
    ],
    email: 'deva@soa.team',
    linkedin: 'https://www.linkedin.com/in/lalisd/',
  },
  nav: [{ href: '/about/', label: "Let's talk" }],
} as const

export type Site = typeof site
