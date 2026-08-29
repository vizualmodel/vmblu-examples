// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.11","schemaVersion":"1.11.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.11.0"},"source":{"model":"chat-server.mod.blu","hash":"fnv1a64:2297676d38a62b08"}}
// ------------------------------------------------------------------

// import the runtime code
import {Runtime} from "@vizualmodel/vmblu-runtime/rt-base"


//Imports
import { createWsGatewayNode } from '../nodes/ws-gateway.js'
import { createChatStateNode } from '../nodes/chat-state.js'



//The runtime nodes
const nodeList = [
	//__________________________________________________WS GATEWAY
	{
	name: "ws gateway",
	uid: "hrrC",
	factory: createWsGatewayNode,
	inputs: [
		"-> auth.login-result",
		"-> chat.history-deliver",
		"-> chat.message-deliver"
		],
	outputs: [
		"auth.login-received -> auth.login-received @ chat state (xtUb)",
		"chat.message-received -> chat.message-received @ chat state (xtUb)",
		"session.user-disconnected -> session.user-disconnected @ chat state (xtUb)"
		]
	},
	//__________________________________________________CHAT STATE
	{
	name: "chat state",
	uid: "xtUb",
	factory: createChatStateNode,
	inputs: [
		"-> auth.login-received",
		"-> chat.message-received",
		"-> session.user-disconnected"
		],
	outputs: [
		"auth.login-result -> auth.login-result @ ws gateway (hrrC)",
		"chat.history-deliver -> chat.history-deliver @ ws gateway (hrrC)",
		"chat.message-deliver -> chat.message-deliver @ ws gateway (hrrC)"
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
