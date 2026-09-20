<script setup lang="ts">
import type { Job } from '~/types/job'
import jobsData from '~/data/jobs.json'

const jobs = jobsData as Job[]
const route = useRoute()
const job = jobs.find(j => j.slug === route.params.slug)

if (!job)
  throw createError({ statusCode: 404, statusMessage: 'Stelle nicht gefunden', fatal: true })

useSeoMeta({
  title: `${job.title} – Kursbuch`,
  description: job.shortDescription,
})

const meta = [
  { icon: 'MapPin', label: job.location },
  { icon: 'Laptop', label: job.workModel },
  { icon: 'Clock', label: job.employmentType },
  { icon: 'GraduationCap', label: job.experienceLevel },
]

const facts = [
  { label: 'Standort', value: job.location },
  { label: 'Arbeitsmodell', value: job.workModel },
  { label: 'Anstellung', value: job.employmentType },
  { label: 'Erfahrung', value: job.experienceLevel },
  { label: 'Gehalt', value: formatSalary(job.salary) },
  { label: 'Start', value: formatStartDate(job.startDate) },
]

// Aufgaben und Profil sind gleich aufgebaut
const lists = [
  { title: 'Deine Aufgaben', items: job.tasks },
  { title: 'Dein Profil', items: job.requirements },
]

const applyHref = `mailto:${job.contact.email}?subject=${encodeURIComponent(`Bewerbung: ${job.title}`)}`
const initials = job.contact.name.split(' ').map(part => part[0]).join('').slice(0, 2)

// Gleicher Bereich zuerst, danach gleicher Standort
const similarJobs = jobs
  .filter(j => j.id !== job.id && (j.department === job.department || j.location === job.location))
  .sort((a, b) => Number(b.department === job.department) - Number(a.department === job.department))
  .slice(0, 3)
</script>

<template>
  <main v-if="job" class="pb-24 lg:pb-0">
    <!-- Kommentare gehören IN das <main>: Eine Seite braucht genau einen Wurzelknoten, und ein Kommentar davor zählt mit.
         Sonst bricht der Seitenübergang (out-in) und die nächste Seite bleibt leer (NUXT_E4004). -->
    <!-- pb-24 unter lg: Platz für die fixe Bewerben-Leiste auf dem Handy -->
    <PageSection pad-bottom labelledby="stelle-titel">
      <NuxtLink to="/jobs" class="inline-flex items-center gap-1.5 rounded-sm text-base text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
        <Icon name="ArrowLeft" :size="18" />
        Alle offenen Stellen
      </NuxtLink>

      <!-- Kopf: gleiche Bausteine wie auf der Kachel, damit man die Stelle wiedererkennt -->
      <header class="mt-6 flex flex-col gap-4">
        <!-- div statt p: Das Badge rendert ein Block-Element, und das darf nicht in einem <p> stehen (sonst Hydration-Fehler) -->
        <div class="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
          <Badge v-if="job.featured" as="span" class="gap-1.5">
            <span class="badge-dot size-1.5 shrink-0 rounded-dot bg-signal" aria-hidden="true" />
            Top-Job
          </Badge>
          {{ job.department }}
          <!-- Der Trennpunkt hängt am Datum, damit er beim Umbruch auf dem Handy nicht allein am Zeilenende steht -->
          <span class="max-sm:basis-full sm:before:mr-2 sm:before:content-['·']">veröffentlicht {{ formatPostedAt(job.postedAt) }}</span>
        </div>
        <h1 id="stelle-titel" class="max-w-[22ch] type-h1-page">
          {{ job.title }}
        </h1>
        <ul class="flex flex-wrap gap-x-5 gap-y-1 text-base font-medium">
          <li v-for="item in meta" :key="item.icon" class="flex items-center gap-1.5">
            <Icon :name="item.icon" :size="20" class="text-primary" />
            {{ item.label }}
          </li>
        </ul>
      </header>

      <div class="mt-f-12 grid gap-f-12 lg:grid-cols-12 lg:gap-f-16">
        <!-- Auf dem Handy stehen die Fakten direkt unter dem Kopf, am Desktop läuft die Spalte rechts mit -->
        <aside class="flex flex-col gap-6 lg:sticky lg:top-24 lg:order-last lg:col-span-4 lg:self-start">
          <!-- Hervorhebungsfläche: Die Flächenart passt den Bewerben-Button darin an -->
          <div class="surface-highlight flex flex-col gap-5 rounded-xl p-6">
            <h2 class="type-box-title">
              Auf einen Blick
            </h2>
            <dl class="flex flex-col text-base">
              <div v-for="fact in facts" :key="fact.label" class="flex items-baseline justify-between gap-4 border-t-(length:--line-weight) py-2.5 first:border-t-0 first:pt-0 last:pb-0">
                <dt class="text-muted-foreground">
                  {{ fact.label }}
                </dt>
                <dd class="text-right font-semibold tabular-nums">
                  {{ fact.value }}
                </dd>
              </div>
            </dl>
            <!-- Die eine Aktion dieser Seite. Auf dem Handy übernimmt die fixe Leiste unten. -->
            <Button as-child class="hidden h-12 px-7 text-base lg:inline-flex">
              <a :href="applyHref">Jetzt bewerben</a>
            </Button>
          </div>

          <!-- Ansprechperson ohne eigene Karte: gehört zur Bewerbung, Nähe reicht als Gruppierung -->
          <div class="flex items-center gap-3 px-1">
            <Avatar class="size-11">
              <AvatarFallback class="bg-secondary text-base font-semibold text-secondary-foreground">
                {{ initials }}
              </AvatarFallback>
            </Avatar>
            <div class="flex min-w-0 flex-col text-base leading-snug">
              <span class="font-semibold">{{ job.contact.name }}</span>
              <a :href="`mailto:${job.contact.email}`" class="truncate text-primary underline underline-offset-4">
                {{ job.contact.email }}
              </a>
            </div>
          </div>
        </aside>

        <article class="flex flex-col gap-f-12 lg:col-span-8">
          <p class="max-w-[60ch] type-lead">
            {{ job.description }}
          </p>

          <section v-for="list in lists" :key="list.title" class="flex flex-col gap-4">
            <h2 class="type-h3-lg">
              {{ list.title }}
            </h2>
            <ul class="flex max-w-[65ch] list-disc flex-col gap-2 pl-5 marker:text-muted-foreground">
              <li v-for="item in list.items" :key="item" class="pl-1">
                {{ item }}
              </li>
            </ul>
          </section>

          <section class="flex flex-col gap-4">
            <h2 class="type-h3-lg">
              Das bieten wir
            </h2>
            <!-- Häkchen statt Bullet, weil es etwas aussagt: ist enthalten -->
            <ul class="grid max-w-[65ch] gap-x-8 gap-y-2 sm:grid-cols-2">
              <li v-for="benefit in job.benefits" :key="benefit" class="flex items-start gap-2.5">
                <Icon name="Check" :size="20" class="mt-1 shrink-0 text-primary" />
                {{ benefit }}
              </li>
            </ul>
          </section>

          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="tag in job.tags" :key="tag" variant="outline" class="border-foreground/25 text-sm font-normal">
              {{ tag }}
            </Badge>
          </div>
        </article>
      </div>
    </PageSection>

    <PageSection v-if="similarJobs.length" surface="card" pad-bottom labelledby="aehnlich-titel">
      <h2 id="aehnlich-titel" class="mb-f-12 type-h2">
        Ähnliche Stellen
      </h2>
      <ul class="grid gap-f-8 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="similar in similarJobs" :key="similar.id">
          <JobCard :job="similar" heading-level="h3" />
        </li>
      </ul>
    </PageSection>

    <!-- Handy: Bewerben bleibt mit einem Tap erreichbar -->
    <div class="fixed inset-x-0 bottom-0 z-30 border-t-(length:--line-weight) bg-card/95 backdrop-blur lg:hidden">
      <div class="container-page flex items-center justify-between gap-4 py-3">
        <div class="flex min-w-0 flex-col leading-snug">
          <span class="text-sm text-muted-foreground">Gehalt pro {{ job.salary.unit ?? 'Jahr' }}</span>
          <span class="text-base font-semibold tabular-nums">{{ formatSalaryRange(job.salary) }}</span>
        </div>
        <Button as-child class="h-12 shrink-0 px-6 text-base">
          <a :href="applyHref">Jetzt bewerben</a>
        </Button>
      </div>
    </div>
  </main>
</template>
