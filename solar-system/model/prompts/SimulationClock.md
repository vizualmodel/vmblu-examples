# SimulationClock

## Node

Maintains simulation time, time scale, and paused state, and emits simulation ticks.

## Pins

### clock.configure

Applies a new simulation start time and time scale configuration.

### clock.control

Handles clock actions such as pause, resume, and speed changes.

### clock.state

Emits the current simulation clock state for UI and agent context.

### clock.tick

Emits a tick whenever simulation time advances.
