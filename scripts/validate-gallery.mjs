import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Validate the examples declared in gallery-manifest.json.
// Every example must have an identifier and at least one model entrypoint.
// Entrypoints must stay inside the repository and contain valid vmblu metadata.
// Referenced model and optional visualization files must exist.
// Runnable demos must also provide their HTML, bundle, and asset directory.
// All discovered problems are collected and reported in a single run.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "gallery-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = [];

if (manifest.version !== 1 || !Array.isArray(manifest.examples)) {
  errors.push("gallery-manifest.json must contain version 1 and an examples array");
}

for (const example of manifest.examples ?? []) {
  if (!example.id || !Array.isArray(example.models) || example.models.length === 0) {
    errors.push(`Example ${example.id ?? "<unknown>"} has no models`);
    continue;
  }

  for (const model of example.models) {
    const entrypointPath = path.resolve(root, model.entrypoint ?? "");
    if (!entrypointPath.startsWith(`${root}${path.sep}`)) {
      errors.push(`${example.id}: entrypoint escapes the repository`);
      continue;
    }

    try {
      const entrypoint = JSON.parse(await readFile(entrypointPath, "utf8"));
      if (entrypoint.kind !== "vmblu.entrypoint" || entrypoint.version !== 1 || !entrypoint.model) {
        errors.push(`${model.entrypoint}: invalid vmblu entrypoint`);
        continue;
      }

      await access(path.resolve(path.dirname(entrypointPath), entrypoint.model));
      if (entrypoint.visual) {
        await access(path.resolve(path.dirname(entrypointPath), entrypoint.visual));
      }
    } catch (error) {
      errors.push(`${model.entrypoint}: ${error.message}`);
    }
  }

  if (example.demo) {
    const demoRoot = path.resolve(root, example.demo.source);
    for (const file of ["website-index.html", "solar-system.app-bundle.js", "assets"]) {
      try {
        await access(path.join(demoRoot, file));
      } catch {
        errors.push(`${example.id}: missing demo artifact ${example.demo.source}/${file}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  const count = manifest.examples.reduce((total, example) => total + example.models.length, 0);
  console.log(`Validated ${count} gallery model entrypoints.`);
}
