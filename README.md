# Eyob Teklu · Portfolio

A 3D, interactive portfolio built with [Astro](https://astro.build) and [Three.js](https://threejs.org).

Live at **https://eyob6117.github.io/portfolio/** once GitHub Pages is enabled.

## Features

- A noise-morphing iridescent core with orbit rings, a 9k-particle galaxy and bloom post-processing
- Skill labels that orbit the core in 3D, and a camera that drifts through the galaxy as you scroll
- A 3D phone with a wallet UI that rotates through the "Craft" section
- Glass cards with 3D tilt, magnetic buttons, a custom cursor, scroll reveals and counters
- Falls back to a static gradient without WebGL, and calms the motion for `prefers-reduced-motion`

## Editing content

All copy comes from [`src/data/resume.ts`](src/data/resume.ts). Update it and the page rebuilds.

## Development

```sh
npm install
npm run dev      # http://localhost:4321/portfolio/
npm run build    # type-checks and outputs to dist/
npm run preview
```

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.
Enable it once under **Settings → Pages → Build and deployment → Source: GitHub Actions**.
