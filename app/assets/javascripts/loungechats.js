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
	commands["newlogin"] = function(argument,$output) {
		if(argument){ 
			var divider = argument.indexOf(":");
			argument = argument.slice(divider+1,argument.length);
			var newuser = argument.slice(2,divider+2);
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
			$output.append("-   " + newuser +" just logged in");
		}
	}
	formatMessage = function(message) {
		var me;
		me = $("#userlist").data("me");
		return me + ": " + message;
	};

	handleMessage = function(message) {
		if(message && message.length > 0) {
			var $output = $("#output");
			console.log("message: ", message);
			var matches = message.match(/(\[LH:)(\w+)(\])/);
			if(matches.length > 0 && matches[1] == "[LH:") {
				var command = matches[2];
				var argument = message.slice(command.length+5,message.length);
				commands[command](argument,$output);
			} else {
				$output.append("" + event.data + "<br>");

			}
			var output = $output[0];
			return output.scrollTop = output.scrollHeight;
			
		}
	}


}).call(this);
