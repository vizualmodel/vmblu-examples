// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.0"},"source":{"model":"chat-server.mod.blu","hash":"fnv1a64:ce602ba174f7eced"}}
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
	uid: "CPbC",
	factory: createWsGatewayNode,
	inputs: [
		"-> auth.login-result",
		"-> chat.history-deliver",
		"-> chat.message-deliver"
		],
	outputs: [
		"auth.login-received -> auth.login-received @ chat state (Swhy)",
		"chat.message-received -> chat.message-received @ chat state (Swhy)",
		"session.user-disconnected -> session.user-disconnected @ chat state (Swhy)"
		]
	},
	//__________________________________________________CHAT STATE
	{
	name: "chat state",
	uid: "Swhy",
	factory: createChatStateNode,
	inputs: [
		"-> auth.login-received",
		"-> chat.message-received",
		"-> session.user-disconnected"
		],
	outputs: [
		"auth.login-result -> auth.login-result @ ws gateway (CPbC)",
		"chat.history-deliver -> chat.history-deliver @ ws gateway (CPbC)",
		"chat.message-deliver -> chat.message-deliver @ ws gateway (CPbC)"
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
