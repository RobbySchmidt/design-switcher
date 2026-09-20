<script setup lang="ts">
/*
  Navigation als Linienband, wie es in der Straßenbahn über der Tür hängt:
  Die Menüpunkte sind Haltestellen auf einer Linie. Beim Scrollen färbt sich die Strecke bis zur
  aktuellen Sektion rot; der Halt, in dem man gerade steht, ist gefüllt.
  Ohne JavaScript ist es eine normale Linkliste mit grauer Linie – nichts hängt an der Animation.
*/
const stops = [
  { id: 'arbeit', label: 'Arbeit' },
  { id: 'regeln', label: 'Regeln' },
  { id: 'ablauf', label: 'Bewerbung' },
  { id: 'fragen', label: 'Fragen' },
]

const route = useRoute()
const passedIndex = ref(-1) // letzter Halt, an dem man schon vorbei ist
const insideIndex = ref(-1) // Halt, in dessen Sektion man gerade steht
const menuOpen = ref(false)

let frame = 0
function measure() {
  frame = 0
  const middle = window.innerHeight * 0.4
  let passed = -1
  let inside = -1
  stops.forEach((stop, index) => {
    const rect = document.getElementById(stop.id)?.getBoundingClientRect()
    if (!rect || rect.top > middle)
      return
    passed = index
    if (rect.bottom > middle)
      inside = index
  })
  passedIndex.value = passed
  insideIndex.value = inside
}
function onScroll() {
  if (!frame)
    frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})
// Die Sektionen gibt es nur auf der Startseite: nach jedem Seitenwechsel neu messen (nach dem Übergang)
watch(() => route.fullPath, () => {
  menuOpen.value = false
  setTimeout(measure, 450)
})
</script>

<template>
  <header class="surface-header sticky top-0 z-40">
    <div class="container-page flex h-18 items-center justify-between gap-4 lg:gap-8">
      <NuxtLink to="/" class="flex items-center gap-2.5 rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" aria-label="Kursbuch – Startseite">
        <!-- Signet: Haltestellenkreis wie auf dem Netzplan -->
        <span class="flex size-7 items-center justify-center rounded-dot border-(length:--line-weight-strong) border-foreground" aria-hidden="true">
          <span class="size-2 rounded-dot bg-signal" />
        </span>
        <span class="type-wordmark">Kursbuch</span>
      </NuxtLink>

      <!-- Linienband (ab lg). Gleich breite Spalten, damit jede Teilstrecke von Halt zu Halt reicht. -->
      <nav aria-label="Hauptnavigation" class="hidden lg:block">
        <ol class="line-strip grid auto-cols-30 grid-flow-col">
          <li
            v-for="(stop, index) in stops"
            :key="stop.id"
            class="line-strip-stop"
            :data-passed="index <= passedIndex || undefined"
            :data-segment="index < passedIndex || undefined"
          >
            <NuxtLink
              :to="`/#${stop.id}`"
              :aria-current="index === insideIndex ? 'true' : undefined"
              class="group flex flex-col items-center gap-1.5 rounded-sm pt-1 pb-0.5 text-base text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-[current]:font-semibold aria-[current]:text-foreground"
            >
              <span class="line-strip-dot" :data-inside="index === insideIndex || undefined" aria-hidden="true" />
              {{ stop.label }}
            </NuxtLink>
          </li>
        </ol>
      </nav>

      <div class="flex items-center gap-2">
        <!-- Auf einer farbigen oder dunklen Kopfzeile passt die Flächenart den Primär-Button an. -->
        <Button as-child class="h-11 px-4 text-base sm:px-5">
          <NuxtLink to="/jobs">
            <!-- Ein gemeinsames span: Der Button ist ein Flex-Container mit gap, zwei Textknoten bekämen sonst eine Lücke -->
            <span>Offene Stellen<span class="max-sm:sr-only"> ansehen</span></span>
          </NuxtLink>
        </Button>

        <!-- Handy und Tablet: dasselbe Linienband, senkrecht -->
        <Sheet v-model:open="menuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="size-11 hover:bg-foreground/10 hover:text-foreground lg:hidden" aria-label="Menü öffnen">
              <!-- size-6: Der Button setzt Icons ohne size-Klasse auf 16 px -->
              <Icon name="Menu" class="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="surface-header border-l-0 p-6">
            <SheetTitle class="type-h3 text-foreground">
              Nächste Halte
            </SheetTitle>
            <SheetDescription class="sr-only">
              Navigation zu den Abschnitten der Startseite
            </SheetDescription>
            <nav aria-label="Hauptnavigation mobil" class="mt-4">
              <ol class="line-strip-vertical flex flex-col">
                <li
                  v-for="(stop, index) in stops"
                  :key="stop.id"
                  class="line-strip-stop-vertical"
                  :data-passed="index <= passedIndex || undefined"
                  :data-segment="index < passedIndex || undefined"
                >
                  <NuxtLink
                    :to="`/#${stop.id}`"
                    :aria-current="index === insideIndex ? 'true' : undefined"
                    class="flex min-h-12 items-center gap-4 rounded-sm text-f-xl text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-[current]:font-semibold aria-[current]:text-foreground"
                    @click="menuOpen = false"
                  >
                    <span class="line-strip-dot" :data-inside="index === insideIndex || undefined" aria-hidden="true" />
                    {{ stop.label }}
                  </NuxtLink>
                </li>
              </ol>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Halt: Ring in der Sekundärfarbe der Fläche; "passed" wird zum Signal, "inside" zusätzlich gefüllt. */
.line-strip-dot {
  position: relative;
  z-index: 1;
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  border-radius: var(--style-radius-dot);
  border: var(--line-weight-strong) solid var(--muted-foreground);
  background: var(--surface-bg);
  transition: border-color 200ms ease-out, background-color 200ms ease-out;
}
[data-passed] .line-strip-dot {
  border-color: var(--signal);
}
.line-strip-dot[data-inside] {
  background: var(--signal);
}

/* Waagerecht: Teilstrecke von der Mitte dieses Halts bis zur Mitte des nächsten */
.line-strip-stop {
  position: relative;
}
.line-strip-stop:not(:last-child)::after {
  content: '';
  position: absolute;
  top: calc(0.25rem + 0.4375rem - var(--line-weight-strong) / 2); /* pt-1 + halber Halt - halbe Linie */
  left: 50%;
  width: 100%;
  height: var(--line-weight-strong);
  background: var(--border);
  transition: background-color 200ms ease-out;
}
.line-strip-stop[data-segment]::after {
  background: var(--signal);
}

/* Senkrecht (Sheet): Teilstrecke nach unten bis zum nächsten Halt */
.line-strip-stop-vertical {
  position: relative;
}
.line-strip-stop-vertical:not(:last-child)::after {
  content: '';
  position: absolute;
  left: calc(0.4375rem - var(--line-weight-strong) / 2);
  top: 50%;
  height: 100%;
  width: var(--line-weight-strong);
  background: var(--border);
}
.line-strip-stop-vertical[data-segment]::after {
  background: var(--signal);
}

@media (prefers-reduced-motion: reduce) {
  .line-strip-dot,
  .line-strip-stop::after {
    transition: none;
  }
}
</style>
