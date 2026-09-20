<script setup lang="ts">
import type { Job } from '~/types/job'
import jobsData from '~/data/jobs.json'
import { teams } from '~/data/teams'

useSeoMeta({
  title: 'Offene Stellen bei Kursbuch',
  description: 'Alle offenen Stellen bei Kursbuch mit Gehaltsband, Arbeitsmodell und Startdatum.',
})

const allJobs = sortJobs(jobsData as Job[])
const route = useRoute()

// Filter über die URL (/jobs?team=entwicklung): teilbar, funktioniert ohne Zustand und mit dem Zurück-Button
const activeTeam = computed(() => teams.find(team => team.slug === route.query.team))

const jobs = computed(() =>
  activeTeam.value
    ? allJobs.filter(job => activeTeam.value!.departments.includes(job.department))
    : allJobs,
)

const filters = computed(() => [
  { label: 'Alle', to: { path: '/jobs' }, active: !activeTeam.value, count: allJobs.length },
  ...teams.map(team => ({
    label: team.name,
    to: { path: '/jobs', query: { team: team.slug } },
    active: activeTeam.value?.slug === team.slug,
    count: allJobs.filter(job => team.departments.includes(job.department)).length,
  })),
])
</script>

<template>
  <main>
    <PageSection pad-bottom labelledby="stellen-titel">
      <h1 id="stellen-titel" class="type-h1-page">
        Offene Stellen
      </h1>
      <p class="mt-4 max-w-[60ch] type-lead text-muted-foreground">
        {{ jobs.length === allJobs.length ? `${allJobs.length} Stellen` : `${jobs.length} von ${allJobs.length} Stellen` }},
        jede mit Gehaltsband, Arbeitsmodell und Startdatum.
      </p>

      <nav aria-label="Stellen nach Team filtern" class="mt-f-8 mb-f-12 flex flex-wrap gap-2">
        <NuxtLink
          v-for="filter in filters"
          :key="filter.label"
          :to="filter.to"
          :aria-current="filter.active ? 'page' : undefined"
          class="inline-flex h-11 items-center gap-2 rounded-pill border-(length:--line-weight) px-4 text-base font-medium transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          :class="filter.active ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent bg-secondary hover:border-primary'"
        >
          {{ filter.label }}
          <span class="tabular-nums" :class="filter.active ? 'text-primary-foreground' : 'text-primary'">{{ filter.count }}</span>
        </NuxtLink>
      </nav>

      <ul class="grid gap-f-8 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="job in jobs" :key="job.id">
          <JobCard :job="job" />
        </li>
      </ul>
    </PageSection>
  </main>
</template>
