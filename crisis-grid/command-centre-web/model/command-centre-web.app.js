// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.11","schemaVersion":"1.11.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.11.0"},"source":{"model":"command-centre-web.mod.blu","hash":"fnv1a64:c3c6bcd2c5e228b1"}}
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
	uid: "DFKp",
	factory: createWorkspaceNode,
	inputs: [
		"-> session.status-changed"
		],
	outputs: [
		"workspace.open-incident -> workspace.open-incident @ Operational Picture (rDwx)",
		`workspace.activation-change -> [ 
			"workspace.activation-change @ Situation Workspace (DJrP)",
			"workspace.activation-change @ Spatial Workspace (TrVA)",
			"workspace.activation-change @ Talk Workspace (CSsD)",
			"workspace.activation-change @ Action Workspace (yQkS)",
			"workspace.activation-change @ Layout (XIUS)" ]`
		]
	},
	//______________________________________________________LAYOUT
	{
	name: "Layout",
	uid: "XIUS",
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
	uid: "kzMO",
	factory: createOperationalCoreConnectionNode,
	inputs: [
		"=> session.establish",
		"=> operational-picture.load",
		"=> live-updates.subscribe",
		"=> operational-command.submit"
		],
	outputs: [
		"session.status-changed -> session.status-changed @ Workspace (DFKp)",
		"live-updates.received -> live-updates.received @ Operational Picture (rDwx)",
		"connection.status-changed -> connection.status-changed @ Operational Picture (rDwx)"
		]
	},
	//_________________________________________OPERATIONAL PICTURE
	{
	name: "Operational Picture",
	uid: "rDwx",
	factory: createOperationalPictureNode,
	inputs: [
		"-> workspace.open-incident",
		"-> live-updates.received",
		"=> projection.detail-request",
		"-> operational-command.committed",
		"-> connection.status-changed"
		],
	outputs: [
		"operational-picture.load => operational-picture.load @ Operational Core Connection (kzMO)",
		"live-updates.subscribe => live-updates.subscribe @ Operational Core Connection (kzMO)",
		`projection.updated -> [ 
			"projection.updated @ Spatial Workspace (TrVA)",
			"projection.updated @ Situation Workspace (DJrP)",
			"projection.updated @ Talk Workspace (CSsD)",
			"projection.updated @ Action Workspace (yQkS)" ]`
		]
	},
	//___________________________________________SPATIAL WORKSPACE
	{
	name: "Spatial Workspace",
	uid: "TrVA",
	factory: createSpatialWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"projection.detail-request => projection.detail-request @ Operational Picture (rDwx)",
		"operational-command.proposal -> operational-command.proposal @ Action Workspace (yQkS)",
		"layout.acquire-region => layout.acquire-region @ Layout (XIUS)"
		]
	},
	//_________________________________________SITUATION WORKSPACE
	{
	name: "Situation Workspace",
	uid: "DJrP",
	factory: createSituationWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (XIUS)"
		]
	},
	//____________________________________________ACTION WORKSPACE
	{
	name: "Action Workspace",
	uid: "yQkS",
	factory: createActionWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated",
		"-> operational-command.proposal"
		],
	outputs: [
		"operational-command.submit => operational-command.submit @ Operational Core Connection (kzMO)",
		"operational-command.committed -> operational-command.committed @ Operational Picture (rDwx)",
		"layout.acquire-region => layout.acquire-region @ Layout (XIUS)"
		]
	},
	//______________________________________________TALK WORKSPACE
	{
	name: "Talk Workspace",
	uid: "CSsD",
	factory: createTalkWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (XIUS)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"1.11","generatorVersion":"1.11.0","schemaVersion":"1.11.0"}
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
