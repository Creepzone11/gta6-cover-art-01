[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Creepzone11/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Creepzone11/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Coast — GTA-style Cover Maker

Neon Coast turns one of your photos and a caption into a multi-panel poster cover in the spirit of GTA 6's key art, then exports it as a PNG you can share. It was built for the [make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Five layouts** — Four Panel, Hero + Three, Full Bleed, Nine Panel, and Tilted Snapshots, where the photos overlap at an angle
- **Four colour grades** — Vice City Sunset, Neon Pink / Teal, Golden Hour, and Midnight Purple, each a gradient-map treatment over your photos
- **Your photos** — drop in one or several images from your own machine; pick a panel, then choose which photo fills it; drag a panel to reposition its photo and scroll to zoom it
- **Caption** — a title you can edit, set in Anton with a sunset-gradient fill, dark outline, and halftone dots, plus an optional neon script subtitle in Pacifico
- **Finishing touches** — deterministic film grain, a vignette, white borders between panels, and a scrim behind the title band
- **Export** — a PNG at full resolution in 1080 x 1080, 1080 x 1350, or 1920 x 1080, rendered on an offscreen canvas

All of the art direction is original: there is no Rockstar Games logo, artwork, character, or font anywhere in the app. Anton and Pacifico are released under the SIL Open Font License, and their license texts sit next to the font files in `app/fonts/`. The two sample photos in `app/samples/` were generated for make.fun with an image model and are free to use.

## Run it

```bash
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` — no build step and no network requests. Your photos are read locally and never leave your machine.

## Hand it in

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` using the vendored make.fun library.

## License

MIT. See [LICENSE](LICENSE).
