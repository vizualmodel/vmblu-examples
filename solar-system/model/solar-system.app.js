// ------------------------------------------------------------------
// Model: Root
// Path: /c:/dev/vmblu/examples/solar-system/model/solar-system.app.js
// Creation date 5/20/2026, 9:07:41 AM
// ------------------------------------------------------------------

// import the runtime code
import * as VMBLU from "@vizualmodel/vmblu-runtime/rt-agent"


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

// Agent runtime sidecars
import capabilities from './solar-system.cap.json' with { type: 'json' }
import agent from './solar-system.agent.json' with { type: 'json' }

//The runtime nodes
const nodeList = [
	//_____________________________________________SIMULATIONCLOCK
	{
	name: "SimulationClock", 
	uid: "sEgH", 
	factory: createSimulationClock,
	inputs: [
		"-> clock.configure",
		"-> clock.control"
		],
	outputs: [
		"clock.state -> sim.state @ IconMenu (NosG)",
		`clock.tick -> [ 
			"anim.tick @ Animator (hgwg)",
			"sim.tick @ EphemerisEngine (mQaB)",
			"chart.tick @ DistanceChart (bgot)" ]`
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
	uid: "KDsE", 
	factory: createCommandRouter,
	inputs: [
		"-> ui.command"
		],
	outputs: [
		"ui.panel -> ui.panel @ IconMenu (NosG)",
		"render.view -> layout.command @ ScreenLayout (Euwi)",
		"render.camera -> camera.command @ CameraManager (kHcw)",
		"chart.command -> chart.command @ DistanceChart (bgot)",
		`solar.command -> [ 
			"solar.command @ EphemerisEngine (mQaB)",
			"scene.command @ BodyVisuals (Tram)",
			"sky.command @ CelestialSphere (vquK)" ]`,
		"clock.config -> clock.configure @ SimulationClock (sEgH)",
		"clock.control -> clock.control @ SimulationClock (sEgH)"
		]
	},
	//________________________________________________SCREENLAYOUT
	{
	name: "ScreenLayout", 
	uid: "Euwi", 
	factory: createScreenLayout,
	inputs: [
		"-> layout.command",
		"-> layout.chart-overlay"
		],
	outputs: [
		`layout.state -> [ 
			"camera.layout @ CameraManager (kHcw)",
			"render.layout @ Renderer (CBOc)" ]`
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
	uid: "CBOc", 
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
	uid: "hgwg", 
	factory: createAnimator,
	inputs: [
		"-> anim.tick",
		"-> anim.registry",
		"-> anim.body-poses"
		],
	outputs: [
		"anim.scene-patches -> render.scene-patches @ Renderer (CBOc)"
		]
	},
	//_______________________________________________CAMERAMANAGER
	{
	name: "CameraManager", 
	uid: "kHcw", 
	factory: createCameraManager,
	inputs: [
		"-> camera.command",
		"-> camera.body-poses",
		"-> camera.layout"
		],
	outputs: [
		"ol/ -> ()",
		`camera.active -> [ 
			"camera.state @ IconMenu (NosG)",
			"scene.camera @ BodyVisuals (Tram)",
			"sky.camera @ CelestialSphere (vquK)",
			"render.camera @ Renderer (CBOc)" ]`,
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
	uid: "mQaB", 
	factory: createEphemerisEngine,
	inputs: [
		"-> sim.tick",
		"-> solar.command"
		],
	outputs: [
		`orb.body-poses -> [ 
			"scene.body-poses @ BodyVisuals (Tram)",
			"anim.body-poses @ Animator (hgwg)",
			"camera.body-poses @ CameraManager (kHcw)" ]`,
		"orb.body-catalog -> ()"
		]
	},
	//_________________________________________________BODYVISUALS
	{
	name: "BodyVisuals", 
	uid: "Tram", 
	factory: createBodyVisuals,
	inputs: [
		"-> scene.body-poses",
		"-> scene.command",
		"-> scene.camera"
		],
	outputs: [
		"scene.updates -> render.scene-patches @ Renderer (CBOc)",
		"scene.animatables -> anim.registry @ Animator (hgwg)"
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
	uid: "vquK", 
	factory: createCelestialSphere,
	inputs: [
		"-> sky.command",
		"-> sky.camera"
		],
	outputs: [
		"sky.scene-updates -> render.scene-patches @ Renderer (CBOc)"
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
	uid: "bgot", 
	factory: createDistanceChart,
	inputs: [
		"-> chart.command",
		"-> chart.body-poses",
		"-> chart.tick"
		],
	outputs: [
		"chart.overlay -> layout.chart-overlay @ ScreenLayout (Euwi)"
		],
	sx:	{
		    "width": 420
		}
	},
	//____________________________________________________ICONMENU
	{
	name: "IconMenu", 
	uid: "NosG", 
	factory: createIconMenu,
	inputs: [
		"-> ui.panel",
		"-> camera.state",
		"-> sim.state"
		],
	outputs: [
		"ui.command -> ui.command @ CommandRouter (KDsE)"
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

// Agent runtime options
const agentRuntimeOptions = {
    capabilities,
    agent
}

// prepare the runtime
const runtime = VMBLU.scaffold(nodeList, [], agentRuntimeOptions)

// and start the app
runtime.start()
