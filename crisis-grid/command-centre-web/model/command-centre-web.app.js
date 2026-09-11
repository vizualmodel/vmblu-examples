// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.1","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.1"},"source":{"model":"command-centre-web.mod.blu","hash":"fnv1a64:24d42c67d2ba8560"}}
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
	uid: "ZyxW",
	factory: createWorkspaceNode,
	inputs: [
		"-> session.status-changed"
		],
	outputs: [
		"workspace.open-incident -> workspace.open-incident @ Operational Picture (FzbG)",
		`workspace.activation-change -> [ 
			"workspace.activation-change @ Situation Workspace (YcTn)",
			"workspace.activation-change @ Spatial Workspace (Ygno)",
			"workspace.activation-change @ Talk Workspace (Ptus)",
			"workspace.activation-change @ Action Workspace (yKMQ)",
			"workspace.activation-change @ Layout (spOM)" ]`
		]
	},
	//______________________________________________________LAYOUT
	{
	name: "Layout",
	uid: "spOM",
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
	uid: "InGq",
	factory: createOperationalCoreConnectionNode,
	inputs: [
		"=> session.establish",
		"=> operational-picture.load",
		"=> live-updates.subscribe",
		"=> operational-command.submit"
		],
	outputs: [
		"session.status-changed -> session.status-changed @ Workspace (ZyxW)",
		"live-updates.received -> live-updates.received @ Operational Picture (FzbG)",
		"connection.status-changed -> connection.status-changed @ Operational Picture (FzbG)"
		]
	},
	//_________________________________________OPERATIONAL PICTURE
	{
	name: "Operational Picture",
	uid: "FzbG",
	factory: createOperationalPictureNode,
	inputs: [
		"-> workspace.open-incident",
		"-> live-updates.received",
		"=> projection.detail-request",
		"-> operational-command.committed",
		"-> connection.status-changed"
		],
	outputs: [
		"operational-picture.load => operational-picture.load @ Operational Core Connection (InGq)",
		"live-updates.subscribe => live-updates.subscribe @ Operational Core Connection (InGq)",
		`projection.updated -> [ 
			"projection.updated @ Spatial Workspace (Ygno)",
			"projection.updated @ Situation Workspace (YcTn)",
			"projection.updated @ Talk Workspace (Ptus)",
			"projection.updated @ Action Workspace (yKMQ)" ]`
		]
	},
	//___________________________________________SPATIAL WORKSPACE
	{
	name: "Spatial Workspace",
	uid: "Ygno",
	factory: createSpatialWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"projection.detail-request => projection.detail-request @ Operational Picture (FzbG)",
		"operational-command.proposal -> operational-command.proposal @ Action Workspace (yKMQ)",
		"layout.acquire-region => layout.acquire-region @ Layout (spOM)"
		]
	},
	//_________________________________________SITUATION WORKSPACE
	{
	name: "Situation Workspace",
	uid: "YcTn",
	factory: createSituationWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (spOM)"
		]
	},
	//____________________________________________ACTION WORKSPACE
	{
	name: "Action Workspace",
	uid: "yKMQ",
	factory: createActionWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated",
		"-> operational-command.proposal"
		],
	outputs: [
		"operational-command.submit => operational-command.submit @ Operational Core Connection (InGq)",
		"operational-command.committed -> operational-command.committed @ Operational Picture (FzbG)",
		"layout.acquire-region => layout.acquire-region @ Layout (spOM)"
		]
	},
	//______________________________________________TALK WORKSPACE
	{
	name: "Talk Workspace",
	uid: "Ptus",
	factory: createTalkWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (spOM)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"1.12","generatorVersion":"1.12.1","schemaVersion":"1.12.1"}
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
