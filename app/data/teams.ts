// Die drei Teams der Landingpage. "departments" verbindet sie mit den Bereichen aus jobs.json,
// "slug" ist der Filterwert für /jobs?team=…
export interface Team {
  slug: string
  name: string
  departments: string[]
  description: string
  tools: string
}

export const teams: Team[] = [
  {
    slug: 'entwicklung',
    name: 'Entwicklung & Infrastruktur',
    departments: ['Entwicklung', 'Infrastruktur'],
    description: 'Der Umlaufplaner verteilt jede Nacht rund 38.000 Fahrten auf Fahrzeuge und Dienste. Du baust an dem Rechenkern, an den Oberflächen für die Planer oder an der Plattform, auf der beides läuft.',
    tools: 'Vue 3, Nuxt, TypeScript, Node.js, PostgreSQL, Kubernetes',
  },
  {
    slug: 'produkt',
    name: 'Produkt & Design',
    departments: ['Produkt', 'Design'],
    description: 'Fahrplaner arbeiten acht Stunden am Tag in unserer Software. Du sitzt regelmäßig neben ihnen in der Leitstelle, siehst zu, fragst nach und entscheidest danach, was wir als Nächstes bauen.',
    tools: 'Figma, Nutzerinterviews, Roadmap, Analytics',
  },
  {
    slug: 'kundennaehe',
    name: 'Marketing & Customer Success',
    departments: ['Marketing', 'Customer Success'],
    description: 'Wenn ein Verkehrsbetrieb zum Fahrplanwechsel umstellt, bist du die erste Ansprechperson. Das Marketing erklärt dieselbe Arbeit nach außen, ohne Buzzwords.',
    tools: 'Ticketsystem, Hilfe-Artikel, Newsletter, SEO',
  },
]
