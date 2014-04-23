/**
 * The Room handles joining, leaving and user presentations in rooms.
 */

window.lcApp.services.Room = function (MessageRouter) {
	// We return this object to anything injecting our service,
	// here we store public properties and methods.
	console.log("initializing room");
	var Service = {
		// Room Objects — Details about all rooms.
		rooms: [],
		// User Objects — Details about all logged in people.
		users: [],
		// Member Object – Which users are in which rooms.
		members: []
	};

	// JoinHandlers - callback functions to be called both on join and leave.
	var joinHandlers = [];
	// RoomHandlers — callback functions to be called when rooms are created or destroyed.
	var roomHandlers = [];
	// MessageHandlers - callback functions to be called when message arrive in rooms.
	var messageHandlers = [];

	Service.registerRoomChangeHandler = function (handler) {
		roomHandlers.push(handler);
	};

	Service.registerUserChangeHandler = function (handler) {
		joinHandlers.push(handler);
	};

	Service.registerMessageHandler = function (handler) {
		messageHandlers.push(handler);
	};

	Service.unregisterRoomChangeHandler = function (handler) {
		removeArrayElementsByValue(roomHandlers, handler);
	};

	Service.unregisterUserChangeHandler = function (handler) {
		removeArrayElementsByValue(joinHandlers, handler);
	};

	Service.unregisterMessageHandler = function (handler) {
		removeArrayElementsByValue(messageHandlers, handler);
	};


	MessageRouter.registerMessageHandler(function(onlineBoolean, SocketEvent) {
		console.log("message recieved");
		console.dir(arguments);
	});
	MessageRouter.registerConnectionStateHandler(function(onlineBoolean, SocketEvent) {
		console.log("connection state changed");
		console.dir(arguments);
	});

	return Service;
};