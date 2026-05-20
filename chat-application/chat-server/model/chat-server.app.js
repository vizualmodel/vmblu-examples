// ------------------------------------------------------------------
// Model: Root
// Path: C:/dev/vmblu/examples/chat-application/chat-server/model/chat-server.app.js
// Creation date 5/19/2026, 3:34:36 PM
// ------------------------------------------------------------------

// import the runtime code
import * as VMBLU from "@vizualmodel/vmblu-runtime/rt-base"


//Imports
import { createWsGatewayNode } from '../nodes/ws-gateway.js'
import { createChatStateNode } from '../nodes/chat-state.js'



//The runtime nodes
const nodeList = [
	//__________________________________________________WS GATEWAY
	{
	name: "ws gateway", 
	uid: "vAmZ", 
	factory: createWsGatewayNode,
	inputs: [
		"-> auth.login-result",
		"-> chat.history-deliver",
		"-> chat.message-deliver"
		],
	outputs: [
		"auth.login-received -> auth.login-received @ chat state (YMWT)",
		"chat.message-received -> chat.message-received @ chat state (YMWT)",
		"session.user-disconnected -> session.user-disconnected @ chat state (YMWT)"
		]
	},
	//__________________________________________________CHAT STATE
	{
	name: "chat state", 
	uid: "YMWT", 
	factory: createChatStateNode,
	inputs: [
		"-> auth.login-received",
		"-> chat.message-received",
		"-> session.user-disconnected"
		],
	outputs: [
		"auth.login-result -> auth.login-result @ ws gateway (vAmZ)",
		"chat.history-deliver -> chat.history-deliver @ ws gateway (vAmZ)",
		"chat.message-deliver -> chat.message-deliver @ ws gateway (vAmZ)"
		]
	},
]

const agentRuntimeOptions = {}

// prepare the runtime
const runtime = VMBLU.scaffold(nodeList, [], agentRuntimeOptions)

// and start the app
runtime.start()
