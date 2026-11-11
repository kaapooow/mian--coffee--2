# MIAN Coffee, visuell stil

Retningslinjer for utseende og oppførsel på nettsiden. Verdiene her er hentet fra koden: `assets/site.css` (felles tokens og grid), `assets/site.js` (grid og tittelanimasjon), `assets/om-mian.css` og `assets/om-mian-data.js` (historiesiden). Er det uenighet mellom denne filen og koden, er det koden som gjelder, og denne filen skal oppdateres.

## Grunnregler

1. **Responsivt først.** Alt bygges for mobil, nettbrett og desktop samtidig.
2. **Gridet er i alle seksjoner.** Det ligger bak alt innhold, men aldri bak titler, leads og knapper.
3. **Én urørt kolonne på hver side.** Innhold starter i kolonne 2 og stopper før siste kolonne.
4. **Ingen halve kolonner.** Alle komponenter måles i hele kolonner og rader.
5. **Titler og leads har alltid en boks bak seg**, i samme farge som bakgrunnen, slik at gridet er klippet bort bak teksten.
6. **Ingenting nytt uten grunn.** Bruk tokens, typografi og komponenter som finnes før noe nytt lages.
7. **Bare `transform` og `opacity` animeres** i scroll. Alt skal være lesbart uten bevegelse.

## Språk og tekst

- Norsk, med komma i stedet for tankestrek.
- «hen» om personer generelt.
- Engelske CSS-ord står i kodeformat i all dokumentasjon: `border-radius`, `font-weight`, `font-size`, `line-height`.
- Gridet omtales som «kolonner» og «rader».

## Farger

To lag i `assets/site.css`. Komponenter bruker bare de semantiske tokens, aldri paletten direkte.

### Palett

| Token | Verdi | Brukes til |
| --- | --- | --- |
| `--green-900` | `#2A4B2F` | hero |
| `--green-800` | `#315737` | gridlinjer på grønt |
| `--green-700` | `#2F6B2A` | suksessknapp |
| `--green-300` | `#81E390` | tekst og logo på grønt |
| `--brown-950` | `#1A0904` | marquee bakerst |
| `--brown-900` | `#230C06` | marquee fremst |
| `--brown-800` | `#2C0F07` | brun flate, tekst på lyst |
| `--brown-700` | `#31160F` | gridlinjer på brunt |
| `--olive-950` | `#231906` | mørk knapp |
| `--pink-500` | `#F67DFF` | aksent, fokus, aktiv prikk |
| `--pink-200` | `#FCCDFF` | tekst på brunt |
| `--yellow-400` | `#FFD433` | abonnement |
| `--yellow-500` | `#F2C930` | gridlinjer på gult |
| `--stone-300` | `#DBD6D5` | tagger |
| `--box-white` | `#FCFCFC` | lyse bokser på kort |
| `--white`, `--black` | `#FFFFFF`, `#000000` | kort, hero-knapp |
| `--night-950` | `#0D0810` | Om MIAN: natt |
| `--plum-700` | `#6B2F5B` | Om MIAN: første lys |
| `--cream-100` | `#FFF6DE` | Om MIAN: dagslys |

### Semantiske tokens

- Flater: `--surface-green`, `--surface-brown`, `--surface-yellow`, `--surface-card`.
- Gridlinjer: `--line-green`, `--line-brown`, `--line-yellow`.
- Marquee: `--marquee-front`, `--marquee-back`. Begge er 100 % dekkende, ingen gjennomsiktighet.
- Tekst etter underlag: `--fg-on-green`, `--fg-on-brown`, `--fg-on-light`, `--fg-inverse`.
- Kontroller: `--accent`, `--btn-dark`, `--btn-light`, `--btn-success`, `--btn-hero`, `--card-box`, `--pill-on-yellow`, `--tag-bg`, `--shadow`.
- Levende kontekst, satt av JS mens man scroller: `--bg`, `--grid`, `--hdr`, `--hdr-bg`.

### Fargeoverganger

Bakgrunnen skifter på scroll: grønn til brun i heroen, brun til gul før abonnement. JS leser tokens og blander dem med `mix`. Gridlinjene og menyen følger med.

### Morgentokens (Om MIAN)

Historiesiden går fra natt til dagslys. `om-mian.js` interpolerer himmelfargene som er satt per kapittel i `om-mian-data.js` (`himmel`) og setter:

`--morning-bg`, `--morning-fg`, `--morning-line`, `--morning-accent`, `--morning-on-accent`, `--morning-mark`, `--morning-on-mark`

Når himmelen er lys nok, får `body` klassen `er-dag`, og teksten bytter til mørk. Komponenter på denne siden bruker bare `--morning-*`.

| Kapittel | Himmel |
| --- | --- |
| 00 Åpning | natt |
| 01 45 dager | natt til brun |
| 02 Morgentimene | brun, plomme, rosa |
| 03 Navnet | rosa til gul |
| 04 Samtalen | gul til krem |
| 05 Ambisjonen | krem til hvit |

Samtalekapittelet (04) skal føles tregt og stille.

## Typografi

- **Display:** `Clash Display` (400, 500, 700), fallback `Arial Black`. Titler, tall og klokke. Lastes fra Fontshare, så den vises bare på localhost og Netlify, ikke i artifact-forhåndsvisning.
- **Brødtekst:** `IBM Plex Sans` (500, 600), fallback `system-ui`.
- Størrelser og `line-height` hentes fra koden, ikke fra Figma.
- Titler på Om MIAN: `font-size: clamp(36px, min(7vw, 8.5vh), 80px)`, `font-weight: 700`, `line-height: 1`, `text-wrap: balance`.
- Leads: `font-weight: 500`, `font-size: clamp(15px, 1.2vw + 7.5px, 18px)`, `line-height: 1.5`, `text-wrap: pretty`.
- Kapittelnummer: `font-size: 14px`, `letter-spacing: .08em`.
- Titler flyr inn bokstav for bokstav (`.tw` og `.ch`, `splitTitle` og `revealTitle` i `site.js`). Ved redusert bevegelse vises de ferdige.

## Grid

JS regner ut gridet fra viewporten (`gridCells()` i `site.js`) og setter `--gx`, `--gy`, `--c0`, `--cw`.

- Rutestørrelse er omtrent bredde / 16, begrenset til 48–88 px. Mindre ruter på mobil.
- `m` = antall tomme kolonner på hver side: `max(1, ceil((kolonner − floor(1280 / gx)) / 2))`. Innholdet er maks 1280 px bredt og sentrert.
- Innholdet ligger i `.container` (`width: var(--cw)`, `margin-left: var(--c0)`).
- Menyen følger gridet. Header-høyden er én rad (`--header-h` = `--gy`).
- Boksen bak en tittel er hele rader høy (`headBox()`). Teksten står `--pad` (24 px) inn fra kanten og er sentrert i høyden. Rutene bak teksten ryddes med `.hole`.
- Kort har et indre grid av halve sidekolonner (`--sx`, `--sy`). Kort og kaffeposer kan stikke ut av rammen.
- Hvert kapittel på Om MIAN er et helt antall rader høyt, slik at linjene løper uavbrutt. Pinnede scener gjentar gridet på seg selv, så det ikke scroller forbi.

## Komponenter

- **Meny:** piller med hover- og selected-tilstand (`.nav-pill` glir under valgt lenke, `aria-current` settes etter sti). Menyen leder til undersider, aldri til seksjoner på samme side. Ingen bakgrunn bak menyen, innhold kan gå bak. Valgt tekst bruker flatefargen.
- **Knapper:** `.btn`, med `.btn--morgen` på Om MIAN (tekstfarge som fyll, himmelfarge som tekst).
- **Tagger:** `--tag-bg`, samme overalt.
- **Marquee:** to bånd, det fremste med 5° og det bakerste med −5° helning. De går hver sin vei, bytter retning ved scroll opp og ned, og går kontinuerlig uten å tilbakestilles. Høyde i `px`/`rem`-systemet, ikke fritt valgt. Teksten bakerst har lavere kontrast.
- **Abonnement:** gult kort uten ramme. Kaffeposene stikker ut over kortet.
- **Klokke (Om MIAN):** fast i hjørnet, 2 kolonner × 1 rad, starter på `05:12`.
- **Kalender (kapittel 01):** 45 celler i gridet som fylles én og én. Milepæler er gule lapper.
- **Filmvindu:** `<dialog class="film">`, `border-radius: 12px`.

## Bevegelse

- Én scroll-løkke per side. Verdier skrives til CSS-variabler, klasser og tekst, og bare når de endres.
- Ingen animasjonsbibliotek: CSS-overganger og Web Animations API.
- Easing: `cubic-bezier(.22, 1, .36, 1)` for glidende elementer (menypille), `cubic-bezier(.3, 1.28, .55, 1)` for litt sprettende landing (kalenderdager, lapper, poser).
- Sidelast: gridet tegnes ovenfra og ned mens menyen glir ned, deretter bygges resten opp. Alt tar høyst 3 sekunder.
- Kaffeposene kommer ovenfra og ned, med forsinkelse fra venstre mot høyre, mykt og litt sprettende.
- Lys skal være myke gradienter (`radial-gradient`), aldri harde kanter.
- **Redusert bevegelse** (`prefers-reduced-motion`): alt vises statisk og lesbart, pinnede scener blir vanlige (`position: relative`), ingen horisontal overflow.
- **Mobil:** lettere versjon, stillbilder i stedet for bildesekvenser.

## Bilder og 3D

- Posen og bønnen er rendret i Blender (Cycles). Filer og skript ligger i `blender/`.
- Bildesekvenser ligger i `frames/` (`bonne-800`, `pose2`). De lastes bakfra og i ledig tid, og tegnes på `canvas`.
- Åpningen av Om MIAN bruker en bønne, ikke en pose. Den starter forfra, vender seg og lander forfra på dag 1.
- Små bønner danner dybdelag rundt den store, og beveger seg i ulik hastighet.
- Mørke bilder: `bonne-natt.webp` er foreløpig en mørklagt kopi, ikke en egen render.

## Tilgjengelighet

- Semantiske `<section>` med overskrifter. Animasjoner skjuler ikke innhold for skjermleser.
- Fokusring: `--accent` (`--morning-accent` på Om MIAN), 3 px, med avstand.
- Berøringsflater minst 44 px.
- Tekstfarge velges etter kontrast mot himmelen.

## Responsive brekkpunkter

640 px (nettbrett), 1024 px (desktop), 1440 px (bred). Sjekkes fra 360 × 640 til 1920 × 1080, også liggende mobil.

## Plassholdere som må byttes

Se `assets/om-mian-data.js` (felt merket PLASSHOLDER): milepælene i kapittel 01, lead-tekstene, sluttid på klokken, filmen bak «Se filmen», logo og navn for Tør å si det, bilde av Mikal, signatur, Samtalestart-produktet og lydfiler.
