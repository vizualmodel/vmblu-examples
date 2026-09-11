// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.1","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.1"},"source":{"model":"chat-client.mod.blu","hash":"fnv1a64:3acac2090d6536b6"}}
// ------------------------------------------------------------------

// import the runtime code
import {Runtime} from "@vizualmodel/vmblu-runtime/rt-browser-agent"


//Imports
import { createMessageHistoryNode } from '../nodes/message history/index.js'
import { createMessageComposerNode } from '../nodes/message composer/index.js'
import { createClientControllerNode } from '../nodes/client-controller.js'
import { createWsTransportNode } from '../nodes/ws-transport.js'
import { createLoginPopupNode } from '../nodes/login popup/index.js'

// Runtime sidecars
import capabilities from './chat-client.cap.json' with { type: 'json' }
import agent from './chat-client.agent.json' with { type: 'json' }

//The runtime nodes
const nodeList = [
	//_____________________________________________MESSAGE HISTORY
	{
	name: "message history",
	uid: "LvkL",
	factory: createMessageHistoryNode,
	inputs: [
		"-> chat.connection-state",
		"-> chat.message-list",
		"-> chat.append-message",
		"-> chat.current-user",
		"=> ui.get-view"
		],
	outputs: [
		"auth.logout-request -> auth.logout-request @ client controller (hwfo)"
		]
	},
	//____________________________________________MESSAGE COMPOSER
	{
	name: "message composer",
	uid: "cSSL",
	factory: createMessageComposerNode,
	inputs: [
		"-> chat.connection-state",
		"=> ui.get-view"
		],
	outputs: [
		"chat.send-message -> chat.send-message @ client controller (hwfo)"
		]
	},
	//___________________________________________CLIENT CONTROLLER
	{
	name: "client controller",
	uid: "hwfo",
	factory: createClientControllerNode,
	inputs: [
		"-> auth.connected",
		"-> auth.logout-request",
		"-> auth.login-submitted",
		"-> chat.history-received",
		"-> chat.incoming-message",
		"-> chat.send-message",
		"=> agent.send-message",
		"-> net.connection-state"
		],
	outputs: [
		"auth.connect-request -> auth.connect-request @ ws transport (XHmp)",
		"auth.disconnect-request -> auth.disconnect-request @ ws transport (XHmp)",
		"chat.outgoing-message -> chat.outgoing-message @ ws transport (XHmp)",
		`net.connection-state -> [ 
			"chat.connection-state @ message history (LvkL)",
			"chat.connection-state @ message composer (cSSL)" ]`,
		"history.message-list -> chat.message-list @ message history (LvkL)",
		"history.append-message -> chat.append-message @ message history (LvkL)",
		"history.current-user -> chat.current-user @ message history (LvkL)",
		"ui.get-history-view => ui.get-view @ message history (LvkL)",
		"ui.get-login-view => ui.get-view @ login popup (OQul)",
		"ui.get-composer-view => ui.get-view @ message composer (cSSL)"
		]
	},
	//________________________________________________WS TRANSPORT
	{
	name: "ws transport",
	uid: "XHmp",
	factory: createWsTransportNode,
	inputs: [
		"-> auth.connect-request",
		"-> auth.disconnect-request",
		"-> chat.outgoing-message"
		],
	outputs: [
		"auth.connected -> auth.connected @ client controller (hwfo)",
		"chat.history-received -> chat.history-received @ client controller (hwfo)",
		"chat.incoming-message -> chat.incoming-message @ client controller (hwfo)",
		"net.connection-state -> net.connection-state @ client controller (hwfo)"
		]
	},
	//_________________________________________________LOGIN POPUP
	{
	name: "login popup",
	uid: "OQul",
	factory: createLoginPopupNode,
	inputs: [
		"=> ui.get-view"
		],
	outputs: [
		"auth.login-submitted -> auth.login-submitted @ client controller (hwfo)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"1.12","generatorVersion":"1.12.1","schemaVersion":"1.12.1"},
    capabilities,
    agent
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
