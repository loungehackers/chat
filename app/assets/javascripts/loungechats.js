(function() {
	window.loungeChat = {};
	lc = window.loungeChat;
	lc.elem = {};
	lc.connectionTimer = "test";
	lc.registerHandlers = function(){
		lc = window.loungeChat;
		socket = lc.socket;
		socket.onopen = function(event) {
			lc.elem.$textarea.prop("disabled", false);
			var $elem = $("<p></p>").addClass("output_login").text("Connection with chat server established.");
			lc.elem.$output.append($elem);
			clearTimeout(lc.connectionTimer);
		};
		socket.onmessage = function(event) {
			if (event.data.length) {
				lc.handleMessage(event.data);
			}
		};
		socket.onclose = function(event) {
			lc.elem.$textarea.prop("disabled", true);
			var $elem = $("<p></p>").addClass("output_logout").text("Lost connection with server, retrying connection...");
			lc.elem.$output.append($elem);
			lc.connectionTimer = window.setTimeout(lc.connect, 5000);
		};
	};
	lc.connect = function() {
		lc = window.loungeChat;
		console.info("Connecting to websocket", lc.connectionTimer);
		lc.socket = new WebSocket("ws://" + window.location.host + "/chat");
		lc.registerHandlers();
		// lc.connectionTimer = window.setTimeout(lc.connect, 5000);
	};
	lc.commands = [];
	lc.commands["login"] = function(argument) {
		if(argument) {
			console.dir(argument);
			var divider = argument.indexOf(":");
			var newuser = argument.slice(0,divider);
			argument = argument.slice(divider+1,argument.length);
			lc.replaceUserList(argument);
			var $elem = $("<p></p>").addClass("output_login").html("- " + newuser +" just logged in");
			window.loungeChat.elem.$output.append($elem);

		}
	};

	lc.commands["logout"] = function(argument) {
		if(argument){
			console.log(argument);
			var divider = argument.indexOf(":");
			var olduser = argument.slice(0,divider);
			argument = argument.slice(divider+1,argument.length);
			replaceUserList(argument);
			var $elem = $("<p></p>").addClass("output_logout").html("- Bye bye " + olduser +"!");
			window.loungeChat.elem.$output.append($elem);
		}
	};

	lc.replaceUserList = function(argument) {
		/* TODO: Refactor me later, extract members into window.loungeChat */
		var $container = $("#userlist").clone().empty();
		var me = $container.data("me");
		var members = $.parseJSON(argument);
		var $mold = $("<li></li>");
		var $elem;
		for(var i=0; i < members.length; i++) {
			$elem = $mold.clone().text(members[i]);
			if(members[i] == me) $elem.addClass("user_me");
			$container.append($elem);
		}
		$("#userlist").replaceWith($container);
	};
	lc.formatMessage = function(message) {
		var me;
		me = $("#userlist").data("me");
		return me + ": " + message;
	};

	lc.handleMessage = function(message) {
		if(message !== undefined && message.length > 0) {
			console.log("message: ", message);
			var matches = message.match(/(\[LH:)(\w+)(\])/);
			if(matches !== undefined && matches !== null && matches.length > 0 && matches[1] == "[LH:") {
				var command = matches[2];
				var argument = message.slice(command.length+5,message.length);
				lc.commands[command](argument,window.loungeChat.elem.$output);
			} else {
				var me = $("#userlist").data("me");
				message = message.replace(me, "<span class=\"output_highlight\">"+me+"</span>");
				var $elem = $("<p></p>").addClass("output_message").html(message);
				window.loungeChat.elem.$output.append($elem);

			}
			var output = window.loungeChat.elem.$output[0];
			output.scrollTop = output.scrollHeight;
			
		}
	};


	//INITIALIZER, let me come last please.
	$(function() {
		lc.elem.$textarea = $("form.chat textarea");
		lc.elem.$output = $("#output");
		lc.connect();
		lc.registerHandlers();
		$("body").on("submit", "form.chat", function(event) {
			event.preventDefault();
			lc.elem.$textarea = $(this).find("textarea");
			lc.socket.send(lc.formatMessage(lc.elem.$textarea.val()));
			return lc.elem.$textarea.val(null);
		});
		lc.elem.$textarea.focus();
		return lc.elem.$textarea.on("keyup", function(event) {
			if (event.keyCode === 13 && !event.shiftKey && lc.elem.$textarea.val().length !== 0) {
				return $("form.chat").submit();
			}
		});
	});

}).call(this);
