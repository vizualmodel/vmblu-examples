// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.0"},"source":{"model":"command-centre-web.mod.blu","hash":"fnv1a64:130711fb276f895b"}}
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
	uid: "vaTN",
	factory: createWorkspaceNode,
	inputs: [
		"-> session.status-changed"
		],
	outputs: [
		"workspace.open-incident -> workspace.open-incident @ Operational Picture (ClCX)",
		`workspace.activation-change -> [ 
			"workspace.activation-change @ Situation Workspace (ZLjN)",
			"workspace.activation-change @ Spatial Workspace (ZeGh)",
			"workspace.activation-change @ Talk Workspace (xtoB)",
			"workspace.activation-change @ Action Workspace (bCaj)",
			"workspace.activation-change @ Layout (NtqX)" ]`
		]
	},
	//______________________________________________________LAYOUT
	{
	name: "Layout",
	uid: "NtqX",
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
	uid: "oaVW",
	factory: createOperationalCoreConnectionNode,
	inputs: [
		"=> session.establish",
		"=> operational-picture.load",
		"=> live-updates.subscribe",
		"=> operational-command.submit"
		],
	outputs: [
		"session.status-changed -> session.status-changed @ Workspace (vaTN)",
		"live-updates.received -> live-updates.received @ Operational Picture (ClCX)",
		"connection.status-changed -> connection.status-changed @ Operational Picture (ClCX)"
		]
	},
	//_________________________________________OPERATIONAL PICTURE
	{
	name: "Operational Picture",
	uid: "ClCX",
	factory: createOperationalPictureNode,
	inputs: [
		"-> workspace.open-incident",
		"-> live-updates.received",
		"=> projection.detail-request",
		"-> operational-command.committed",
		"-> connection.status-changed"
		],
	outputs: [
		"operational-picture.load => operational-picture.load @ Operational Core Connection (oaVW)",
		"live-updates.subscribe => live-updates.subscribe @ Operational Core Connection (oaVW)",
		`projection.updated -> [ 
			"projection.updated @ Spatial Workspace (ZeGh)",
			"projection.updated @ Situation Workspace (ZLjN)",
			"projection.updated @ Talk Workspace (xtoB)",
			"projection.updated @ Action Workspace (bCaj)" ]`
		]
	},
	//___________________________________________SPATIAL WORKSPACE
	{
	name: "Spatial Workspace",
	uid: "ZeGh",
	factory: createSpatialWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"projection.detail-request => projection.detail-request @ Operational Picture (ClCX)",
		"operational-command.proposal -> operational-command.proposal @ Action Workspace (bCaj)",
		"layout.acquire-region => layout.acquire-region @ Layout (NtqX)"
		]
	},
	//_________________________________________SITUATION WORKSPACE
	{
	name: "Situation Workspace",
	uid: "ZLjN",
	factory: createSituationWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (NtqX)"
		]
	},
	//____________________________________________ACTION WORKSPACE
	{
	name: "Action Workspace",
	uid: "bCaj",
	factory: createActionWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated",
		"-> operational-command.proposal"
		],
	outputs: [
		"operational-command.submit => operational-command.submit @ Operational Core Connection (oaVW)",
		"operational-command.committed -> operational-command.committed @ Operational Picture (ClCX)",
		"layout.acquire-region => layout.acquire-region @ Layout (NtqX)"
		]
	},
	//______________________________________________TALK WORKSPACE
	{
	name: "Talk Workspace",
	uid: "xtoB",
	factory: createTalkWorkspaceNode,
	inputs: [
		"-> workspace.activation-change",
		"-> projection.updated"
		],
	outputs: [
		"layout.acquire-region => layout.acquire-region @ Layout (NtqX)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"1.12","generatorVersion":"1.12.0","schemaVersion":"1.12.0"}
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
