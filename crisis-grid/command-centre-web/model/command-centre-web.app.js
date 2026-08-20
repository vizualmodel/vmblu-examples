// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.10","schemaVersion":"1.10.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.10.0"},"source":{"model":"command-centre-web.mod.blu","hash":"fnv1a64:2a8918a4dd92d50c"}}
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
	uid: "TPzD",
	factory: createWorkspaceNode,
	inputs: [
		"-> session.status-changed"
		],
	outputs: [
		"workspace.open-incident -> workspace.open-incident @ Operational Picture (mNMc)",
		`workspace.activation-change -> [ 
			"workspace.activation-change @ Situation Workspace (kyhY)",
			"workspace.activation-change @ Spatial Workspace (fDtI)",
			"workspace.activation-change @ Talk Workspace (VzKo)",
			"workspace.activation-change @ Action Workspace (KJvo)",
			"workspace.activation-change @ Layout (MrBA)" ]`
		]
	},
	//______________________________________________________LAYOUT
	{
	name: "Layout",
	uid: "MrBA",
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
	uid: "vkrQ",
	factory: createOperationalCoreConnectionNode,
	inputs: [
		"=> session.establish",
		"=> operational-picture.load",
		"=> live-updates.subscribe",
		"=> operational-command.submit"
		],
	outputs: [
		"session.status-changed -> session.status-changed @ Workspace (TPzD)",
		"live-updates.received -> live-updates.received @ Operational Picture (mNMc)",
		"connection.status-changed -> connection.status-changed @ Operational Picture (mNMc)"
		]
	},
	//_________________________________________OPERATIONAL PICTURE
	{
	name: "Operational Picture",
	uid: "mNMc",
	factory: createOperationalPictureNode,
	inputs: [
		"-> workspace.open-incident",
		"-> live-updates.received",
		"=> projection.detail-request",
		"-> operational-command.committed",
		"-> connection.status-changed"
		],
	outputs: [
		"operational-picture.load => operational-picture.load @ Operational Core Connection (vkrQ)",
		"live-updates.subscribe => live-updates.subscribe @ Operational Core Connection (vkrQ)",
		`projection.updated -> [ 
			"projection.updated @ Spatial Workspace (fDtI)",
			"projection.updated @ Situation Workspace (kyhY)",
			"projection.updated @ Talk Workspace (VzKo)",
			"projection.updated @ Action Workspace (KJvo)" ]`
		]
	},
	//___________________________________________SPATIAL WORKSPACE
	{
	name: "Spatial Workspace",
	uid: "fDtI",
	factory: createSpatialWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"projection.detail-request => projection.detail-request @ Operational Picture (mNMc)",
		"operational-command.proposal -> operational-command.proposal @ Action Workspace (KJvo)",
		"layout.acquire-region => layout.acquire-region @ Layout (MrBA)"
		]
	},
	//_________________________________________SITUATION WORKSPACE
	{
	name: "Situation Workspace",
	uid: "kyhY",
	factory: createSituationWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (MrBA)"
		]
	},
	//____________________________________________ACTION WORKSPACE
	{
	name: "Action Workspace",
	uid: "KJvo",
	factory: createActionWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated",
		"-> operational-command.proposal"
		],
	outputs: [
		"operational-command.submit => operational-command.submit @ Operational Core Connection (vkrQ)",
		"operational-command.committed -> operational-command.committed @ Operational Picture (mNMc)",
		"layout.acquire-region => layout.acquire-region @ Layout (MrBA)"
		]
	},
	//______________________________________________TALK WORKSPACE
	{
	name: "Talk Workspace",
	uid: "VzKo",
	factory: createTalkWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (MrBA)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"1.10","generatorVersion":"1.10.0","schemaVersion":"1.10.0"}
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
