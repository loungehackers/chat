(function() {
	var formatMessage;

	$(function() {
		var socket;
		socket = new WebSocket("ws://" + window.location.host + "/chat");
		socket.onmessage = function(event) {
			var $output, output;
			if (event.data.length) {
				handleMessage(event.data);
			}
		};
		$("body").on("submit", "form.chat", function(event) {
			var $textarea;
			event.preventDefault();
			$textarea = $(this).find("textarea");
			socket.send(formatMessage($textarea.val()));
			return $textarea.val(null);
		});
		$("form.chat textarea").focus;
		return $("form.chat textarea").on("keyup", function(event) {
			if (event.keyCode === 13 && !event.shiftKey) {
				return $("form.chat").submit();
			}
		});
	});
	commands = [];
	commands["newlogin"] = function(argument) {
		console.log("newlogin: ", argument);
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
	}
	formatMessage = function(message) {
		var me;
		me = $("#me").text();
		return "&lt;" + me + "&gt; " + message;
	};

	handleMessage = function(message) {
		if(message && message.length > 0) {
			console.log("message: ", message);
			matches = message.match(/(\[LH:)(\w+)(\])/);
			if(matches.length > 0 && matches[1] == "[LH:") {
				command = matches[2];
				argument = message.slice(command.length+5,message.length);
				commands[command](argument);
			} else {
				console.log("no matches :(");
			}
			$output = $("#output");
			$output.append("" + event.data + "<br>");
			output = $output[0];
			return output.scrollTop = output.scrollHeight;
		}
	}


}).call(this);
