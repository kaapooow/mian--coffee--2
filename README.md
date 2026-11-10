# Mian Coffee

Nettsiden til Mian Coffee: en scroll-styrt hero der kaffeposen og bønnene er rendret i Blender, og en nettbutikk-karusell med produktkort. Ren HTML, CSS og JavaScript i én fil, uten byggesteg. Netlify publiserer rotmappen (se `netlify.toml`).

## Kjør lokalt

Dobbeltklikk på `start-server.command` (Mac), eller kjør i mappen:

```
python3 -m http.server 8000
```

og gå til http://localhost:8000.

## Innhold

| Mappe / fil | Hva |
| --- | --- |
| `index.html` | Hele siden: HTML, CSS og JavaScript |
| `assets/` | Logo, ikoner og bilder |
| `assets/produkter/` | Produktbildene i karusellen (frilagte WebP). Bytt et bilde ved å legge inn en ny fil med samme navn |
| `assets/flyt/` | Sjokoladebitene som regner rundt sjokoladekortene |
| `frames/pose2/`, `frames/pose2-720/` | Posen, 150 WebP-bilder for desktop og mobil |
| `frames/bonne-800/` | Bønnene, 150 WebP-bilder |
| `blender/` | Blender-filene og skriptene som lager og renderer posen og bønnen |

## Seksjonene

**Hero.** Riktig bilde fra sekvensene tegnes på `canvas` ut fra hvor langt man har scrollet. Tidslinjen styres av nøkkelpunktene i `K` i `index.html`. På brede skjermer står teksten i en venstre spalte. På smale og stående skjermer står teksten øverst, og utsnittet følger posen og bønnene.

**Nettbutikk («Finn din favoritt»).** Produktene ligger i `PRODUCTS` i `index.html` (navn, kategori, pris, mengde, tekst, bilde og om varen er utsolgt). Kortene bygges på et rutenett av kvadratiske ruter: rutestørrelsen følger kortbredden, og antall rader følger skjermhøyden, slik at seksjonen alltid passer i én skjermhøyde. Kaffebønner eller sjokoladebiter regner inn rundt kortet i midten.

## Responsivt

Breakpoints: 640 px (nettbrett), 1024 px (desktop) og 1440 px (bred skjerm). Innholdet er maks 1280 px bredt. Alt er testet fra 360 × 640 til 1920 × 1080, også mobil liggende.

## Blender

- `blender/kaffebonne_studio.blend`: bønnen med studiolys og fallanimasjonen
- `blender/mian_pose_animasjon.blend`: posen med åpen og lukket form (shape keys), lys, kamera og animasjon
- `blender/scripts/`: skriptene som bygger posen, setter opp scenen, animerer og konverterer til WebP. `make_front.py` lager front-trykket.
- `blender/front_print.jpg`: front-trykket på posen

Posefilen peker på front-trykket med full sti fra maskinen den ble laget på. Åpner du den et annet sted, pek bildet i materialet «Pose front» til `blender/front_print.jpg`.
