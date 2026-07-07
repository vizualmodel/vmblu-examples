# Renderer

## Node

Hosts the THREE.js scene and render loop and applies scene and camera updates.

## Pins

### render.scene-patches

Applies incoming scene patch batches to the renderer scene.

### render.layout

Receives layout state updates that affect canvas size or overlays.

### render.camera

Receives the active camera state used by the render loop.
