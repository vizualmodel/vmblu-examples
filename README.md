![vmblu](vmblu-header.png)

# vmblu tutorials

This repository contains teaching applications built with [vmblu](https://github.com/vizualmodel/vmblu). Each example owns its model, source code, assets, and—where applicable—its runnable build.

## Tutorials and transitional projects

- **Chat application** — separate browser client and Node.js server models.
- **Solar System** — an interactive Three.js simulation with a browser demo.
- **CrisisGrid** — a command-centre web application and operational core service.

The canonical model inventory is [gallery-manifest.json](./gallery-manifest.json). The vmblu Playground opens tutorial files directly from this repository; model copies are not maintained in the website repository.

Solar System and CrisisGrid remain here temporarily. They will be reorganized into individual official Blueprint repositories in a later session; they are not catalogue entries yet. New tutorials should have their own directory, README, and package scripts, with workspace registration where needed.

## Work locally

```bash
git clone https://github.com/vizualmodel/vmblu-tutorials.git
cd vmblu-tutorials
npm install
npm run build
```

Individual examples also contain their own README and package scripts.

## Gallery and runnable demos

Validate all published model entrypoints with:

```bash
npm run gallery:validate
```

The Solar System browser build is published by GitHub Actions to:

`https://vizualmodel.github.io/vmblu-tutorials/solar-system/`

`npm run pages:build` rebuilds the Solar System and stages the Pages artifact in the ignored `_site` directory. To activate deployment, configure this repository's GitHub Pages source as **GitHub Actions**.

## Adding a tutorial

Add the project to its own directory, include a vmblu entrypoint (`*.blu`), and register every gallery model in `gallery-manifest.json`. If it has a static browser demo, add a `demo` entry and teach `scripts/stage-pages.mjs` which artifacts to publish.

## License

The examples are licensed under the [MIT License](./LICENSE.txt). The vmblu repository is licensed under Apache 2.0.
