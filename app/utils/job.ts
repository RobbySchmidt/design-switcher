import type { Job, JobSalary } from '~/types/job'

const numberFormat = new Intl.NumberFormat('de-DE')
const relativeFormat = new Intl.RelativeTimeFormat('de', { numeric: 'auto' })
const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
const shortDateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' })

const DAY_IN_MS = 24 * 60 * 60 * 1000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const NBSP = '\u00A0' // geschütztes Leerzeichen

// "55.000 – 70.000 € / Jahr" bzw. "15 – 18 € / Stunde" – mit geschützten Leerzeichen, damit "€" nie allein umbricht
export function formatSalary(salary: JobSalary) {
  return `${formatSalaryRange(salary)} /${NBSP}${salary.unit ?? 'Jahr'}`
}

// Nur die Spanne ("55.000 – 70.000 €") – für enge Stellen, an denen die Einheit im Label steht
export function formatSalaryRange(salary: JobSalary) {
  return `${numberFormat.format(salary.min)}${NBSP}–${NBSP}${numberFormat.format(salary.max)}${NBSP}€`
}

// startDate ist entweder Freitext ("ab sofort") oder ein ISO-Datum ("2026-11-01")
export function formatStartDate(startDate: string) {
  return ISO_DATE.test(startDate)
    ? dateFormat.format(new Date(startDate))
    : startDate
}

// Kurzform für die Abfahrtstafel: "sofort", "01.11.", "flexibel"
export function formatDeparture(startDate: string) {
  if (ISO_DATE.test(startDate))
    return shortDateFormat.format(new Date(startDate))
  return startDate === 'ab sofort' ? 'sofort' : 'flexibel'
}

// Reihenfolge auf der Tafel: "ab sofort" zuerst, dann nach Datum, Freitext ans Ende
export function departureOrder(startDate: string) {
  if (startDate === 'ab sofort')
    return 0
  return ISO_DATE.test(startDate) ? new Date(startDate).getTime() : Number.MAX_SAFE_INTEGER
}

// "heute", "gestern", "vor 5 Tagen" – ab 30 Tagen das Datum
export function formatPostedAt(postedAt: string) {
  const days = Math.floor((Date.now() - new Date(postedAt).getTime()) / DAY_IN_MS)
  return days < 30
    ? relativeFormat.format(-Math.max(days, 0), 'day')
    : dateFormat.format(new Date(postedAt))
}

// Titel ohne "(m/w/d)" – für enge Stellen wie die Abfahrtstafel
export function shortTitle(title: string) {
  return title.replace(/\s*\(m\/w\/d\)\s*$/, '')
}

// Top-Jobs zuerst, danach die neuesten
export function sortJobs(jobs: Job[]) {
  return [...jobs].sort((a, b) =>
    Number(b.featured) - Number(a.featured) || b.postedAt.localeCompare(a.postedAt),
  )
}
