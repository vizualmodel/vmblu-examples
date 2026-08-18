import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "_site");
if (path.dirname(target) !== root || path.basename(target) !== "_site") {
  throw new Error(`Refusing to replace unexpected staging directory: ${target}`);
}

const manifest = JSON.parse(await readFile(path.join(root, "gallery-manifest.json"), "utf8"));
const demos = manifest.examples.filter((example) => example.demo);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const example of demos) {
  const source = path.resolve(root, example.demo.source);
  const destination = path.resolve(target, example.demo.path);
  if (!destination.startsWith(`${target}${path.sep}`)) {
    throw new Error(`Demo path escapes the staging directory: ${example.demo.path}`);
  }

  await mkdir(destination, { recursive: true });
  await cp(path.join(source, "website-index.html"), path.join(destination, "index.html"));
  await cp(path.join(source, "solar-system.app-bundle.js"), path.join(destination, "solar-system.app-bundle.js"));
  await cp(path.join(source, "assets"), path.join(destination, "assets"), { recursive: true });
}

const links = demos
  .map((example) => `<li><a href="./${example.demo.path}">${example.title}</a></li>`)
  .join("\n");
const index = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>vmblu examples</title></head>
<body><main><h1>vmblu runnable examples</h1><ul>${links}</ul><p><a href="https://vmblu.dev/gallery/intro">About the gallery</a></p></main></body>
</html>\n`;
await writeFile(path.join(target, "index.html"), index, "utf8");
await writeFile(path.join(target, ".nojekyll"), "", "utf8");

console.log(`Staged ${demos.length} runnable demo(s) in ${target}.`);
