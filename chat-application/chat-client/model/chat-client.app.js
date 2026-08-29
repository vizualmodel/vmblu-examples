// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.11","schemaVersion":"1.11.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.11.0"},"source":{"model":"chat-client.mod.blu","hash":"fnv1a64:b4f51bdc23aec04d"}}
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
	uid: "fFZB",
	factory: createLoginPopupNode,
	inputs: [
		"=> ui.get-view"
		],
	outputs: [
		"auth.login-submitted -> auth.login-submitted @ client controller (PnLf)"
		]
	},
	//_____________________________________________MESSAGE HISTORY
	{
	name: "message history",
	uid: "lFED",
	factory: createMessageHistoryNode,
	inputs: [
		"-> chat.connection-state",
		"-> chat.message-list",
		"-> chat.append-message",
		"-> chat.current-user",
		"=> ui.get-view"
		],
	outputs: [
		"auth.logout-request -> auth.logout-request @ client controller (PnLf)"
		]
	},
	//____________________________________________MESSAGE COMPOSER
	{
	name: "message composer",
	uid: "mfYL",
	factory: createMessageComposerNode,
	inputs: [
		"-> chat.connection-state",
		"=> ui.get-view"
		],
	outputs: [
		"chat.send-message -> chat.send-message @ client controller (PnLf)"
		]
	},
	//___________________________________________CLIENT CONTROLLER
	{
	name: "client controller",
	uid: "PnLf",
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
		"auth.connect-request -> auth.connect-request @ ws transport (SofQ)",
		"auth.disconnect-request -> auth.disconnect-request @ ws transport (SofQ)",
		"chat.outgoing-message -> chat.outgoing-message @ ws transport (SofQ)",
		`net.connection-state -> [ 
			"chat.connection-state @ message history (lFED)",
			"chat.connection-state @ message composer (mfYL)" ]`,
		"history.message-list -> chat.message-list @ message history (lFED)",
		"history.append-message -> chat.append-message @ message history (lFED)",
		"history.current-user -> chat.current-user @ message history (lFED)",
		"ui.get-history-view => ui.get-view @ message history (lFED)",
		"ui.get-login-view => ui.get-view @ login popup (fFZB)",
		"ui.get-composer-view => ui.get-view @ message composer (mfYL)"
		]
	},
	//________________________________________________WS TRANSPORT
	{
	name: "ws transport",
	uid: "SofQ",
	factory: createWsTransportNode,
	inputs: [
		"-> auth.connect-request",
		"-> auth.disconnect-request",
		"-> chat.outgoing-message"
		],
	outputs: [
		"auth.connected -> auth.connected @ client controller (PnLf)",
		"chat.history-received -> chat.history-received @ client controller (PnLf)",
		"chat.incoming-message -> chat.incoming-message @ client controller (PnLf)",
		"net.connection-state -> net.connection-state @ client controller (PnLf)"
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
