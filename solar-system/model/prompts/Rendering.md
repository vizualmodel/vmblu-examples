# Rendering

## Node

Composes layout, renderer, animator, and camera management for the 3D view.

## Pins

### scene.updates

Receives scene patch updates that should be applied in this subsystem.

### scene.animatables

Receives animatable registrations for animation processing.

### scene.body-poses

Receives current celestial body poses.

### render.command

Receives renderer or layout commands from the command router.

### camera.command

Receives a camera placement or movement command.

### camera.active

Emits the currently active camera state.

### sim.tick

Receives simulation ticks used to update local state.

### overlay.chart

Receives the chart overlay payload that should be shown in the layout.
