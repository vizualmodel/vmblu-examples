// ------------------------------------------------------------------
// Model: ChatServerApp
// Path: chat-server-app.js
// Creation date 10/28/2025, 10:43:42 AM
// ------------------------------------------------------------------

// import the runtime code
import * as VMBLU from "@vizualmodel/vmblu-runtime"


//Imports
import { createTransportHub } from './dist/nodes/transport-hub.js'
import { createSessionService } from './dist/nodes/session-service.js'
import { createMessageService } from './dist/nodes/message-service.js'
import { createMessageStore } from './dist/nodes/message-store.js'

//The runtime nodes
const nodeList = [
	//________________________________________________TRANSPORTHUB
	{
	name: "TransportHub", 
	uid: "KyyF", 
	factory: createTransportHub,
	inputs: [
		"-> broadcastMessage"
		],
	outputs: [
		"authenticateUser => authenticateUser @ SessionService (ScvG)",
		"messageReceived -> messageReceived @ MessageService (Ktuz)"
		]
	},
	//______________________________________________SESSIONSERVICE
	{
	name: "SessionService", 
	uid: "ScvG", 
	factory: createSessionService,
	inputs: [
		"=> authenticateUser"
		],
	outputs: [
		"loadHistory => loadHistory @ MessageStore (aEaG)"
		]
	},
	//______________________________________________MESSAGESERVICE
	{
	name: "MessageService", 
	uid: "Ktuz", 
	factory: createMessageService,
	inputs: [
		"-> messageReceived"
		],
	outputs: [
		"persistMessage => persistMessage @ MessageStore (aEaG)",
		"broadcastMessage -> broadcastMessage @ TransportHub (KyyF)"
		]
	},
	//________________________________________________MESSAGESTORE
	{
	name: "MessageStore", 
	uid: "aEaG", 
	factory: createMessageStore,
	inputs: [
		"=> loadHistory",
		"=> persistMessage"
		],
	outputs: []
	},
]

//The filters
const filterList = [
]

// prepare the runtime
const runtime = VMBLU.scaffold(nodeList, filterList)

// and start the app
runtime.start()
