<script setup lang="ts">
/*
  Die Signatur der Seite: offene Stellen als Abfahrtstafel. Das Startdatum der Stelle ist die "Abfahrt".
  Fläche (`surface-board`) und Einstiegsbewegung (`--board-row-animation`) kommen aus dem Stil-Preset.
*/
import type { Job } from '~/types/job'

const props = withDefaults(defineProps<{ jobs: Job[], limit?: number }>(), { limit: 5 })

const departures = computed(() =>
  [...props.jobs]
    .sort((a, b) => departureOrder(a.startDate) - departureOrder(b.startDate) || a.title.localeCompare(b.title))
    .slice(0, props.limit),
)
</script>

<template>
  <div class="surface-board overflow-hidden rounded-xl">
    <div class="board-head flex items-baseline justify-between gap-4 px-5 pt-5 pb-4 sm:px-6">
      <h2 id="abfahrten" class="type-box-title">
        Nächste Abfahrten
      </h2>
      <span class="text-sm text-muted-foreground">Einstieg bei Kursbuch</span>
    </div>

    <!-- Spaltenköpfe wie auf der Tafel: Versalien, leicht gesperrt -->
    <div class="board-cols board-grid border-t-(length:--line-weight) px-5 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:px-6" aria-hidden="true">
      <span>Start</span>
      <span>Stelle</span>
      <span class="hidden text-right sm:block">Ort</span>
    </div>

    <ul aria-labelledby="abfahrten">
      <li
        v-for="(job, index) in departures"
        :key="job.id"
        class="board-row border-t-(length:--line-weight)"
        :style="{ '--row': index }"
      >
        <NuxtLink
          :to="`/jobs/${job.slug}`"
          class="board-grid items-center px-5 py-3.5 transition-colors duration-150 hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset sm:px-6"
        >
          <span class="flex items-center gap-2 type-board tabular-nums">
            <!-- Signalrot nur als Grafik: markiert, was sofort losfährt -->
            <span
              class="size-2 shrink-0 rounded-dot"
              :class="job.startDate === 'ab sofort' ? 'bg-signal' : 'bg-transparent'"
              aria-hidden="true"
            />
            {{ formatDeparture(job.startDate) }}
          </span>
          <span class="flex min-w-0 flex-col">
            <span class="truncate type-board">{{ shortTitle(job.title) }}</span>
            <span class="truncate text-sm text-muted-foreground">
              <span class="sm:hidden">{{ job.location }} · </span>{{ job.workModel }} · {{ job.employmentType }}
            </span>
          </span>
          <span class="hidden text-right text-base sm:block">{{ job.location }}</span>
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink
      to="/jobs"
      class="board-foot flex items-center justify-between gap-4 border-t-(length:--line-weight) px-5 py-4 text-base font-semibold transition-colors duration-150 hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset sm:px-6"
    >
      Alle {{ jobs.length }} Stellen auf der Tafel
      <Icon name="ArrowRight" :size="20" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.board-grid {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  column-gap: 1rem;
}
@media (min-width: 40rem) {
  .board-grid {
    grid-template-columns: 5.5rem minmax(0, 1fr) auto;
  }
}
</style>
