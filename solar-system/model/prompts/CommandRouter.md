# CommandRouter

## Node

Normalizes UI commands and routes them to the correct subsystem nodes.

## Pins

### ui.command

Receives a normalized command from UI nodes for routing.

### ui.panel

Emits a command that changes UI panel visibility or state.

### render.view

Emits renderer or layout commands to the rendering group.

### render.camera

Emits camera placement or movement commands to the rendering group.

### chart.command

Emits a chart request to the charts subsystem.

### solar.command

Emits solar-system related commands to the solar system group.

### clock.config

Emits a clock configuration message derived from a routed command.

### clock.control

Emits messages on clock.control for CommandRouter.
