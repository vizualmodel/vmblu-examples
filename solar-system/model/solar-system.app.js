// ------------------------------------------------------------------
// Model: Root
// Path: /examples/solar-system/model/solar-system.app.js
// Creation date 5/29/2026, 4:28:16 PM
// ------------------------------------------------------------------

// import the runtime code
import {Runtime} from "@vizualmodel/vmblu-runtime/rt-browser-agent"


//Imports
import { createSimulationClock } from '../nodes/simulation-clock.js'
import { createCommandRouter } from '../nodes/command-router.js'
import { createScreenLayout } from '../nodes/rendering/screen-layout.js'
import { createRenderer } from '../nodes/rendering/renderer.js'
import { createAnimator } from '../nodes/rendering/animator.js'
import { createCameraManager } from '../nodes/rendering/camera-manager.js'
import { createEphemerisEngine } from '../nodes/solar-system/ephemeris-engine.js'
import { createBodyVisuals } from '../nodes/solar-system/body-visuals.js'
import { createCelestialSphere } from '../nodes/solar-system/celestial-sphere.js'
import { createDistanceChart } from '../nodes/charts/distance-chart.js'
import { createIconMenu } from '../nodes/user-interface/icon-menu.js'

// Runtime sidecars
import capabilities from './solar-system.cap.json' with { type: 'json' }
import agent from './solar-system.agent.json' with { type: 'json' }

//The runtime nodes
const nodeList = [
	//_____________________________________________SIMULATIONCLOCK
	{
	name: "SimulationClock", 
	uid: "DFDp", 
	factory: createSimulationClock,
	inputs: [
		"-> clock.configure",
		"-> clock.control"
		],
	outputs: [
		"clock.state -> sim.state @ IconMenu (gpxA)",
		`clock.tick -> [ 
			"anim.tick @ Animator (syEu)",
			"sim.tick @ EphemerisEngine (ulsH)",
			"chart.tick @ DistanceChart (gLhC)" ]`
		],
	sx:	{
		    "tickMs": 50,
		    "timeScale": 36000,
		    "startIsoUtc": "",
		    "stopIsoUtc": ""
		}
	},
	//_______________________________________________COMMANDROUTER
	{
	name: "CommandRouter", 
	uid: "ANao", 
	factory: createCommandRouter,
	inputs: [
		"-> ui.command"
		],
	outputs: [
		"ui.panel -> ui.panel @ IconMenu (gpxA)",
		"render.view -> layout.command @ ScreenLayout (ytSD)",
		"render.camera -> camera.command @ CameraManager (krbo)",
		"chart.command -> chart.command @ DistanceChart (gLhC)",
		`solar.command -> [ 
			"solar.command @ EphemerisEngine (ulsH)",
			"scene.command @ BodyVisuals (qomM)",
			"sky.command @ CelestialSphere (cFIi)" ]`,
		"clock.config -> clock.configure @ SimulationClock (DFDp)",
		"clock.control -> clock.control @ SimulationClock (DFDp)"
		]
	},
	//________________________________________________SCREENLAYOUT
	{
	name: "ScreenLayout", 
	uid: "ytSD", 
	factory: createScreenLayout,
	inputs: [
		"-> layout.command",
		"-> layout.chart-overlay"
		],
	outputs: [
		`layout.state -> [ 
			"camera.layout @ CameraManager (krbo)",
			"render.layout @ Renderer (SzFU)" ]`
		],
	sx:	{
		    "ambientIntensity": 7,
		    "sunIntensity": 1000,
		    "showEcliptic": true,
		    "showAxes": false
		}
	},
	//____________________________________________________RENDERER
	{
	name: "Renderer", 
	uid: "SzFU", 
	factory: createRenderer,
	inputs: [
		"-> render.scene-patches",
		"-> render.layout",
		"-> render.camera"
		],
	outputs: []
	},
	//____________________________________________________ANIMATOR
	{
	name: "Animator", 
	uid: "syEu", 
	factory: createAnimator,
	inputs: [
		"-> anim.tick",
		"-> anim.registry",
		"-> anim.body-poses"
		],
	outputs: [
		"anim.scene-patches -> render.scene-patches @ Renderer (SzFU)"
		]
	},
	//_______________________________________________CAMERAMANAGER
	{
	name: "CameraManager", 
	uid: "krbo", 
	factory: createCameraManager,
	inputs: [
		"-> camera.command",
		"-> camera.body-poses",
		"-> camera.layout"
		],
	outputs: [
		"ol/ -> ()",
		`camera.active -> [ 
			"camera.state @ IconMenu (gpxA)",
			"scene.camera @ BodyVisuals (qomM)",
			"sky.camera @ CelestialSphere (cFIi)",
			"render.camera @ Renderer (SzFU)" ]`,
		"camera.event -> ()"
		],
	sx:	{
		    "sunRadiusMultiplier": 10,
		    "planetRadiusMultiplier": 200,
		    "activeCameraId": "earth-camera",
		    "defaultCameraState": {
		        "positionAu": {
		            "x": 1,
		            "y": 0,
		            "z": 0.2
		        },
		        "targetAu": {
		            "x": 0,
		            "y": 0,
		            "z": 0
		        }
		    },
		    "startupCameras": [
		        {
		            "cameraId": "earth-camera",
		            "label": "Earth Camera",
		            "mode": "body-follow",
		            "followBodyId": "earth",
		            "targetBodyId": "earth",
		            "dx": 0.03,
		            "dy": 0,
		            "dz": 0.01
		        },
		        {
		            "cameraId": "jupiter-camera",
		            "label": "Jupiter Camera",
		            "mode": "body-follow",
		            "followBodyId": "jupiter",
		            "targetBodyId": "jupiter",
		            "dx": 0.45,
		            "dy": 0,
		            "dz": 0.08
		        }
		    ]
		}
	},
	//_____________________________________________EPHEMERISENGINE
	{
	name: "EphemerisEngine", 
	uid: "ulsH", 
	factory: createEphemerisEngine,
	inputs: [
		"-> sim.tick",
		"-> solar.command"
		],
	outputs: [
		`orb.body-poses -> [ 
			"scene.body-poses @ BodyVisuals (qomM)",
			"anim.body-poses @ Animator (syEu)",
			"camera.body-poses @ CameraManager (krbo)" ]`,
		"orb.body-catalog -> ()"
		]
	},
	//_________________________________________________BODYVISUALS
	{
	name: "BodyVisuals", 
	uid: "qomM", 
	factory: createBodyVisuals,
	inputs: [
		"-> scene.body-poses",
		"-> scene.command",
		"-> scene.camera"
		],
	outputs: [
		"scene.updates -> render.scene-patches @ Renderer (SzFU)",
		"scene.animatables -> anim.registry @ Animator (syEu)"
		],
	sx:	{
		    "visualScale": 1500,
		    "labelsVisible": true,
		    "sunRadiusMultiplier": 5,
		    "planetRadiusMultiplier": 200,
		    "moonOrbitRadiusMultiplier": 20
		}
	},
	//_____________________________________________CELESTIALSPHERE
	{
	name: "CelestialSphere", 
	uid: "cFIi", 
	factory: createCelestialSphere,
	inputs: [
		"-> sky.command",
		"-> sky.camera"
		],
	outputs: [
		"sky.scene-updates -> render.scene-patches @ Renderer (SzFU)"
		],
	sx:	{
		    "radius": 2500,
		    "starMapFile": "starmap_2020_8k.jpg",
		    "constellationFile": "constellations.png",
		    "showStars": true,
		    "showConstellations": false
		}
	},
	//_______________________________________________DISTANCECHART
	{
	name: "DistanceChart", 
	uid: "gLhC", 
	factory: createDistanceChart,
	inputs: [
		"-> chart.command",
		"-> chart.body-poses",
		"-> chart.tick"
		],
	outputs: [
		"chart.overlay -> layout.chart-overlay @ ScreenLayout (ytSD)"
		],
	sx:	{
		    "width": 420
		}
	},
	//____________________________________________________ICONMENU
	{
	name: "IconMenu", 
	uid: "gpxA", 
	factory: createIconMenu,
	inputs: [
		"-> ui.panel",
		"-> camera.state",
		"-> sim.state"
		],
	outputs: [
		"ui.command -> ui.command @ CommandRouter (ANao)"
		],
	sx:	{
		    "baseAmbientIntensity": 7,
		    "baseSunIntensity": 1000,
		    "ambientIntensity": 7,
		    "sunIntensity": 1000,
		    "simSecondsPerSec": 86400,
		    "sunRadiusMultiplier": 10,
		    "planetRadiusMultiplier": 200,
		    "moonOrbitRadiusMultiplier": 20,
		    "showEcliptic": false,
		    "showAxes": false,
		    "showStars": true,
		    "showConstellations": false
		}
	},
]

// Runtime options
const runtimeOptions = {
    capabilities,
    agent
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
