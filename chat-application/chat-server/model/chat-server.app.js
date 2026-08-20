// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.10","schemaVersion":"1.10.0","generator":{"name":"@vizualmodel/vmblu-core","version":"1.10.0"},"source":{"model":"chat-server.mod.blu","hash":"fnv1a64:125743e9c4c180c3"}}
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
	uid: "VEsB",
	factory: createWsGatewayNode,
	inputs: [
		"-> auth.login-result",
		"-> chat.history-deliver",
		"-> chat.message-deliver"
		],
	outputs: [
		"auth.login-received -> auth.login-received @ chat state (HnmB)",
		"chat.message-received -> chat.message-received @ chat state (HnmB)",
		"session.user-disconnected -> session.user-disconnected @ chat state (HnmB)"
		]
	},
	//__________________________________________________CHAT STATE
	{
	name: "chat state",
	uid: "HnmB",
	factory: createChatStateNode,
	inputs: [
		"-> auth.login-received",
		"-> chat.message-received",
		"-> session.user-disconnected"
		],
	outputs: [
		"auth.login-result -> auth.login-result @ ws gateway (VEsB)",
		"chat.history-deliver -> chat.history-deliver @ ws gateway (VEsB)",
		"chat.message-deliver -> chat.message-deliver @ ws gateway (VEsB)"
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
