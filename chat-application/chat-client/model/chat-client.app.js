// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.0"},"source":{"model":"chat-client.mod.blu","hash":"fnv1a64:e1c7e1f0c7ed0a8b"}}
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
	uid: "YTzq",
	factory: createMessageHistoryNode,
	inputs: [
		"-> chat.connection-state",
		"-> chat.message-list",
		"-> chat.append-message",
		"-> chat.current-user",
		"=> ui.get-view"
		],
	outputs: [
		"auth.logout-request -> auth.logout-request @ client controller (rmfI)"
		]
	},
	//____________________________________________MESSAGE COMPOSER
	{
	name: "message composer",
	uid: "fteF",
	factory: createMessageComposerNode,
	inputs: [
		"-> chat.connection-state",
		"=> ui.get-view"
		],
	outputs: [
		"chat.send-message -> chat.send-message @ client controller (rmfI)"
		]
	},
	//___________________________________________CLIENT CONTROLLER
	{
	name: "client controller",
	uid: "rmfI",
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
		"auth.connect-request -> auth.connect-request @ ws transport (YogF)",
		"auth.disconnect-request -> auth.disconnect-request @ ws transport (YogF)",
		"chat.outgoing-message -> chat.outgoing-message @ ws transport (YogF)",
		`net.connection-state -> [ 
			"chat.connection-state @ message history (YTzq)",
			"chat.connection-state @ message composer (fteF)" ]`,
		"history.message-list -> chat.message-list @ message history (YTzq)",
		"history.append-message -> chat.append-message @ message history (YTzq)",
		"history.current-user -> chat.current-user @ message history (YTzq)",
		"ui.get-history-view => ui.get-view @ message history (YTzq)",
		"ui.get-login-view => ui.get-view @ login popup (lClB)",
		"ui.get-composer-view => ui.get-view @ message composer (fteF)"
		]
	},
	//________________________________________________WS TRANSPORT
	{
	name: "ws transport",
	uid: "YogF",
	factory: createWsTransportNode,
	inputs: [
		"-> auth.connect-request",
		"-> auth.disconnect-request",
		"-> chat.outgoing-message"
		],
	outputs: [
		"auth.connected -> auth.connected @ client controller (rmfI)",
		"chat.history-received -> chat.history-received @ client controller (rmfI)",
		"chat.incoming-message -> chat.incoming-message @ client controller (rmfI)",
		"net.connection-state -> net.connection-state @ client controller (rmfI)"
		]
	},
	//_________________________________________________LOGIN POPUP
	{
	name: "login popup",
	uid: "lClB",
	factory: createLoginPopupNode,
	inputs: [
		"=> ui.get-view"
		],
	outputs: [
		"auth.login-submitted -> auth.login-submitted @ client controller (rmfI)"
		]
	},
]

// Runtime options
const runtimeOptions = {
    vmblu: {"compatibilityFamily":"1.12","generatorVersion":"1.12.0","schemaVersion":"1.12.0"},
    capabilities,
    agent
}

// prepare the runtime
const runtime = new Runtime(nodeList, runtimeOptions)

// and start the app
runtime.start()
