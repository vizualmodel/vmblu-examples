import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

// Validate every gallery example's system/active.sys.blu document.
// The validator uses the sysblu schema shipped with vmblu CLI 1.12.1.
// It also checks node and endpoint uniqueness and connection references.
// Local model, protocol, source, build, and documentation targets must exist.
// References may not escape the vmblu-tutorials repository.
// Every model listed in the gallery manifest must appear in its active system.
// All discovered problems are collected and reported in a single run.

const schemaVersion = "1.12.1";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(path.join(root, "gallery-manifest.json"), "utf8"));
const schema = JSON.parse(
  await readFile(
    path.join(root, "node_modules", "@vizualmodel", "vmblu-cli", "context", schemaVersion, "sys.schema.json"),
    "utf8",
  ),
);
const validate = new Ajv2020({ strict: false, validateFormats: false }).compile(schema);
const errors = [];

function isExternal(target) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(target) && !/^[A-Za-z]:[\\/]/.test(target);
}

async function validateTarget(systemPath, target, owner) {
  if (isExternal(target)) return;
  const resolved = path.resolve(path.dirname(systemPath), target);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    errors.push(`${owner}: target escapes the repository: ${target}`);
    return;
  }
  try {
    await access(resolved);
  } catch {
    errors.push(`${owner}: missing target ${target}`);
  }
}

for (const example of manifest.examples ?? []) {
  const systemPath = path.join(root, example.id, "system", "active.sys.blu");
  let system;
  try {
    system = JSON.parse(await readFile(systemPath, "utf8"));
  } catch (error) {
    errors.push(`${example.id}: missing or invalid system/active.sys.blu: ${error.message}`);
    continue;
  }

  if (!validate(system)) {
    errors.push(`${example.id}: ${validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ")}`);
    continue;
  }

  const nodes = new Map();
  for (const node of system.nodes) {
    if (nodes.has(node.id)) errors.push(`${example.id}: duplicate system node ${node.id}`);
    const endpoints = new Set();
    for (const endpoint of node.endpoints ?? []) {
      if (endpoints.has(endpoint.id)) errors.push(`${example.id}: duplicate endpoint ${endpoint.id} on ${node.id}`);
      endpoints.add(endpoint.id);
      if (endpoint.protocol) await validateTarget(systemPath, endpoint.protocol, `${example.id}/${node.id}/${endpoint.id}`);
    }
    nodes.set(node.id, endpoints);
    for (const reference of node.references ?? []) {
      await validateTarget(systemPath, reference.target, `${example.id}/${node.id}`);
    }
  }

  for (const connection of system.connections) {
    for (const side of ["from", "to"]) {
      const endpoint = connection[side];
      if (!nodes.has(endpoint.node)) {
        errors.push(`${example.id}: connection ${connection.id} has unknown ${side} node ${endpoint.node}`);
      } else if (endpoint.endpoint && !nodes.get(endpoint.node).has(endpoint.endpoint)) {
        errors.push(`${example.id}: connection ${connection.id} has unknown ${side} endpoint ${endpoint.endpoint}`);
      }
    }
    for (const reference of connection.references ?? []) {
      await validateTarget(systemPath, reference.target, `${example.id}/${connection.id}`);
    }
  }

  for (const reference of system.references ?? []) {
    await validateTarget(systemPath, reference.target, example.id);
  }

  const modelTargets = new Set(
    system.nodes.flatMap((node) =>
      (node.references ?? [])
        .filter((reference) => reference.kind === "model" && !isExternal(reference.target))
        .map((reference) => path.resolve(path.dirname(systemPath), reference.target)),
    ),
  );
  for (const model of example.models ?? []) {
    const entrypoint = path.resolve(root, model.entrypoint);
    if (!modelTargets.has(entrypoint)) {
      errors.push(`${example.id}: active system does not reference gallery model ${model.entrypoint}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${manifest.examples.length} active system documents against schema ${schemaVersion}.`);
}
