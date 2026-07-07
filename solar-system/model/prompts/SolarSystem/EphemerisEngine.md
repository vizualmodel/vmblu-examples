# EphemerisEngine

## Node

Computes planet and moon positions from ephemerides using Kepler-based calculations.

## Pins

### sim.tick

Receives simulation ticks used to update local state.

### solar.command

Receives solar-system related commands such as scaling, labels, or scene options.

### orb.body-poses

Emits calculated orbital poses for planets and moons.

### orb.body-catalog

Emits metadata describing the supported celestial bodies.
