// ------------------------------------------------------------------
// Model: ChatClientApp
// Path: chat-client-app.js
// Creation date 10/28/2025, 11:02:12 AM
// ------------------------------------------------------------------

// import the runtime code
import * as VMBLU from "@vizualmodel/vmblu-runtime"


//Imports
import { createSessionController } from './nodes/session-controller.js'
import { createServerConnection } from './nodes/server-connection.js'
import { createLoginView } from './nodes/login-view.js'
import { createMessageComposer } from './nodes/message-composer.js'
import { createMessageStore } from './nodes/message-store.js'
import { createMessageTimeline } from './nodes/message-timeline.js'

//The runtime nodes
const nodeList = [
	//___________________________________________SESSIONCONTROLLER
	{
	name: "SessionController", 
	uid: "bLhv", 
	factory: createSessionController,
	inputs: [
		"-> loginSubmitted",
		"-> logoutRequested",
		"-> messageComposed",
		"-> incomingBroadcast",
		"-> connectionError"
		],
	outputs: [
		"loginRejected -> loginRejected @ LoginView (kISj)",
		`sessionEstablished -> [ 
			"sessionEstablished @ MessageTimeline (FqfF)",
			"sessionEstablished @ MessageComposer (AtcN)",
			"sessionEstablished @ LoginView (kISj)" ]`,
		`sessionEnded -> [ 
			"sessionEnded @ MessageTimeline (FqfF)",
			"sessionEnded @ LoginView (kISj)",
			"sessionEnded @ MessageComposer (AtcN)" ]`,
		"messageDispatchFailed -> messageDispatchFailed @ MessageComposer (AtcN)",
		"historyLoaded -> historyLoaded @ MessageStore (qXtY)",
		"messageAppended -> messageAppended @ MessageStore (qXtY)",
		"authenticateUser => authenticateUser @ ServerConnection (Xunl)",
		"sendChatMessage => sendChatMessage @ ServerConnection (Xunl)",
		"endSession => endSession @ ServerConnection (Xunl)"
		]
	},
	//____________________________________________SERVERCONNECTION
	{
	name: "ServerConnection", 
	uid: "Xunl", 
	factory: createServerConnection,
	inputs: [
		"=> authenticateUser",
		"=> sendChatMessage",
		"=> endSession"
		],
	outputs: [
		"incomingBroadcast -> incomingBroadcast @ SessionController (bLhv)",
		"connectionError -> connectionError @ SessionController (bLhv)"
		],
	
	},
	//___________________________________________________LOGINVIEW
	{
	name: "LoginView", 
	uid: "kISj", 
	factory: createLoginView,
	inputs: [
		"-> sessionEstablished",
		"-> sessionEnded",
		"-> loginRejected"
		],
	outputs: [
		"loginSubmitted -> loginSubmitted @ SessionController (bLhv)"
		],
	sx: {
		target: "#modal-root"
	}
	},
	//_____________________________________________MESSAGECOMPOSER
	{
	name: "MessageComposer", 
	uid: "AtcN", 
	factory: createMessageComposer,
	inputs: [
		"-> sessionEstablished",
		"-> sessionEnded",
		"-> messageDispatchFailed"
		],
	outputs: [
		"messageComposed -> messageComposed @ SessionController (bLhv)"
		],
	sx: {
		target: "#chat-composer"
	}
	},
	//________________________________________________MESSAGESTORE
	{
	name: "MessageStore", 
	uid: "qXtY", 
	factory: createMessageStore,
	inputs: [
		"-> historyLoaded",
		"-> messageAppended"
		],
	outputs: [
		"messagesUpdated -> messagesUpdated @ MessageTimeline (FqfF)"
		]
	},
	//_____________________________________________MESSAGETIMELINE
	{
	name: "MessageTimeline", 
	uid: "FqfF", 
	factory: createMessageTimeline,
	inputs: [
		"-> sessionEstablished",
		"-> sessionEnded",
		"-> messagesUpdated"
		],
	outputs: [
		"logoutRequested -> logoutRequested @ SessionController (bLhv)"
		],
	sx: {
		target: "#chat-history"
	}
	},
]

//The filters
const filterList = [
]

// prepare the runtime
const runtime = VMBLU.scaffold(nodeList, filterList)

// and start the app
runtime.start()

