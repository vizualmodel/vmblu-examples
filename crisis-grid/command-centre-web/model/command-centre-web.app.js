// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"0.10","schemaVersion":"0.10.0","generator":{"name":"@vizualmodel/vmblu-core","version":"0.10.0"},"source":{"model":"command-centre-web.mod.blu","hash":"fnv1a64:8ea8af018994e494"}}
// ------------------------------------------------------------------

// import the runtime code
import {Runtime} from "@vizualmodel/vmblu-runtime/rt-base"


//Imports
import { createWorkspaceNode } from '../nodes/application-shell/workspace/index.js'
import { createLayoutNode } from '../nodes/application-shell/layout/index.js'
import { createOperationalCoreConnectionNode } from '../nodes/operational-core-connection/index.js'
import { createOperationalPictureNode } from '../nodes/operational-picture/index.js'
import { createSpatialWorkspaceNode } from '../nodes/spatial-workspace/index.js'
import { createSituationWorkspaceNode } from '../nodes/situation-workspace/index.js'
import { createActionWorkspaceNode } from '../nodes/action-workspace/index.js'
import { createTalkWorkspaceNode } from '../nodes/talk-workspace/index.js'



//The runtime nodes
const nodeList = [
	//___________________________________________________WORKSPACE
	{
	name: "Workspace",
	uid: "sDVG",
	factory: createWorkspaceNode,
	inputs: [
		"-> session.status-changed"
		],
	outputs: [
		"workspace.open-incident -> workspace.open-incident @ Operational Picture (HhXF)",
		`workspace.activation-change -> [ 
			"workspace.activation-change @ Situation Workspace (LITE)",
			"workspace.activation-change @ Spatial Workspace (Ulhg)",
			"workspace.activation-change @ Talk Workspace (eLKg)",
			"workspace.activation-change @ Action Workspace (LRWi)",
			"workspace.activation-change @ Layout (xZTg)" ]`
		]
	},
	//______________________________________________________LAYOUT
	{
	name: "Layout",
	uid: "xZTg",
	factory: createLayoutNode,
	inputs: [
		"=> layout.acquire-region",
		"-> workspace.activation-change"
		],
	outputs: []
	},
	//_________________________________OPERATIONAL CORE CONNECTION
	{
	name: "Operational Core Connection",
	uid: "LqNI",
	factory: createOperationalCoreConnectionNode,
	inputs: [
		"=> session.establish",
		"=> operational-picture.load",
		"=> live-updates.subscribe",
		"=> operational-command.submit"
		],
	outputs: [
		"session.status-changed -> session.status-changed @ Workspace (sDVG)",
		"live-updates.received -> live-updates.received @ Operational Picture (HhXF)",
		"connection.status-changed -> connection.status-changed @ Operational Picture (HhXF)"
		]
	},
	//_________________________________________OPERATIONAL PICTURE
	{
	name: "Operational Picture",
	uid: "HhXF",
	factory: createOperationalPictureNode,
	inputs: [
		"-> workspace.open-incident",
		"-> live-updates.received",
		"=> projection.detail-request",
		"-> operational-command.committed",
		"-> connection.status-changed"
		],
	outputs: [
		"operational-picture.load => operational-picture.load @ Operational Core Connection (LqNI)",
		"live-updates.subscribe => live-updates.subscribe @ Operational Core Connection (LqNI)",
		`projection.updated -> [ 
			"projection.updated @ Spatial Workspace (Ulhg)",
			"projection.updated @ Situation Workspace (LITE)",
			"projection.updated @ Talk Workspace (eLKg)",
			"projection.updated @ Action Workspace (LRWi)" ]`
		]
	},
	//___________________________________________SPATIAL WORKSPACE
	{
	name: "Spatial Workspace",
	uid: "Ulhg",
	factory: createSpatialWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"projection.detail-request => projection.detail-request @ Operational Picture (HhXF)",
		"operational-command.proposal -> operational-command.proposal @ Action Workspace (LRWi)",
		"layout.acquire-region => layout.acquire-region @ Layout (xZTg)"
		]
	},
	//_________________________________________SITUATION WORKSPACE
	{
	name: "Situation Workspace",
	uid: "LITE",
	factory: createSituationWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (xZTg)"
		]
	},
	//____________________________________________ACTION WORKSPACE
	{
	name: "Action Workspace",
	uid: "LRWi",
	factory: createActionWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated",
		"-> operational-command.proposal"
		],
	outputs: [
		"operational-command.submit => operational-command.submit @ Operational Core Connection (LqNI)",
		"operational-command.committed -> operational-command.committed @ Operational Picture (HhXF)",
		"layout.acquire-region => layout.acquire-region @ Layout (xZTg)"
		]
	},
	//______________________________________________TALK WORKSPACE
	{
	name: "Talk Workspace",
	uid: "eLKg",
	factory: createTalkWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (xZTg)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"0.10","generatorVersion":"0.10.0","schemaVersion":"0.10.0"}
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
