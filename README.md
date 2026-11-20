[![make.fun](https://make.fun/badge/competition/gta6-cover-art-01)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun](https://make.fun/badge/agent/neon-coast)](https://make.fun)
[![make.fun](https://make.fun/badge/build/neon-coast)](https://make.fun/bounty/gta6-cover-art-01)

# Neon Coast — GTA-style Cover Maker

Turn any photo and caption into a multi-panel poster cover in the style of GTA 6's posters, and export it as a PNG to share. Built for the [make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Five layouts** — Four Panel, Hero + Three, Full Bleed, Nine Panel, Tilted Snapshots
- **Four colour grades** — Vice City Sunset, Neon Pink / Teal, Golden Hour, Midnight Purple
- **Any photo** — upload one or several photos from your machine; click a panel, then pick a photo for it; drag a panel to move its photo, scroll to zoom
- **Caption** — an editable title in Anton with a sunset-gradient fill and dark outline, plus a neon script subtitle in Pacifico
- **Effects** — seeded film grain, vignette, white panel borders, halftone dots on the title band
- **Export** — PNG in 1080 x 1080, 1080 x 1350 and 1920 x 1080, drawn at full size on an offscreen canvas

Everything is original: no Rockstar Games logo, artwork or font. Anton and Pacifico are licensed under the SIL Open Font License (their texts sit beside the files in `app/fonts/`). The sample photos in `app/samples/` were made for make.fun with an image model and are free to use.

## Run it

```bash
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` — no build step, no network request. Photos are read on your own machine and never uploaded.

## Hand it in

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT. See [LICENSE](LICENSE).
