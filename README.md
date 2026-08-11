# lofi haven

A cozy lofi.cafe-style ambient music player. Pick a room, press play, and drift away — animated background scenes, live YouTube playlists, and a subtle CRT overlay.

## Features

- **6 themed rooms** — Midnight Rain, Aurora Drift, Neon City, Winter Cabin, Campfire, Shoreline — each with its own animated canvas scene and curated YouTube playlist.
- **Minimal lofi.cafe-style UI** — the scene takes center stage; stations are small chips, controls live in a bottom dock.
- **Live YouTube playback** — skip, seek, and browse real track lists in the slide-out playlist panel.
- **Ambient touches** — a floating TAPECODE desk clock, warm CRT scanlines and vignette, custom cursor, and a live visualizer.
- **Keyboard shortcuts** — drive everything without touching the mouse.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / pause |
| `←` / `→` | Previous / next track |
| `↑` / `↓` | Volume up / down |
| `M` | Mute |
| `P` | Toggle playlist panel |

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- Canvas-based background effects and audio visualizer
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) for playlist playback
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # run oxlint
```

## Project structure

```
src/
  components/       UI: StationPicker, StationDock, PlaylistPanel, VhsOverlay, TapeClock, ...
  hooks/            useAudio (radio), useYouTube (playlist playback)
  rooms.ts          room/station definitions (scenes, playlists, accents)
  playerTypes.ts    shared player interface
```

## Live at

Run it yourself with `npm run dev`, or deploy the `dist/` output from `npm run build` to any static host.
