# Mian Coffee 2

Landingsside for Mian Coffee med scroll-styrte 3D-sekvenser: en kaffebønne som faller ned i en pose, posen som forsegler seg selv, og produktet som presenteres til slutt. Design fra Figma-skissen «mian--coffee--web--scroll--».

## Kjør lokalt

Åpne `index.html` direkte i nettleseren, eller start en enkel server i mappen:

```
python3 -m http.server 8000
```

og gå til http://localhost:8000.

## Innhold

| Mappe | Hva |
| --- | --- |
| `index.html` | Hele siden, HTML, CSS og JavaScript i én fil |
| `assets/` | Logo og knappeikoner fra Figma |
| `frames/bonne/`, `frames/bonne-800/` | Bønnefallet, 150 WebP-bilder i 1200 px og 800 px (mobil) |
| `frames/pose/`, `frames/pose-720/` | Posen fra åpen til forseglet, 150 WebP-bilder i 1080 × 1350 og 720 × 900 (mobil) |
| `blender/` | Blender-filene og skriptene som lager posen og renderer sekvensene |

## Slik fungerer animasjonen

Bønnen og posen er rendret i Blender (Cycles) som bildesekvenser med gjennomsiktig bakgrunn. Siden tegner riktig bilde på et `canvas` ut fra hvor langt brukeren har scrollet, og flytter og skalerer elementene etter en tidslinje med sju steg, som følger de sju rammene i skissen. Bønnesekvensen spilles baklengs, så bønnen starter forfra og tumler når den faller. Når bønnene faller ned i posen, klippes de bort under posens fremkant (`clip-path`).

Tidslinjen ligger i objektet `T` i `index.html`, og målene fra renderne (hvor stor plass bønnen og posen tar i bildene, og hvor posens åpning er) ligger rett over.

## Blender

- `blender/kaffebonne_studio.blend`: bønnen med studiolys og fallanimasjonen
- `blender/mian_pose_animasjon.blend`: posen med åpen og lukket form (shape keys), lys, kamera og animasjon
- `blender/scripts/`: skriptene som bygger posen fra bunnen, setter opp scenen, animerer og konverterer til WebP. `make_front.py` lager front-trykket.
- `blender/front_print.jpg`: front-trykket på posen

Posefilen peker på front-trykket med full sti fra maskinen den ble laget på. Åpner du den et annet sted, pek bildet i materialet «Pose front» til `blender/front_print.jpg`.

## Kjent begrensning

Siden skalerer hele designet (1528 × 1016) til vinduet, så den er laget for desktop. Mobil trenger en egen layout.
