// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.0"},"source":{"model":"solar-system.mod.blu","hash":"fnv1a64:1472af4b35793815"}}
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
	uid: "gCkm",
	factory: createSimulationClock,
	inputs: [
		"-> clock.configure",
		"-> clock.control"
		],
	outputs: [
		"clock.state -> sim.state @ IconMenu (yvmr)",
		`clock.tick -> [ 
			"anim.tick @ Animator (Shom)",
			"sim.tick @ EphemerisEngine (OwKg)",
			"chart.tick @ DistanceChart (kbHb)" ]`
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
	uid: "acPE",
	factory: createCommandRouter,
	inputs: [
		"-> ui.command"
		],
	outputs: [
		"ui.panel -> ui.panel @ IconMenu (yvmr)",
		"render.view -> layout.command @ ScreenLayout (xiYZ)",
		"render.camera -> camera.command @ CameraManager (aEGT)",
		"chart.command -> chart.command @ DistanceChart (kbHb)",
		`solar.command -> [ 
			"solar.command @ EphemerisEngine (OwKg)",
			"scene.command @ BodyVisuals (ufZN)",
			"sky.command @ CelestialSphere (WOCG)" ]`,
		"clock.config -> clock.configure @ SimulationClock (gCkm)",
		"clock.control -> clock.control @ SimulationClock (gCkm)"
		]
	},
	//________________________________________________SCREENLAYOUT
	{
	name: "ScreenLayout",
	uid: "xiYZ",
	factory: createScreenLayout,
	inputs: [
		"-> layout.command",
		"-> layout.chart-overlay"
		],
	outputs: [
		`layout.state -> [ 
			"camera.layout @ CameraManager (aEGT)",
			"render.layout @ Renderer (cLtB)" ]`
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
	uid: "cLtB",
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
	uid: "Shom",
	factory: createAnimator,
	inputs: [
		"-> anim.tick",
		"-> anim.registry",
		"-> anim.body-poses"
		],
	outputs: [
		"anim.scene-patches -> render.scene-patches @ Renderer (cLtB)"
		]
	},
	//_______________________________________________CAMERAMANAGER
	{
	name: "CameraManager",
	uid: "aEGT",
	factory: createCameraManager,
	inputs: [
		"-> camera.command",
		"-> camera.body-poses",
		"-> camera.layout"
		],
	outputs: [
		"ol/ -> ()",
		`camera.active -> [ 
			"camera.state @ IconMenu (yvmr)",
			"scene.camera @ BodyVisuals (ufZN)",
			"sky.camera @ CelestialSphere (WOCG)",
			"render.camera @ Renderer (cLtB)" ]`,
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
	uid: "OwKg",
	factory: createEphemerisEngine,
	inputs: [
		"-> sim.tick",
		"-> solar.command"
		],
	outputs: [
		`orb.body-poses -> [ 
			"scene.body-poses @ BodyVisuals (ufZN)",
			"anim.body-poses @ Animator (Shom)",
			"camera.body-poses @ CameraManager (aEGT)" ]`,
		"orb.body-catalog -> ()"
		]
	},
	//_________________________________________________BODYVISUALS
	{
	name: "BodyVisuals",
	uid: "ufZN",
	factory: createBodyVisuals,
	inputs: [
		"-> scene.body-poses",
		"-> scene.command",
		"-> scene.camera"
		],
	outputs: [
		"scene.updates -> render.scene-patches @ Renderer (cLtB)",
		"scene.animatables -> anim.registry @ Animator (Shom)"
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
	uid: "WOCG",
	factory: createCelestialSphere,
	inputs: [
		"-> sky.command",
		"-> sky.camera"
		],
	outputs: [
		"sky.scene-updates -> render.scene-patches @ Renderer (cLtB)"
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
	uid: "kbHb",
	factory: createDistanceChart,
	inputs: [
		"-> chart.command",
		"-> chart.body-poses",
		"-> chart.tick"
		],
	outputs: [
		"chart.overlay -> layout.chart-overlay @ ScreenLayout (xiYZ)"
		],
	sx:	{
		    "width": 420
		}
	},
	//____________________________________________________ICONMENU
	{
	name: "IconMenu",
	uid: "yvmr",
	factory: createIconMenu,
	inputs: [
		"-> ui.panel",
		"-> camera.state",
		"-> sim.state"
		],
	outputs: [
		"ui.command -> ui.command @ CommandRouter (acPE)"
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
    vmblu: {"compatibilityFamily":"1.12","generatorVersion":"1.12.0","schemaVersion":"1.12.0"},
    capabilities,
    agent
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
