<script setup>
import { computed } from 'vue';
/*
  Nur die Icons importieren, die das Projekt benutzt. `import * as icons` würde alle ~1.500 lucide-Icons
  ins Bundle ziehen, weil der Bundler bei einem dynamischen Zugriff (icons[name]) nichts weglassen kann.
  Neues Icon? Hier importieren und in die Liste `icons` eintragen.
*/
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  GraduationCap,
  Laptop,
  MapPin,
  Menu,
  Palette,
  RotateCcw,
  TriangleAlert,
  X,
} from '@lucide/vue';

const icons = { ArrowLeft, ArrowRight, Check, Clock, Copy, GraduationCap, Laptop, MapPin, Menu, Palette, RotateCcw, TriangleAlert, X };

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: Number,
  color: String,
  strokeWidth: Number,
  defaultClass: String
})

const icon = computed(() => {
  if (import.meta.dev && !icons[props.name])
    console.warn(`[Icon] "${props.name}" ist nicht registriert – in app/components/Icon.vue importieren und eintragen.`);
  return icons[props.name];
});
</script>

<template>
  <component
    :is="icon"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth" :default-class="defaultClass"
  />
</template>
