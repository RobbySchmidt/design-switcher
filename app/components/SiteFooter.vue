<script setup lang="ts">
const credits = [
  { name: 'Birk Enwald', href: 'https://unsplash.com/photos/Uyc-eSjCVF8' },
  { name: 'Julia Joppien', href: 'https://unsplash.com/photos/sPPIyVH1DHk' },
]
</script>

<template>
  <footer class="surface-footer">
    <div class="container-page flex flex-col gap-8 py-f-12 text-base">
      <div class="flex flex-col justify-between gap-8 md:flex-row">
        <div class="flex max-w-[40ch] flex-col gap-2">
          <span class="type-wordmark">Kursbuch</span>
          <p class="text-muted-foreground">
            Fahrplansoftware für Verkehrsbetriebe. Hauptsitz Berlin, Teams in sechs Städten.
          </p>
        </div>

        <address class="flex flex-col gap-1 not-italic">
          <span class="font-semibold">Fragen zur Bewerbung</span>
          <a href="mailto:jobs@example.com" class="underline underline-offset-4 hover:text-primary">jobs@example.com</a>
          <a href="tel:+493012345670" class="underline underline-offset-4 hover:text-primary">030 123 456 70</a>
          <span class="text-muted-foreground">Mo–Fr, 9–17 Uhr</span>
        </address>
      </div>

      <div class="flex flex-col gap-2 border-t-(length:--line-weight) pt-6 text-sm text-muted-foreground md:flex-row md:justify-between">
        <span>Kursbuch ist eine erfundene Firma. Diese Seite ist ein Übungsprojekt.</span>
        <span>
          Fotos:
          <template v-for="(credit, index) in credits" :key="credit.href">
            <a :href="credit.href" class="underline underline-offset-4 hover:text-foreground">{{ credit.name }}</a><template v-if="index < credits.length - 1">, </template>
          </template>
          (Unsplash)
        </span>
      </div>
    </div>
  </footer>
</template>
