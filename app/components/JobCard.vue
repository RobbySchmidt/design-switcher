<script setup lang="ts">
import type { Job } from '~/types/job'

const props = withDefaults(defineProps<{
  job: Job
  /** Überschriftenebene passend zur Umgebung, damit keine Ebene übersprungen wird */
  headingLevel?: 'h2' | 'h3'
}>(), {
  headingLevel: 'h2',
})

const MAX_TAGS = 3

const meta = computed(() => [
  { icon: 'MapPin', label: props.job.location },
  { icon: 'Laptop', label: props.job.workModel },
  { icon: 'Clock', label: props.job.employmentType },
])
</script>

<template>
  <NuxtLink
    :to="`/jobs/${job.slug}`"
    class="tile group flex h-full flex-col gap-5 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    :class="job.featured && 'tile-featured'"
  >
    <!--
      Karte = `tile`: Fläche, Kante oder Schatten kommen aus dem Stil-Preset. Top-Jobs tragen zusätzlich die
      Flächenrolle `tile-featured`; deren Flächenart überschreibt die Tokens in ihrem Scope, deshalb braucht
      die Kachel keine zweite Klassenliste.
    -->
    <!-- Gruppe 1: einordnen und benennen – eng, weil es zusammengehört -->
    <div class="flex flex-col gap-2">
      <!-- min-h-6 = Höhe des Badges, damit die Titel mit und ohne Top-Job auf einer Linie sitzen -->
      <div class="flex min-h-6 items-center justify-between gap-3 text-sm text-muted-foreground">
        <span class="flex items-center gap-2">
          <!-- Beide Markenfarben zusammen: blaues Badge (Schrift 12.5:1), darin der rote Punkt als Grafik (3.3:1) -->
          <Badge v-if="job.featured" as="span" class="gap-1.5">
            <span class="badge-dot size-1.5 shrink-0 rounded-dot bg-signal" aria-hidden="true" />
            Top-Job
          </Badge>
          {{ job.department }}
        </span>
        <span class="shrink-0">{{ formatPostedAt(job.postedAt) }}</span>
      </div>

      <component :is="headingLevel" class="line-clamp-2 type-h3">
        {{ job.title }}
      </component>

      <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
        <li v-for="item in meta" :key="item.icon" class="flex items-center gap-1.5">
          <Icon :name="item.icon" :size="16" class="text-primary" />
          {{ item.label }}
        </li>
      </ul>
    </div>

    <!-- Gruppe 2: überzeugen – bewusst leise -->
    <p class="line-clamp-2 text-base leading-normal text-muted-foreground">
      {{ job.shortDescription }}
    </p>

    <div class="flex flex-wrap items-center gap-1.5">
      <Badge
        v-for="tag in job.tags.slice(0, MAX_TAGS)"
        as="span"
        :key="tag"
        variant="outline"
        class="border-foreground/25 font-normal"
      >
        {{ tag }}
      </Badge>
      <span v-if="job.tags.length > MAX_TAGS" class="text-xs text-muted-foreground">
        +{{ job.tags.length - MAX_TAGS }}
      </span>
    </div>

    <!-- Gruppe 3: handeln – mt-auto hält den Fuß in jeder Kachel auf derselben Höhe -->
    <div class="mt-auto flex items-center justify-between gap-4 border-t-(length:--line-weight) border-foreground/15 pt-4">
      <span class="text-base font-semibold tabular-nums">
        {{ formatSalary(job.salary) }}
      </span>
      <Icon
        name="ArrowRight"
        :size="20"
        class="shrink-0 text-primary transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </div>
  </NuxtLink>
</template>
