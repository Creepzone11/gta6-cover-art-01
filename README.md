# Neon Coast — GTA-style Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Creepzone11/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/Creepzone11/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photos and a caption into multi-panel
poster cover art in the style of GTA 6's posters — bold condensed lettering,
a Vice City sunset or neon colour grade, white poster borders, grain and a
vignette — exported as a PNG to share. Built for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

Everything is your own: no Rockstar Games logo, artwork or font. The
lettering uses Anton and Pacifico, both under the SIL Open Font License
(files and licence texts under `app/fonts/`). The two sample photos under
`app/samples/` were made for make.fun with an image model and are free to use.

## What it does

- **5 layouts:** Four Panel (2×2 grid), Hero + Three, Full Bleed, Nine Panel
  (3×3 grid), Tilted Snapshots (rotated overlapping photos).
- **Any photo:** upload one or several photos from your machine (they never
  leave it); fill panels with one photo or several; click a panel to select
  it, then pick its photo; drag a panel to move its photo, scroll to zoom.
- **Caption:** an editable title (Anton, sunset-gradient fill, dark outline,
  halftone dots) and an optional script subtitle (Pacifico).
- **4 colour grades:** Vice City Sunset, Neon Pink / Teal, Golden Hour,
  Midnight Purple — gradient-map tints applied on the canvas.
- **Export:** PNG in 1080×1080, 1080×1350 and 1920×1080, one click.
- **Offline:** static files under `app/`, no network request, no build step.

## How to run it

```sh
node serve.ts
# open http://localhost:8080
```

Pick a layout and a grade, add photos (or use a sample), type a title,
choose an export size, and press Export PNG.

Screenshot scenes (deterministic, for the entry's screenshots):

```sh
# cover alone, 1920x1080
http://localhost:8080/?shot=cover&photo=pier&caption=Neon%20Shore&layout=tilt&grade=sunset&size=1920x1080
# editor with a photo loaded
http://localhost:8080/?shot=editor&photo=boulevard&caption=Boulevard%20Queen&layout=grid4&grade=neon
```

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json` with the vendored make.fun library
(`vendor/makefun-app.ts`, the kit's copy, unchanged).
