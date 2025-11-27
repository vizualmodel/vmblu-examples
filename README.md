![logo](vmblu-header.png)

<span style="font-size:2em; color:#0066ff;"><b>Examples of vmblu apps</b></span><br>

This repository contains **example projects** that demonstrate how to build applications with [vmblu](https://github.com/vizualmodel/vmblu).  
Each example is a self-contained project (with its own `package.json`) and can be run independently.

---
<span style="font-size:1.4em; color:#0066ff;"><b>■   Structure</b></span><br>

```
vmblu-examples/
   examples/
      solar-system-human/     # Three.js-based solar system simulation - hand-crafed architecture
      solar-system-LLM/       # Three.js-based solar system simulation - fully made by an LLM
      chat/                   # Simple chat-style app
````

<span style="font-size:1.4em; color:#0066ff;"><b>■   Getting started</b></span><br>

### 1. Clone the repo

```bash
git clone https://github.com/vizualmodel/vmblu-examples.git
cd vmblu-examples
````

### 2. Install dependencies

If you use **npm**:

```bash
npm install
```

If you use **pnpm**:

```bash
pnpm install
```

> ⚠️ All examples require the **vmblu runtime**.
> Make sure you install it:
>
> ```bash
> npm install @vizualmodel/vmblu
> ```
>
> or add it with pnpm:
>
> ```bash
> pnpm add @vizualmodel/vmblu
> ```

### 3. Run an example

```bash
# with npm
npm run dev:ss     # solar-system
npm run dev:chat   # chat
npm run dev:min    # minimal

# with pnpm
pnpm dev:ss
pnpm dev:chat
pnpm dev:min
```

Each example starts a local development server (default port: `5173`).

---
<span style="font-size:1.4em; color:#0066ff;"><b>■ Proposing a new example</b></span><br>

1. Create a new folder under `examples/`, e.g. `examples/my-demo/`.
2. Add a `package.json` with `"private": true`, a name, and scripts (`dev`, `build`, …).
3. Add `@vizualmodel/vmblu` to its dependencies:

   ```bash
   npm install @vizualmodel/vmblu
   ```

   or

   ```bash
   pnpm add @vizualmodel/vmblu
   ```
4. Run `npm install` (or `pnpm install`) at the root to link it into the workspace.
5. Add a script alias in the root `package.json` for easy dev commands.

---

<span style="font-size:1.4em; color:#0066ff;"><b>■ License</b></span><br>

The examples are licensed under the [MIT License](./LICENSE.txt).
This allows you to freely copy and adapt them into your own projects.

The main [vmblu](https://github.com/vizualmodel/vmblu) repository is licensed under **Apache 2.0**.

