<script setup lang="ts">
import type { Job } from '~/types/job'
import jobsData from '~/data/jobs.json'
import { teams } from '~/data/teams'

const jobs = jobsData as Job[]

useSeoMeta({
  title: 'Arbeiten bei Kursbuch – Fahrplansoftware aus Berlin',
  description: 'Kursbuch rechnet die Fahrpläne von 61 Verkehrsbetrieben. Offene Stellen in Entwicklung, Design, Produkt und Support – mit Gehaltsangabe in jeder Anzeige.',
})

const topJobs = sortJobs(jobs).slice(0, 3)

const teamsWithCount = teams.map(team => ({
  ...team,
  openJobs: jobs.filter(job => team.departments.includes(job.department)).length,
}))

const facts = [
  { value: '61', label: 'Verkehrsbetriebe planen ihren Fahrplan mit Kursbuch' },
  { value: '38.000', label: 'Fahrten verteilt der Umlaufplaner jede Nacht neu' },
  { value: '143', label: 'Kolleginnen und Kollegen in sechs Städten' },
]

const rules = [
  { title: 'Releases dienstags bis donnerstags', text: 'Nie freitags, nie nach 16 Uhr. Zum Fahrplanwechsel im Dezember gilt zwei Wochen Änderungsstopp.' },
  { title: 'Das Gehalt steht in der Anzeige', text: 'Jede Stelle nennt ihr Gehaltsband. Intern sind die Bänder aller Stufen für alle einsehbar.' },
  { title: 'Rufbereitschaft ist freiwillig', text: 'Wer sie übernimmt, bekommt 450 € pro Woche und den Folgetag frei, wenn nachts etwas war.' },
  { title: 'Mittwoch ohne Meetings', text: 'Ein Tag pro Woche gehört der konzentrierten Arbeit. Kalendereinladungen für Mittwoch lehnt das System ab.' },
  { title: 'Zwei Tage im Jahr in der Leitstelle', text: 'Alle, auch Entwicklung und Marketing, sitzen einmal im Halbjahr neben den Fahrplanern unserer Kunden.' },
  { title: 'Remote ist der Normalfall', text: 'Die Büros in Berlin und Hamburg sind offen, Pflichttage gibt es nicht. Viermal im Jahr treffen sich die Teams vor Ort.' },
]

const benefits = [
  { value: '30 Tage', text: 'Urlaub. Der 24. und der 31. Dezember sind zusätzlich frei.' },
  { value: '1.500 €', text: 'Weiterbildungsbudget pro Jahr, dazu fünf Arbeitstage für Konferenzen oder Kurse.' },
  { value: '58 €', text: 'Das Deutschlandticket zahlen wir komplett. Bei einer Fahrplanfirma liegt das nahe.' },
  { value: '4 %', text: 'Zuschuss zur betrieblichen Altersvorsorge ab dem ersten Monat.' },
  { value: 'Deine Wahl', text: 'Laptop, Bildschirm und Stuhl suchst du dir aus, auch für zu Hause.' },
]

const steps = [
  { title: 'Bewerbung', duration: '10 Minuten', text: 'Lebenslauf oder LinkedIn-Profil reicht. Ein Anschreiben brauchst du nicht.' },
  { title: 'Kennenlernen', duration: '30 Minuten, Video', text: 'Du sprichst mit deiner späteren Teamleitung. Antwort auf jede Bewerbung innerhalb von fünf Werktagen.' },
  { title: 'Fachgespräch', duration: '90 Minuten', text: 'Mit zwei Leuten aus dem Team, an einer echten Aufgabe aus unserem Alltag. Keine Hausaufgabe vorab.' },
  { title: 'Angebot', duration: 'innerhalb von 3 Werktagen', text: 'Schriftlich, mit Gehalt und Startdatum. Absagen begründen wir.' },
]

const faqs = [
  { question: 'Brauche ich Erfahrung im öffentlichen Verkehr?', answer: 'Nein. Die meisten von uns kannten Umläufe und Dienstpläne vorher nur als Fahrgast. In den ersten vier Wochen bekommst du eine Einführung in die Fahrplanung und einen Tag in einer Leitstelle.' },
  { question: 'Kann ich vollständig remote arbeiten?', answer: 'Bei den meisten Stellen ja, innerhalb Deutschlands. In jeder Anzeige steht das Arbeitsmodell: Remote, Hybrid oder Vor Ort. Die vier Teamtreffen im Jahr finden vor Ort statt, Reise und Hotel zahlen wir.' },
  { question: 'Wie lange dauert der Bewerbungsprozess?', answer: 'Im Schnitt 16 Tage von der Bewerbung bis zum Angebot. Wenn du eine Frist bei einem anderen Arbeitgeber hast, sag es im ersten Gespräch, dann ziehen wir die Termine vor.' },
  { question: 'Stellt ihr Quereinsteiger ein?', answer: 'Im Support und im Marketing regelmäßig. In der Entwicklung zählt, was du gebaut hast, nicht der Abschluss. Für den Einstieg ohne Berufserfahrung gibt es die Ausbildung zum Fachinformatiker.' },
  { question: 'Geht auch Teilzeit?', answer: 'Ja, ab 20 Stunden pro Woche in fast allen Rollen. Das Gehaltsband gilt anteilig, Urlaubstage und Weiterbildungsbudget auch.' },
]
</script>

<template>
  <main>
    <!-- 1 · Versprechen + Aktion. Split 7/5, die Tafel ist das eine dominante Element neben der Headline. -->
    <PageSection labelledby="hero-titel">
      <div class="grid items-center gap-f-16 lg:grid-cols-12">
        <div class="flex flex-col items-start gap-6 lg:col-span-7">
          <h1 id="hero-titel" class="max-w-[16ch] type-h1 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none">
            Wir rechnen die <span class="text-signal">Fahrpläne</span>, nach denen Städte aufstehen.
          </h1>
          <p class="max-w-[54ch] type-lead text-muted-foreground">
            Wenn um 5:12&nbsp;Uhr die erste Bahn fährt, hat unser Code mitgerechnet. Kursbuch baut die Planungssoftware für 61&nbsp;Verkehrsbetriebe, und dafür suchen wir Leute in Entwicklung, Design, Produkt und Support.
          </p>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <Button as-child class="h-12 px-7 text-base">
              <NuxtLink to="/jobs">
                Offene Stellen ansehen
              </NuxtLink>
            </Button>
            <NuxtLink to="/#ablauf" class="rounded-sm text-base font-semibold text-primary underline underline-offset-4 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              So läuft die Bewerbung ab
            </NuxtLink>
          </div>
        </div>

        <DepartureBoard :jobs="jobs" class="lg:col-span-5" />
      </div>
    </PageSection>

    <!-- 2 · Beweis. Ein Band, keine Karten: drei Zahlen, getrennt nur durch Linien. -->
    <PageSection pad-bottom>
      <dl class="grid gap-8 border-t-(length:--line-weight) pt-8 sm:grid-cols-3 sm:gap-0">
        <div v-for="fact in facts" :key="fact.value" class="flex flex-col-reverse gap-1 sm:border-r-(length:--line-weight) sm:px-8 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
          <dt class="max-w-[28ch] text-base text-muted-foreground">
            {{ fact.label }}
          </dt>
          <dd class="type-figure text-primary tabular-nums">
            {{ fact.value }}
          </dd>
        </div>
      </dl>
    </PageSection>

    <!-- 3 · Angebot. Split 5/7 mit Foto; die Teams sind Zeilen, keine Karten. -->
    <PageSection id="arbeit" surface="card" pad-bottom labelledby="arbeit-titel" class="scroll-mt-20">
      <div class="grid gap-f-16 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <div class="relative overflow-hidden rounded-xl after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-foreground/10 after:ring-inset lg:sticky lg:top-24">
            <!-- NuxtImg: liefert WebP und ein srcset passend zu "sizes" (bis md volle Breite, ab lg 480 px).
                 Wichtig: Jede Angabe braucht einen Breakpoint-Namen. Ein nacktes "100vw" kann das Modul nicht in Pixel umrechnen. -->
            <NuxtImg
              src="/images/tram-fernsehturm.jpg"
              format="webp"
              quality="75"
              sizes="xs:100vw sm:100vw md:100vw lg:480px"
              alt="Gelbe Straßenbahn vor dem Berliner Fernsehturm, im Führerstand leuchtet die Zielanzeige"
              width="1200"
              height="1800"
              loading="lazy"
              class="aspect-4/5 w-full object-cover object-bottom"
            />
          </div>
        </div>

        <div class="flex flex-col lg:col-span-7">
          <h2 id="arbeit-titel" class="type-h2">
            Woran du bei uns arbeitest
          </h2>
          <p class="mt-4 mb-f-12 max-w-[60ch] type-lead text-muted-foreground">
            Drei Teams, ein Produkt. Jedes Team nimmt Leute auf, die Zahl dahinter zeigt, wie viele gerade.
          </p>

          <ul class="flex flex-col">
            <li v-for="team in teamsWithCount" :key="team.slug" class="flex flex-col gap-3 border-t-(length:--line-weight) py-8 last:pb-0">
              <h3 class="type-h3-lg">
                {{ team.name }}
              </h3>
              <p class="max-w-[65ch]">
                {{ team.description }}
              </p>
              <p class="text-base text-muted-foreground">
                {{ team.tools }}
              </p>
              <NuxtLink
                :to="{ path: '/jobs', query: { team: team.slug } }"
                class="group mt-1 inline-flex items-center gap-2 self-start rounded-sm text-base font-semibold text-primary underline underline-offset-4 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {{ team.openJobs }} offene Stellen in {{ team.name }}
                <Icon name="ArrowRight" :size="18" class="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </PageSection>

    <!-- 4 · Vertrauen. Konkrete Regeln statt Werte-Claims, als zweispaltige Liste – auf der Hervorhebungsfläche, dem Farbhöhepunkt der Seite (welche Flächenart dahinter steht, entscheidet das Stil-Preset). -->
    <PageSection id="regeln" surface="highlight" pad-bottom labelledby="regeln-titel" class="scroll-mt-20">
      <h2 id="regeln-titel" class="max-w-[20ch] type-h2">
        So arbeiten wir, in sechs Regeln
      </h2>
      <p class="mt-4 mb-f-12 max-w-[60ch] type-lead text-muted-foreground">
        Unsere Kunden fahren nach Plan. Wir halten es bei der Arbeit genauso und schreiben auf, was gilt.
      </p>

      <dl class="grid gap-x-f-16 sm:grid-cols-2">
        <div v-for="rule in rules" :key="rule.title" class="flex flex-col gap-2 border-t-(length:--line-weight) py-6">
          <!-- Signal als Grafik auf der Hervorhebungsfläche (≥ 3:1, siehe Konzept des Presets) -->
          <span class="-mt-6 mb-4 h-(--line-weight-strong) w-10 bg-signal" aria-hidden="true" />
          <dt class="type-h3">
            {{ rule.title }}
          </dt>
          <dd class="max-w-[52ch] text-muted-foreground">
            {{ rule.text }}
          </dd>
        </div>
      </dl>
    </PageSection>

    <!-- 5 · Emotion und visueller Höhepunkt in der Seitenmitte: ein Bild über die volle Breite, ohne Text darauf. -->
    <figure class="bg-background">
      <NuxtImg
        src="/images/friedrichstrasse-regen.jpg"
        format="webp"
        quality="72"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
        alt="Berliner Friedrichstraße im Regen: eine gelbe Straßenbahn hält an der Haltestelle, die Abfahrtsanzeiger leuchten"
        width="2000"
        height="2500"
        loading="lazy"
        class="aspect-4/3 w-full object-cover object-[50%_72%] md:aspect-21/9"
      />
      <figcaption class="container-page pt-3 text-sm text-muted-foreground">
        Berlin, Friedrichstraße. Für Tage wie diesen planen wir Puffer in den Umlauf ein.
      </figcaption>
    </figure>

    <!-- 6 · Angebot, zweiter Teil. Split 4/8, rechts eine Tabelle: Wert links, Erklärung rechts. -->
    <PageSection surface="background" labelledby="leistungen-titel">
      <div class="grid gap-f-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <h2 id="leistungen-titel" class="type-h2">
            Was du bekommst
          </h2>
          <p class="mt-4 max-w-[40ch] type-lead text-muted-foreground">
            Zusätzlich zum Gehalt, das in jeder Anzeige steht.
          </p>
        </div>

        <dl class="lg:col-span-8">
          <div v-for="benefit in benefits" :key="benefit.value" class="grid gap-x-8 gap-y-1 border-t-(length:--line-weight) py-5 last:border-b-(length:--line-weight) sm:grid-cols-[11rem_1fr] sm:items-baseline">
            <dt class="type-figure-sm text-primary tabular-nums">
              {{ benefit.value }}
            </dt>
            <dd class="max-w-[58ch]">
              {{ benefit.text }}
            </dd>
          </div>
        </dl>
      </div>
    </PageSection>

    <!-- 7 · Ablauf. Echte Reihenfolge, deshalb Nummern – gezeichnet als Linie mit Haltestellen. -->
    <PageSection id="ablauf" labelledby="ablauf-titel" class="scroll-mt-20">
      <h2 id="ablauf-titel" class="max-w-[22ch] type-h2">
        Vier Halte bis zum Angebot
      </h2>
      <p class="mt-4 mb-f-12 max-w-[60ch] type-lead text-muted-foreground">
        Im Schnitt vergehen 16&nbsp;Tage zwischen Bewerbung und Angebot.
      </p>

      <ol class="line-map grid gap-y-8 lg:grid-cols-4 lg:gap-x-8">
        <li v-for="(step, index) in steps" :key="step.title" class="line-stop relative flex flex-col gap-2 pl-10 lg:pt-10 lg:pl-0">
          <span class="line-dot" :class="index === steps.length - 1 && 'line-dot-end'" aria-hidden="true" />
          <h3 class="type-h3">
            <span class="tabular-nums text-primary">{{ index + 1 }}&ensp;</span>{{ step.title }}
          </h3>
          <p class="text-base font-semibold">
            {{ step.duration }}
          </p>
          <p class="max-w-[36ch] text-base text-muted-foreground">
            {{ step.text }}
          </p>
        </li>
      </ol>
    </PageSection>

    <!-- 8 · Einwände. Accordion, weil man nur einzelne Antworten braucht; mehrere dürfen offen sein. -->
    <PageSection id="fragen" pad-bottom labelledby="fragen-titel" class="scroll-mt-20">
      <div class="grid gap-f-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <h2 id="fragen-titel" class="type-h2">
            Häufige Fragen
          </h2>
          <p class="mt-4 max-w-[40ch] type-lead text-muted-foreground">
            Deine steht nicht dabei? Schreib an
            <a href="mailto:jobs@example.com" class="font-semibold text-primary underline underline-offset-4">jobs@example.com</a>.
          </p>
        </div>

        <Accordion type="multiple" class="border-t-(length:--line-weight) lg:col-span-8">
          <AccordionItem v-for="faq in faqs" :key="faq.question" :value="faq.question" class="border-b-(length:--line-weight) last:border-b-(length:--line-weight)">
            <AccordionTrigger class="py-5 font-sans text-f-xl font-semibold [&>svg]:size-5 [&>svg]:translate-y-1 [&>svg]:text-primary">
              {{ faq.question }}
            </AccordionTrigger>
            <AccordionContent class="max-w-[65ch] pb-6 text-f-lg leading-[1.55] text-muted-foreground">
              {{ faq.answer }}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageSection>

    <!-- 9 · Aktion. Das einzige Dreier-Kartenraster der Seite: Stellen sind echte, vergleichbare Objekte. -->
    <PageSection surface="card" pad-bottom labelledby="stellen-titel">
      <div class="mb-f-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 id="stellen-titel" class="type-h2">
            Gerade ausgeschrieben
          </h2>
          <p class="mt-4 max-w-[60ch] type-lead text-muted-foreground">
            Drei von {{ jobs.length }} offenen Stellen. Jede mit Gehaltsband, Arbeitsmodell und Startdatum.
          </p>
        </div>
        <Button as-child class="h-12 px-7 text-base">
          <NuxtLink to="/jobs">
            Offene Stellen ansehen
          </NuxtLink>
        </Button>
      </div>

      <ul class="grid gap-f-8 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="job in topJobs" :key="job.id" class="md:last:col-span-2 lg:last:col-span-1">
          <JobCard :job="job" heading-level="h3" />
        </li>
      </ul>
    </PageSection>

    <!-- 10 · Ruhiger Schluss: eine Frage, eine leise zweite Aktion. -->
    <PageSection pad-bottom labelledby="schluss-titel">
      <div class="flex flex-col items-start gap-5">
        <h2 id="schluss-titel" class="max-w-[18ch] type-h1-page">
          Nichts Passendes auf der Tafel?
        </h2>
        <p class="max-w-[56ch] type-lead text-muted-foreground">
          Schreib uns trotzdem, was du kannst und was du suchst. Lena Hoffmann aus dem Personalteam antwortet innerhalb von fünf Werktagen.
        </p>
        <Button as-child variant="outline" class="mt-2 h-12 px-7 text-base">
          <a href="mailto:jobs@example.com?subject=Initiativbewerbung">Initiativ bewerben</a>
        </Button>
      </div>
    </PageSection>
  </main>
</template>

<style scoped>
/*
  Linienverlauf: mobil eine senkrechte Linie links, ab lg eine waagerechte Linie oben.
  Die Halte sind Kreise wie auf einem Netzplan, der Endhalt ist gefüllt. Die Linie fährt in Signalrot (Grafik, >= 3.6:1).
*/
.line-map {
  position: relative;
}
.line-map::before {
  content: '';
  position: absolute;
  background: var(--signal);
  left: calc(0.78125rem - var(--line-weight-strong) / 2); /* Mitte des Halts (25 px) minus halbe Linie */
  top: 0.5rem;
  bottom: 0.5rem;
  width: var(--line-weight-strong);
}
.line-dot {
  position: absolute;
  left: 0;
  top: 0.125rem;
  width: 1.5625rem;
  height: 1.5625rem;
  border-radius: var(--style-radius-dot);
  border: var(--line-weight-strong) solid var(--signal);
  background: var(--background);
}
.line-dot-end {
  background: var(--signal);
  box-shadow: inset 0 0 0 4px var(--background);
}
@media (min-width: 64rem) {
  .line-map::before {
    left: 0.5rem;
    right: 0.5rem;
    top: calc(0.78125rem - var(--line-weight-strong) / 2);
    bottom: auto;
    width: auto;
    height: var(--line-weight-strong);
  }
  .line-dot {
    top: 0;
  }
}
</style>
