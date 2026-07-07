# SolarSystem

## Node

## Description
Composes the solar system simulation nodes that compute poses and generate visuals.

## Pins

### solar.command

Receives solar-system related commands such as scaling, labels, or scene options.

### camera.state

Receives the active camera state for context or view-dependent behavior.

### scene.updates

Emits scene patch updates produced by this subsystem.

### scene.animatables

Emits animatable registrations for the animator.

### scene.body-poses

Emits current celestial body poses for other subsystems.

### scene.body-catalog

Emits metadata about available celestial bodies.

### sim.tick

Receives simulation ticks used to update local state.
