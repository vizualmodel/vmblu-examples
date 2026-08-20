// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.10","schemaVersion":"1.10.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.10.0"},"source":{"model":"chat-client.mod.blu","hash":"fnv1a64:0385ba60c0101c0a"}}
// ------------------------------------------------------------------

// import the runtime code
import {Runtime} from "@vizualmodel/vmblu-runtime/rt-base"


//Imports
import { createLoginPopupNode } from '../nodes/login popup/index.js'
import { createMessageHistoryNode } from '../nodes/message history/index.js'
import { createMessageComposerNode } from '../nodes/message composer/index.js'
import { createClientControllerNode } from '../nodes/client-controller.js'
import { createWsTransportNode } from '../nodes/ws-transport.js'



//The runtime nodes
const nodeList = [
	//_________________________________________________LOGIN POPUP
	{
	name: "login popup",
	uid: "stcy",
	factory: createLoginPopupNode,
	inputs: [
		"=> ui.get-view"
		],
	outputs: [
		"auth.login-submitted -> auth.login-submitted @ client controller (rjEk)"
		]
	},
	//_____________________________________________MESSAGE HISTORY
	{
	name: "message history",
	uid: "gNmF",
	factory: createMessageHistoryNode,
	inputs: [
		"-> chat.connection-state",
		"-> chat.message-list",
		"-> chat.append-message",
		"-> chat.current-user",
		"=> ui.get-view"
		],
	outputs: [
		"auth.logout-request -> auth.logout-request @ client controller (rjEk)"
		]
	},
	//____________________________________________MESSAGE COMPOSER
	{
	name: "message composer",
	uid: "zKuu",
	factory: createMessageComposerNode,
	inputs: [
		"-> chat.connection-state",
		"=> ui.get-view"
		],
	outputs: [
		"chat.send-message -> chat.send-message @ client controller (rjEk)"
		]
	},
	//___________________________________________CLIENT CONTROLLER
	{
	name: "client controller",
	uid: "rjEk",
	factory: createClientControllerNode,
	inputs: [
		"-> auth.connected",
		"-> auth.logout-request",
		"-> auth.login-submitted",
		"-> chat.history-received",
		"-> chat.incoming-message",
		"-> chat.send-message",
		"-> net.connection-state"
		],
	outputs: [
		"auth.connect-request -> auth.connect-request @ ws transport (Wfpz)",
		"auth.disconnect-request -> auth.disconnect-request @ ws transport (Wfpz)",
		"chat.outgoing-message -> chat.outgoing-message @ ws transport (Wfpz)",
		`net.connection-state -> [ 
			"chat.connection-state @ message history (gNmF)",
			"chat.connection-state @ message composer (zKuu)" ]`,
		"history.message-list -> chat.message-list @ message history (gNmF)",
		"history.append-message -> chat.append-message @ message history (gNmF)",
		"history.current-user -> chat.current-user @ message history (gNmF)",
		"ui.get-history-view => ui.get-view @ message history (gNmF)",
		"ui.get-login-view => ui.get-view @ login popup (stcy)",
		"ui.get-composer-view => ui.get-view @ message composer (zKuu)"
		]
	},
	//________________________________________________WS TRANSPORT
	{
	name: "ws transport",
	uid: "Wfpz",
	factory: createWsTransportNode,
	inputs: [
		"-> auth.connect-request",
		"-> auth.disconnect-request",
		"-> chat.outgoing-message"
		],
	outputs: [
		"auth.connected -> auth.connected @ client controller (rjEk)",
		"chat.history-received -> chat.history-received @ client controller (rjEk)",
		"chat.incoming-message -> chat.incoming-message @ client controller (rjEk)",
		"net.connection-state -> net.connection-state @ client controller (rjEk)"
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
