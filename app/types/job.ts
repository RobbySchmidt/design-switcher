export interface JobSalary {
  min: number
  max: number
  currency: string
  /** Fehlt bei Jahresgehältern, sonst z. B. "Stunde" oder "Monat" */
  unit?: string
}

export interface Job {
  id: number
  slug: string
  title: string
  department: string
  location: string
  workModel: string
  employmentType: string
  experienceLevel: string
  salary: JobSalary
  postedAt: string
  startDate: string
  featured: boolean
  tags: string[]
  shortDescription: string
  description: string
  tasks: string[]
  requirements: string[]
  benefits: string[]
  contact: { name: string, email: string }
}
