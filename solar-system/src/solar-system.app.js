// ------------------------------------------------------------------
// Model: 
// Path: solar-system.app.js
// Creation date 11/14/2025, 3:46:15 PM
// ------------------------------------------------------------------

// import the runtime code
import * as VMBLU from "c:/dev/vmblu/runtime"


//Imports
import { ScreenLayout,
		 HelpersSettings,
		 SolarSystemSettings,
		 SimulationSettings,
		 CamerasSettings,
		 IconMenuHorizontal,
		 LLMChatWindow } from './ui/index.js'
import { HelperTools,
		 Renderer,
		 SceneManager,
		 CameraManager,
		 SpaceCurveManager } from './3d/index.js'
import { Star,
		 Planet,
		 Saturn,
		 Moon,
		 Ephemerides,
		 PlanetRouter,
		 StarSphere,
		 SelectOnEarth } from './sky/index.js'
import { PlanetaryDistance } from './chart/index.js'
import { McpClientOpenAI } from '../../../core/ai/mcp-client-in-browser.js'
import { McpServerInBrowser } from './mcp-server.js'

//The runtime nodes
const nodeList = [
	//_______________________________________________SCREEN LAYOUT
	{
	name: "screen layout", 
	uid: "WoLD", 
	factory: ScreenLayout,
	inputs: [
		"-> menu",
		"-> timeline",
		"-> modal div",
		"-> left side chart",
		"=> left side canvas",
		"-> left side toggle",
		"-> right side toggle",
		"-> right side add div"
		],
	outputs: [
		"visible start -> update start @ renderer (FjpN)",
		"visible stop -> update stop @ renderer (FjpN)",
		"canvas -> canvas add @ camera manager (acqd)"
		]
	},
	//________________________________________________HELPER TOOLS
	{
	name: "helper tools", 
	uid: "GeBV", 
	factory: HelperTools,
	inputs: [
		"-> grid change",
		"-> axes change"
		],
	outputs: [
		"grid show -> grid set @ helper settings (IzjV)",
		"axes show -> axes set @ helper settings (IzjV)",
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)"
		],
	sx:	{
		    "grid": {
		        "x": {
		            "on": false,
		            "color": "0x773333"
		        },
		        "y": {
		            "on": false,
		            "color": "0x337733"
		        },
		        "z": {
		            "on": true,
		            "color": "0x333377"
		        },
		        "size": 50,
		        "divisions": 50
		    },
		    "axes": {
		        "on": false,
		        "size": "50"
		    }
		}
	},
	//_____________________________________________HELPER SETTINGS
	{
	name: "helper settings", 
	uid: "IzjV", 
	factory: HelpersSettings,
	inputs: [
		"-> grid set",
		"-> axes set"
		],
	outputs: [
		"div -> right side add div @ screen layout (WoLD)",
		"grid change -> grid change @ helper tools (GeBV)",
		"axes change -> axes change @ helper tools (GeBV)"
		]
	},
	//____________________________________________________RENDERER
	{
	name: "renderer", 
	uid: "FjpN", 
	factory: Renderer,
	inputs: [
		"-> camera",
		"-> canvas",
		"-> scene",
		"-> actors",
		"-> update start",
		"-> update stop",
		"-> update step"
		],
	outputs: []
	},
	//_______________________________________________SCENE MANAGER
	{
	name: "scene manager", 
	uid: "NjOF", 
	factory: SceneManager,
	inputs: [
		"-> scene add",
		"-> scene remove",
		"-> scene dispose",
		"-> actor add",
		"-> actor remove"
		],
	outputs: [
		"actors -> actors @ renderer (FjpN)",
		"scene -> scene @ renderer (FjpN)"
		]
	},
	//_________________________________________________________SUN
	{
	name: "sun", 
	uid: "RHjs", 
	factory: Star,
	inputs: [
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		"current date -> current date @ simulation settings (nWcu)"
		],
	sx:	{
		    "name": "Sun",
		    "color": "0xfffcac",
		    "light": {
		        "intensity": 25,
		        "distance": 100,
		        "color": "0xffeedd"
		    },
		    "emissive": {
		        "color": "0xffdcac",
		        "intensity": 1.5
		    },
		    "textureFile": "/assets/2k_sun.jpg"
		}
	},
	//_____________________________________________________MERCURY
	{
	name: "mercury", 
	uid: "ATaA", 
	factory: Planet,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> place local camera",
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Mercury",
		    "color": "0xB1B1B1",
		    "textureFile": null
		}
	},
	//________________________________________________________MARS
	{
	name: "mars", 
	uid: "trxc", 
	factory: Planet,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> place local camera",
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Mars",
		    "color": "0xD14A28",
		    "textureFile": "/assets/2k_mars.jpg"
		}
	},
	//______________________________________________________SATURN
	{
	name: "saturn", 
	uid: "vprC", 
	factory: Saturn,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> place local camera",
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Saturn",
		    "color": "0xF9D71C",
		    "textureFile": null,
		    "colorRing": "0xaaaaff"
		}
	},
	//______________________________________________________URANUS
	{
	name: "uranus", 
	uid: "vVuq", 
	factory: Planet,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> place local camera",
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Uranus",
		    "color": "0xA8E1E8",
		    "textureFile": null
		}
	},
	//_____________________________________________________NEPTUNE
	{
	name: "neptune", 
	uid: "AkPj", 
	factory: Planet,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> place local camera",
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Neptune",
		    "color": "0x24468E",
		    "textureFile": null
		}
	},
	//_______________________________________________________VENUS
	{
	name: "venus", 
	uid: "eUwR", 
	factory: Planet,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> place local camera",
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Venus",
		    "color": "0xEEDCAB",
		    "textureFile": null
		}
	},
	//_______________________________________________________EARTH
	{
	name: "earth", 
	uid: "SjVU", 
	factory: Planet,
	inputs: [
		"-> place local camera",
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> simulation user change",
		"-> presentation user change"
		],
	outputs: [
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`
		],
	sx:	{
		    "name": "Earth",
		    "color": "0x2E52B2",
		    "textureFile": "/assets/2k_earth_specular_map.jpg"
		}
	},
	//____________________________________________________THE MOON
	{
	name: "the moon", 
	uid: "dEyu", 
	factory: Moon,
	inputs: [
		"-> simulation user change",
		"-> presentation user change"
		],
	outputs: [
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"scene add -> moon add @ earth (SjVU)",
		"scene remove -> moon remove @ earth (SjVU)",
		"scene dispose -> moon dispose @ earth (SjVU)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`
		],
	sx:	{
		    "name": "Moon",
		    "color": "0xaaaaaa",
		    "textureFile": "/assets/2k_moon.jpg"
		}
	},
	//_____________________________________________________JUPITER
	{
	name: "jupiter", 
	uid: "BhVQ", 
	factory: Planet,
	inputs: [
		"-> moon add",
		"-> moon remove",
		"-> moon dispose",
		"-> presentation user change",
		"-> simulation user change",
		"-> place local camera"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`,
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)"
		],
	sx:	{
		    "name": "Jupiter",
		    "color": "0xD9B382",
		    "textureFile": "/assets/jupiter.webp"
		}
	},
	//__________________________________________________________IO
	{
	name: "Io", 
	uid: "lKJu", 
	factory: Moon,
	inputs: [
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"scene add -> moon add @ jupiter (BhVQ)",
		"scene remove -> moon remove @ jupiter (BhVQ)",
		"scene dispose -> moon dispose @ jupiter (BhVQ)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`
		],
	sx:	{
		    "name": "Io",
		    "color": "0xffffff",
		    "textureFile": null
		}
	},
	//______________________________________________________EUROPA
	{
	name: "Europa", 
	uid: "oqnr", 
	factory: Moon,
	inputs: [
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"scene add -> moon add @ jupiter (BhVQ)",
		"scene remove -> moon remove @ jupiter (BhVQ)",
		"scene dispose -> moon dispose @ jupiter (BhVQ)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`
		],
	sx:	{
		    "name": "Europa",
		    "color": "0xffffff",
		    "textureFile": null
		}
	},
	//____________________________________________________CALLISTO
	{
	name: "Callisto", 
	uid: "RgBI", 
	factory: Moon,
	inputs: [
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"scene add -> moon add @ jupiter (BhVQ)",
		"scene remove -> moon remove @ jupiter (BhVQ)",
		"scene dispose -> moon dispose @ jupiter (BhVQ)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`
		],
	sx:	{
		    "name": "Callisto",
		    "color": "0xffffff",
		    "textureFile": null
		}
	},
	//____________________________________________________GANYMEDE
	{
	name: "Ganymede", 
	uid: "GFSz", 
	factory: Moon,
	inputs: [
		"-> presentation user change",
		"-> simulation user change"
		],
	outputs: [
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"scene add -> moon add @ jupiter (BhVQ)",
		"scene remove -> moon remove @ jupiter (BhVQ)",
		"scene dispose -> moon dispose @ jupiter (BhVQ)",
		"presentation get user settings => presentation get @ solar system settings (elOS)",
		`presentation chart and output settings -> [ 
			"setup @ planetary distance (gWUJ)",
			"setup @ space curve manager (OWbb)" ]`,
		"simulation get user settings => simulation get @ simulation settings (nWcu)",
		"ephemeris => ephemeris @ Ephemerides(1) (JFWs)",
		`orbit position -> [ 
			"position @ planetary distance (gWUJ)",
			"position @ space curve manager (OWbb)" ]`
		],
	sx:	{
		    "name": "Ganymede",
		    "color": "0xffffff",
		    "textureFile": null
		}
	},
	//______________________________________________EPHEMERIDES(1)
	{
	name: "Ephemerides(1)", 
	uid: "JFWs", 
	factory: Ephemerides,
	inputs: [
		"=> ephemeris"
		],
	outputs: []
	},
	//______________________________________________CAMERA MANAGER
	{
	name: "camera manager", 
	uid: "acqd", 
	factory: CameraManager,
	inputs: [
		"-> canvas add",
		"=> get camera",
		"-> helpers show",
		"-> helpers hide",
		"-> camera select",
		"-> camera add",
		"-> camera delete",
		"-> camera update"
		],
	outputs: [
		"canvas set -> canvas @ renderer (FjpN)",
		"active camera -> camera @ renderer (FjpN)",
		"camera list -> list @ camera settings (lEDy)",
		"camera settings -> settings @ camera settings (lEDy)",
		"actor add -> actor add @ scene manager (NjOF)",
		"actor remove -> actor remove @ scene manager (NjOF)",
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)"
		],
	sx:	[
		    {
		        "definition": {
		            "name": "space camera",
		            "type": "perspective",
		            "near": 0.0001,
		            "far": 500,
		            "fov": 50,
		            "zoom": 1,
		            "aspect": "canvas"
		        },
		        "location": {
		            "space": true,
		            "position": {
		                "x": 0,
		                "y": -1,
		                "z": 0.5
		            },
		            "lookAt": {
		                "x": 0,
		                "y": 0,
		                "z": 0
		            }
		        },
		        "controls": "orbit"
		    },
		    {
		        "definition": {
		            "name": "spaceship camera",
		            "type": "perspective",
		            "near": 0.000001,
		            "far": 500,
		            "fov": 50,
		            "zoom": 1,
		            "aspect": "canvas"
		        },
		        "controls": "spaceship",
		        "location": {
		            "space": true,
		            "position": {
		                "x": 0,
		                "y": 2,
		                "z": 0
		            },
		            "lookAt": {
		                "x": 0,
		                "y": 0,
		                "z": 0
		            }
		        }
		    }
		]
	},
	//_______________________________________SOLAR SYSTEM SETTINGS
	{
	name: "solar system settings", 
	uid: "elOS", 
	factory: SolarSystemSettings,
	inputs: [
		"=> presentation get",
		"-> presentation override"
		],
	outputs: [
		"div -> right side add div @ screen layout (WoLD)",
		`presentation user change -> [ 
			"presentation user change @ planet router (sOSV)",
			"presentation user change @ star sphere (fHfg)" ]`
		],
	sx:	{
		    "labels": {
		        "on": true,
		        "size": {
		            "min": 1,
		            "max": 50,
		            "current": 24
		        }
		    },
		    "magnify": {
		        "sun": {
		            "on": true,
		            "size": {
		                "min": 1,
		                "max": 100,
		                "current": 10
		            }
		        },
		        "planet": {
		            "on": true,
		            "size": {
		                "min": 1,
		                "max": 1000,
		                "current": 200
		            }
		        },
		        "moon": {
		            "on": true,
		            "size": {
		                "min": 1,
		                "max": 1000,
		                "current": 500
		            },
		            "orbit": {
		                "on": true,
		                "size": {
		                    "min": 1,
		                    "max": 100,
		                    "current": 20
		                }
		            }
		        }
		    },
		    "stars": {
		        "on": true
		    },
		    "constellations": {
		        "on": false
		    }
		}
	},
	//_________________________________________SIMULATION SETTINGS
	{
	name: "simulation settings", 
	uid: "nWcu", 
	factory: SimulationSettings,
	inputs: [
		"-> current date",
		"-> simulation override",
		"=> simulation get"
		],
	outputs: [
		"div -> right side add div @ screen layout (WoLD)",
		"orbit show -> curve show @ space curve manager (OWbb)",
		"orbit hide -> curve hide @ space curve manager (OWbb)",
		"update start -> update start @ renderer (FjpN)",
		"update stop -> update stop @ renderer (FjpN)",
		"update step -> update step @ renderer (FjpN)",
		`simulation user change -> [ 
			"simulation user change @ planet router (sOSV)",
			"user change @ planetary distance (gWUJ)" ]`
		],
	sx:	{
		    "running": true,
		    "speed": {
		        "min": 0.001,
		        "max": 100,
		        "current": 1,
		        "select": {
		            "on": true,
		            "selected": "sec = day",
		            "choices": [
		                "sec = sec",
		                "sec = min",
		                "sec = hour",
		                "sec = day",
		                "sec = week",
		                "sec = month",
		                "sec = year"
		            ]
		        }
		    },
		    "start": "1/1/2024",
		    "orbit": {
		        "on": false
		    }
		}
	},
	//__________________________________________PLANETARY DISTANCE
	{
	name: "planetary distance", 
	uid: "gWUJ", 
	factory: PlanetaryDistance,
	inputs: [
		"-> setup",
		"-> position",
		"-> user change"
		],
	outputs: [
		"div -> left side chart @ screen layout (WoLD)"
		],
	sx:	{
		    "planets": [
		        "Mercury",
		        "Venus",
		        "Mars"
		    ],
		    "size": 512
		}
	},
	//_________________________________________SPACE CURVE MANAGER
	{
	name: "space curve manager", 
	uid: "OWbb", 
	factory: SpaceCurveManager,
	inputs: [
		"-> setup",
		"-> position",
		"-> curve show",
		"-> curve hide"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"scene remove -> scene remove @ scene manager (NjOF)",
		"scene dispose -> scene dispose @ scene manager (NjOF)"
		]
	},
	//_____________________________________________CAMERA SETTINGS
	{
	name: "camera settings", 
	uid: "lEDy", 
	factory: CamerasSettings,
	inputs: [
		"-> list",
		"-> settings"
		],
	outputs: [
		"div -> right side add div @ screen layout (WoLD)",
		"show helpers -> helpers show @ camera manager (acqd)",
		"hide helpers -> helpers hide @ camera manager (acqd)",
		"user add -> camera add @ camera manager (acqd)",
		"user delete -> camera delete @ camera manager (acqd)",
		"user update -> camera update @ camera manager (acqd)",
		"user select -> camera select @ camera manager (acqd)"
		]
	},
	//_________________________________________________STAR SPHERE
	{
	name: "star sphere", 
	uid: "fHfg", 
	factory: StarSphere,
	inputs: [
		"-> presentation user change"
		],
	outputs: [
		"scene add -> scene add @ scene manager (NjOF)",
		"presentation get user settings => presentation get @ solar system settings (elOS)"
		],
	sx:	{
		    "starFile": "/assets/starmap_2020_8k.jpg",
		    "constellationFile": "/assets/constellations.png",
		    "radius": 200
		}
	},
	//_____________________________________________SELECT ON EARTH
	{
	name: "select on earth", 
	uid: "kGtq", 
	factory: SelectOnEarth,
	inputs: [],
	outputs: [
		"place camera -> place local camera @ planet router (sOSV)",
		"add canvas => left side canvas @ screen layout (WoLD)",
		"get camera => get camera @ camera manager (acqd)"
		],
	sx:	{
		    "earth": {
		        "color": "0x007fff",
		        "textureFile": "/assets/2k_earth_specular_map.jpg"
		    },
		    "camera": {
		        "fov": 50,
		        "near": 0.001,
		        "far": 10
		    },
		    "planetCameras": [
		        {
		            "definition": {
		                "name": "earth camera",
		                "type": "perspective",
		                "near": 1e-9,
		                "far": 200,
		                "fov": 50,
		                "zoom": 1,
		                "aspect": "canvas"
		            },
		            "controls": "telescope",
		            "location": {
		                "planet": "Earth",
		                "coordinates": "50°53'10.7\"N 3°45'57.9\"E",
		                "inclination": 90
		            }
		        }
		    ]
		}
	},
	//____________________________________________________TOP MENU
	{
	name: "top menu", 
	uid: "iMGA", 
	factory: IconMenuHorizontal,
	inputs: [],
	outputs: [
		`panels toggle -> [ 
			"right side toggle @ screen layout (WoLD)",
			"left side toggle @ screen layout (WoLD)" ]`,
		"div -> menu @ screen layout (WoLD)"
		],
	sx:	[
		    {
		        "name": "width_full",
		        "help": "show/hide panels",
		        "message": "panels toggle"
		    }
		]
	},
	//__________________________________________________MCP CLIENT
	{
	name: "MCP Client", 
	uid: "PQNC", 
	factory: McpClientOpenAI,
	inputs: [
		"-> new prompt",
		"-> handle key",
		"-> tool result"
		],
	outputs: [
		"update chat -> update chat @ LLM Chat Window (CTRT)",
		"get manifest => get manifest @ MCP Server (xBvE)",
		"get tools => get tools @ MCP Server (xBvE)",
		"call tool -> call tool @ MCP Server (xBvE)"
		],
	dx:	{
		    "logMessages": false,
		    "worker": {
		        "on": false,
		        "path": ""
		    }
		}
	},
	//__________________________________________________MCP SERVER
	{
	name: "MCP Server", 
	uid: "xBvE", 
	factory: McpServerInBrowser,
	inputs: [
		"-> call tool",
		"=> get tools",
		"=> get manifest"
		],
	outputs: [
		"tool result -> tool result @ MCP Client (PQNC)"
		],
	dx:	{
		    "logMessages": false,
		    "worker": {
		        "on": false,
		        "path": ""
		    }
		}
	},
	//_____________________________________________LLM CHAT WINDOW
	{
	name: "LLM Chat Window", 
	uid: "CTRT", 
	factory: LLMChatWindow,
	inputs: [
		"-> update chat"
		],
	outputs: [
		"div -> right side add div @ screen layout (WoLD)",
		"new prompt -> new prompt @ MCP Client (PQNC)",
		"handle key -> handle key @ MCP Client (PQNC)"
		]
	},
]

//The filters
const filterList = [
	//________________________________________PLANET ROUTER FILTER
	{
	name: "planet router", 
	uid: "sOSV", 
	filter: PlanetRouter,
	table: [
		`place local camera : [
			"place local camera @ earth (SjVU)",
			"place local camera @ mercury (ATaA)",
			"place local camera @ uranus (vVuq)",
			"place local camera @ neptune (AkPj)",
			"place local camera @ saturn (vprC)",
			"place local camera @ mars (trxc)",
			"place local camera @ venus (eUwR)" ]`,
		`presentation user change : [
			"presentation user change @ mercury (ATaA)",
			"presentation user change @ earth (SjVU)",
			"presentation user change @ the moon (dEyu)",
			"presentation user change @ uranus (vVuq)",
			"presentation user change @ sun (RHjs)",
			"presentation user change @ venus (eUwR)",
			"presentation user change @ mars (trxc)",
			"presentation user change @ saturn (vprC)",
			"presentation user change @ neptune (AkPj)",
			"presentation user change @ Io (lKJu)",
			"presentation user change @ Europa (oqnr)",
			"presentation user change @ Ganymede (GFSz)",
			"presentation user change @ Callisto (RgBI)",
			"presentation user change @ jupiter (BhVQ)" ]`,
		`simulation user change : [
			"simulation user change @ uranus (vVuq)",
			"simulation user change @ mercury (ATaA)",
			"simulation user change @ earth (SjVU)",
			"simulation user change @ the moon (dEyu)",
			"simulation user change @ sun (RHjs)",
			"simulation user change @ venus (eUwR)",
			"simulation user change @ mars (trxc)",
			"simulation user change @ saturn (vprC)",
			"simulation user change @ neptune (AkPj)",
			"simulation user change @ Io (lKJu)",
			"simulation user change @ Europa (oqnr)",
			"simulation user change @ Ganymede (GFSz)",
			"simulation user change @ Callisto (RgBI)",
			"simulation user change @ jupiter (BhVQ)" ]`,]
	},
]

// prepare the runtime
const runtime = VMBLU.scaffold(nodeList, filterList)

// and start the app
runtime.start()
