/**
 * The MessageRouter handles the websocket connection and upstream events from the server side.
 * It has a couple of externally accessible methods & properties:
 *
 * @property online; boolean wheter or not the chat is online. You can subscribe to changes on this with registerConnectionHandlers
 * @property me; integer userid, used to denote who the logged in user is in the userlist et.c.
 * @method sendMessage(message); expects a correctly formatted JSON message that it will send up the websocket.
 * @method registerMessageHandler;
 * @method registerConnectionStateHandler;
 * @method unregisterMessageHandler;
 * @method removeArrayElementsByValue;
 */

window.lcApp.services.MessageRouter = function () {
	// We return this object to anything injecting our service,
	// here we store public properties and methods.
	console.log("initializing MessageRouter");
    var Service = {
		// Connectionstatus.
		online: false
    };

    // Here we store privately scoped properties and methods.
    var options = {
		// Our socket once we have connected.
		socket: null,
		// Reconnection timeout, used to throttle reconnection attempts
		timeout: 2000,
		// A list of callback handlers for incoming messages.
		messageHandlers: [],
		// A list of callback handlers for online state changes.
		connectionStateHandlers: [],
		// A timer handle for setTimeout to try and reconnect to the webserver
		connectionTimeout: null,
		// Method to figure out web socket URL.
		getWebSocketURI: function() {
			// Get current url to know where to find the listening web socket.
			var loc = window.location;
			// Variable to store the tweaked uri from http(s)? to ws(s)?
			var ws_uri;

			// Determine the type of websocket connection, SSL or not.
			if (loc.protocol === "https:") {
				ws_uri = "wss://";
			} else {
				ws_uri = "ws://";
			}

			// Append path, this probably shouldn't be hardcoded in the JS, but whatever.
			ws_uri += loc.host + "/chat";
			return ws_uri;
		},
		// Store the last socket onopen/onclose WebSocket event for use in registering callbacks late.
		onSocketStateChangeEvent: null
    };

    function openConnection() {
		// Open up the connection.
		console.info("trying to connect");
		if(navigator.onLine) {
			options.socket = new WebSocket(options.getWebSocketURI());

			// Bind handler for when socket setup succeeded.
			options.socket.onopen = function(event) {
				clearTimeout(options.connectionTimeout);
				if(Service.online !== true) {
					Service.online = true;
					options.onSocketStateChangeEvent = event;
					console.info("Socket has been opened!");
					for (var i = 0; i < options.messageHandlers.length; i++) {
						options.connectionStateHandlers[i].call(Service, Service.online, event);
					}
				}
			};

			// Received message on socket.
			options.socket.onmessage = function(event) {
				// Our received JSON string will be parsed into an
				// JSON object and be put in this variable.
				var data;

				// Safe parsing of JSON according to MDN.
				try {
					data = JSON.parse(event.data);
				} catch (e) {
					console.error("JSON Parsing error over socket:", e);
				}
				if(data !== undefined) {
					for (var i = 0; i < options.messageHandlers.length; i++) {
						options.messageHandlers[i].call(Service, data);
					}
				}
			};

			// socket was closed by browser. Probably lost connection with server.
			options.socket.onclose = function(event) {

				// When we loose connection let's try reconnecting.
				options.connectionTimeout = window.setTimeout(openConnection, options.timeout);
				if(Service.online !== false) {
					console.info("Socket has been closed");
					Service.online = false;
					options.onSocketStateChangeEvent = event;
					for (var i = 0; i < options.messageHandlers.length; i++) {
						options.connectionStateHandlers[i].call(Service, Service.online, event);
					}
				}
			};

		} else {
			// This is needed as we won't get a close event when 
			// the navigator is offline. Let's just retry now and then
			console.info("browser is offline, retrying in 5s.");
			options.connectionTimeout = setTimeout(openConnection, options.timeout);
		}
	}
	openConnection();

    // Handler registrations.
    Service.registerMessageHandler = function(handler) {
		options.messageHandlers.push(handler);
    };
    Service.registerConnectionStateHandler = function(handler) {
		options.connectionStateHandlers.push(handler);

		// Here we call the newly added callback if we're already online so
		// that if the callback registration is too late(as in, we're already
		// connected), we will fire anyway to let the callback know that we
		// are online properly.
		if(Service.online) {
			handler.call(Service, Service.online, options.onSocketStateChangeEvent);
		}
    };

    // Handler unregistrations.
    Service.unregisterMessageHandler = function(handler) {
		removeArrayElementsByValue(options.messageHandlers, handler);
    };
    Service.unregisterConnectionStateHandler = function(handler) {
		removeArrayElementsByValue(options.connectionStateHandlers, handler);
    };

    // Service methods.
    Service.sendMessage = function(message){
		options.socket.send(message);
    };
    return Service;
};