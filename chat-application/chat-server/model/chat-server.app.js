// ------------------------------------------------------------------
// Model: Root
// @vmblu-generated {"generated":true,"artifact":"application","compatibilityFamily":"1.12","schemaVersion":"1.12.1","generator":{"name":"@vizualmodel/vmblu-core","version":"1.12.1"},"source":{"model":"chat-server.mod.blu","hash":"fnv1a64:3f092f4b8b8e87ec"}}
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
	uid: "jsNj",
	factory: createWsGatewayNode,
	inputs: [
		"-> auth.login-result",
		"-> chat.history-deliver",
		"-> chat.message-deliver"
		],
	outputs: [
		"auth.login-received -> auth.login-received @ chat state (Yzik)",
		"chat.message-received -> chat.message-received @ chat state (Yzik)",
		"session.user-disconnected -> session.user-disconnected @ chat state (Yzik)"
		]
	},
	//__________________________________________________CHAT STATE
	{
	name: "chat state",
	uid: "Yzik",
	factory: createChatStateNode,
	inputs: [
		"-> auth.login-received",
		"-> chat.message-received",
		"-> session.user-disconnected"
		],
	outputs: [
		"auth.login-result -> auth.login-result @ ws gateway (jsNj)",
		"chat.history-deliver -> chat.history-deliver @ ws gateway (jsNj)",
		"chat.message-deliver -> chat.message-deliver @ ws gateway (jsNj)"
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
