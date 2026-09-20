<script setup lang="ts">
/*
  Sektions-Baustein nach docs/design-research.md (3.1/3.2), ohne CMS:
  - immer pt-f-24; pb-f-24 nur mit padBottom
  - padBottom = true, wenn die nächste Sektion eine andere Fläche hat (sonst klebt der Inhalt an der Farbkante)
  - padBottom = false, wenn sie dieselbe Fläche hat (sonst doppelter Leerraum)
*/
withDefaults(defineProps<{
  surface?: 'background' | 'card' | 'muted' | 'highlight'
  padBottom?: boolean
  labelledby?: string
}>(), {
  surface: 'background',
  padBottom: false,
})

// highlight ist eine Flächenrolle: Welche Flächenart dahinter steht, entscheidet das Stil-Preset (app/styles/<id>/style.css)
const surfaces = {
  background: 'bg-background',
  card: 'bg-card',
  muted: 'bg-muted',
  highlight: 'surface-highlight',
}
</script>

<template>
  <section :aria-labelledby="labelledby" :class="[surfaces[surface], 'pt-f-24', padBottom && 'pb-f-24']">
    <div class="container-page">
      <slot />
    </div>
  </section>
</template>
