export type MountTarget = HTMLElement | string | null | undefined;

/**
 * Resolves a mount target for UI nodes. If no target is supplied a new div is appended to the document body.
 */
export function resolveMountPoint(target: MountTarget): HTMLElement {
  if (target instanceof HTMLElement) {
    return target;
  }

  if (typeof target === 'string' && target.trim().length > 0) {
    const element = document.querySelector(target.trim());
    if (element instanceof HTMLElement) {
      return element;
    }
    throw new Error(`Mount target '${target}' was not found in the document.`);
  }

  const container = document.createElement('div');
  container.className = 'vmblu-node-host';
  document.body.appendChild(container);
  return container;
}
