// ------------------------------------------------------------------
// Model: Root
// Path: C:/dev/vmblu/examples/chat-application/chat-client/model/chat-client.app.js
// Creation date 5/19/2026, 3:34:36 PM
// ------------------------------------------------------------------

// import the runtime code
import * as VMBLU from "@vizualmodel/vmblu-runtime/rt-base"


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
	uid: "dkXm", 
	factory: createLoginPopupNode,
	inputs: [
		"=> ui.get-view"
		],
	outputs: [
		"auth.login-submitted -> auth.login-submitted @ client controller (lfTP)"
		]
	},
	//_____________________________________________MESSAGE HISTORY
	{
	name: "message history", 
	uid: "vOFq", 
	factory: createMessageHistoryNode,
	inputs: [
		"-> chat.connection-state",
		"-> chat.message-list",
		"-> chat.append-message",
		"-> chat.current-user",
		"=> ui.get-view"
		],
	outputs: [
		"auth.logout-request -> auth.logout-request @ client controller (lfTP)"
		]
	},
	//____________________________________________MESSAGE COMPOSER
	{
	name: "message composer", 
	uid: "AsyV", 
	factory: createMessageComposerNode,
	inputs: [
		"-> chat.connection-state",
		"=> ui.get-view"
		],
	outputs: [
		"chat.send-message -> chat.send-message @ client controller (lfTP)"
		]
	},
	//___________________________________________CLIENT CONTROLLER
	{
	name: "client controller", 
	uid: "lfTP", 
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
		"auth.connect-request -> auth.connect-request @ ws transport (dZzM)",
		"auth.disconnect-request -> auth.disconnect-request @ ws transport (dZzM)",
		"chat.outgoing-message -> chat.outgoing-message @ ws transport (dZzM)",
		`net.connection-state -> [ 
			"chat.connection-state @ message history (vOFq)",
			"chat.connection-state @ message composer (AsyV)" ]`,
		"history.message-list -> chat.message-list @ message history (vOFq)",
		"history.append-message -> chat.append-message @ message history (vOFq)",
		"history.current-user -> chat.current-user @ message history (vOFq)",
		"ui.get-history-view => ui.get-view @ message history (vOFq)",
		"ui.get-login-view => ui.get-view @ login popup (dkXm)",
		"ui.get-composer-view => ui.get-view @ message composer (AsyV)"
		]
	},
	//________________________________________________WS TRANSPORT
	{
	name: "ws transport", 
	uid: "dZzM", 
	factory: createWsTransportNode,
	inputs: [
		"-> auth.connect-request",
		"-> auth.disconnect-request",
		"-> chat.outgoing-message"
		],
	outputs: [
		"auth.connected -> auth.connected @ client controller (lfTP)",
		"chat.history-received -> chat.history-received @ client controller (lfTP)",
		"chat.incoming-message -> chat.incoming-message @ client controller (lfTP)",
		"net.connection-state -> net.connection-state @ client controller (lfTP)"
		]
	},
]

const agentRuntimeOptions = {}

// prepare the runtime
const runtime = new VMBLU.Runtime(nodeList, agentRuntimeOptions)

// and start the app
runtime.start()
