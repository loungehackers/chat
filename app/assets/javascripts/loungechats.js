window.loungeChat = {};

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

(function() {
	lc = window.loungeChat;
	lc.connectionTimer = "test";
	lc.registerHandlers = function(){
		lc = window.loungeChat;
		socket = lc.socket;
		socket.onopen = function(event) {
			if(loungeChat.chat !== undefined) {
				loungeChat.chat.isOnline(true);
				loungeChat.chat.addMessage(null, "Connection with chat server established.", "login");
			}
			clearTimeout(lc.connectionTimer);
		};
		socket.onmessage = function(event) {
			if (event.data.length) {
				lc.handleMessage(event.data);
			}
		};
		socket.onclose = function(event) {
			if(loungeChat.chat)
				loungeChat.chat.isOnline(false);
			loungeChat.chat.addMessage(null, "Lost connection with server, retrying connection...", "logout");
			lc.connectionTimer = window.setTimeout(lc.connect, 5000);
		};
	};
	lc.connect = function() {
		lc = window.loungeChat;
		var loc = window.location, ws_uri;
		if (loc.protocol === "https:") {
			ws_uri = "wss://";
		} else {
			ws_uri = "ws://";
		}
		ws_uri += loc.host + "/chat";

		lc.socket = new WebSocket(ws_uri);
		lc.registerHandlers();
	};

	lc.linkExtractorRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

	lc.commands = [];
	lc.commands["login"] = function(argument) {
		if(argument) {
			var dividerPosition = argument.indexOf(":");
			var newuserName = argument.slice(0,dividerPosition);
			var theOtherUsers = $.parseJSON(argument.slice(dividerPosition+1,argument.length));
			if(loungeChat.chat) {
				loungeChat.chat.addUserByName(newuserName, theOtherUsers);
			}
		}
	};

	lc.commands["logout"] = function(argument) {
		if(argument) {
			var dividerPosition = argument.indexOf(":");
			var olduserName = argument.slice(0,dividerPosition);
			var theOtherUsers = $.parseJSON(argument.slice(dividerPosition+1,argument.length));
			if(loungeChat.chat)
				loungeChat.chat.removeUserByName(olduserName, theOtherUsers);
		}
	};

	lc.commands["history"] = function(argument) {
		if(argument) {
			if(loungeChat.chat)
				argument = argument.replace(lc.linkExtractorRegexp, "<a href='$1' target=\"_blank\">$1</a>");
				loungeChat.chat.addMessage("", argument, "history");
		}
	};

	lc.postMessage = function(message) {
		window.loungeChat.socket.send(message);
	};

	lc.handleMessage = function(message) {
		if(message !== undefined && message.length > 0) {
			var matches = message.match(/(\[LH:)(\w+)(\])/);
			if(matches !== undefined && matches !== null && matches.length > 0 && matches[1] == "[LH:") {
				var command = matches[2];
				var argument = message.slice(command.length+5,message.length);
				lc.commands[command](argument);
			} else {
				var me = $("#userlist").data("me");
				if(loungeChat.chat) {
					message = message.replace(lc.linkExtractorRegexp, "<a href='$1' target=\"_blank\">$1</a>");
					loungeChat.chat.addMessage(me, message, "message");
				}
			}
			
		}
	};


	//INITIALIZER, let me come last please.
	$(function() {
		lc.connect();
		lc.registerHandlers();
	});

}).call(this);

function userViewModel(name) {
	var self = this;
	self.name = ko.observable(name);
	self.userStyle = ko.observable();
}

function messageViewModel(sender, message, type) {
	var self = this;
	self.sender = ko.observable(sender);
	self.message = ko.observable(message);
	self.type = ko.observable("output_"+type);  //logout, login, message 
	
}

function chatViewModel() {
	var self = this;
	self.messages = ko.observableArray();
	self.users = ko.observableArray();
	self.currentMessage = ko.observable();
	self.currentMessageHasFocus = ko.observable(true);
	self.isOnline = ko.observable(false);
	self.settingsDialogHidden = ko.observable(true);
	self.setting_flashTitle = ko.observable(true, {persist: 'setting_flashTitle'});
	self.setting_audio_notif = ko.observable(true, {persist: 'setting_audio_notif'});
	self.sortedUsers = ko.dependentObservable(function() {
		return this.users.slice().sort(this.sortUsersFunction);
	}, self);
	self.matchingUserNames = ko.observableArray();
	self.lastMatchingWord = ko.observable("");
	self.lastMatchingUsername = ko.observable("");
	self.lastSuggestedIndex = ko.observable(0);



	self.sortUsersFunction = function(a, b) {
        return a.name().toLowerCase() > b.name().toLowerCase() ? 1 : -1;
	};
	self.close_chat = function() {
		/*
		* The readonly attribute readyState represents the state of 
		* the connection. It can have the following values:
		*
		* 0 indicates that the connection has not yet been established.
		* 1 indicates that the connection is established and communication is possible.
		* 2 indicates that the connection is going through the closing handshake.
		* 3 indicates that the connection has been closed or could not be opened.
		*
		* We only close in case of readystate == 1.
		*/
		if(loungeChat.socket.readyState == 1)
			loungeChat.socket.close();
	};

	self.getMatchingUsernames = function(matchingWord) {
		var names = [];
		var pattern = new RegExp("^"+matchingWord);
		var users = self.users();
		for (var i = users.length - 1; i >= 0; i--) {
			if(pattern.test(users[i].name().toLowerCase())){
				names.push(users[i].name());
			}
		}
		return names;
	};

	/**
	* A function that works with tab completion for user names
	* @param  Integer	wordStart	where the closest word starts(separated by space)
	* @param  Integer	wordEnd		current position of the caret(we pretend the word end here)
	* @return void
	*/
	self.tabCompletion = function(message, wordStart, wordEnd) {
		var matchingWord = message.currentMessage().substring(wordStart, wordEnd).toLowerCase();
		var matchingUsernames = self.getMatchingUsernames(matchingWord);
		var length = wordEnd - wordStart;
		var oldLength = self.lastMatchingUsername().length - self.lastMatchingWord().length;
		var m = message.currentMessage();
		if(self.lastMatchingUsername() !== "") {
			message.currentMessage(m.substring(0, wordStart+length) + m.substring(wordEnd+oldLength));
		}
		if(matchingWord != self.lastMatchingWord()) {
			// First match or new match
			if(self.lastMatchingWord() !== "") {
				matchingUsernames = [];
			}
			self.lastMatchingWord("");
			self.lastMatchingUsername("");
			self.lastSuggestedIndex(0);
		}
		if(matchingUsernames.length > 0) {
			message.currentMessage(message.currentMessage().insert(wordEnd, matchingUsernames[self.lastSuggestedIndex()].substring(length)));
			self.lastMatchingUsername(matchingUsernames[self.lastSuggestedIndex()]);
		} else {
			self.lastMatchingUsername("");
		}
		self.lastMatchingWord(matchingWord);
		if(self.lastSuggestedIndex() == (matchingUsernames.length - 1)) {
			self.lastSuggestedIndex(0);
		} else {
			self.lastSuggestedIndex(self.lastSuggestedIndex()+1);
		}
	};
	self.postMessage = function(message) {
		loungeChat.postMessage(self.currentMessage());
		self.currentMessage("");
		
	};
	self.addMessage = function(sender, message, type) {
		var date = new Date();
		var timestamp = "[" + date.toLocaleTimeString() + "] ";
		message = timestamp + message;
		self.messages.push(new messageViewModel(sender, message, type));
		if(type == "message") {
			if(self.setting_flashTitle()) self.flashTitle();
			if(self.setting_audio_notif()) self.audio_notif();
		}
	};
	self.getUserByName = function(username) {
		return ko.utils.arrayFirst(self.users(), function (user) {
			return user.name() === username ? user : null;
        });
	};
	self.addUserByName = function(name, serverUsers) {
		if(!self.getUserByName(name)) {
			self.users.push(new userViewModel(name));
			self.addMessage("", "- " + name + " just logged in", "login");
		}
		self.syncUserByNames(serverUsers);
	};

	self.syncUserByNames = function(serverUsers) {
		if(serverUsers instanceof String){
			serverUsers = [serverUsers];
		}
		for (var i = 0; i < serverUsers.length; i++) {
			if(!self.getUserByName(serverUsers[i])){
				self.users.push(new userViewModel(serverUsers[i]));
			}
		}
    };
	self.removeUserByName = function(name, serverUsers) {
		var userToRemove = self.getUserByName(name);
		if (userToRemove) {
			self.users.remove(userToRemove);
			self.addMessage("","- Bye bye " + userToRemove.name() +"!", "logout");
		}
		self.syncUserByNames(serverUsers);

	};
	self.scrollBottom = function(element, index, data) {
		if (element.nodeType === 1) {
			element = element.parentNode;
			element.scrollTop = element.scrollHeight;
		}
	};
	self.toggleSettingsDialog = function () {
		self.settingsDialogHidden(!self.settingsDialogHidden());
	};
	self.audio_notif = function () {
		if(self.audioplaying !== true && self.audio !== undefined) {
			self.audioplaying = true;
			self.audio.play();
		}
	};
	self.flashTitle = function () {
		var oldTitle = document.title;
		var msg = "New!";
		var blink = function() { document.title = document.title == msg ? ' ' : msg; };
		if(document.timeoutId === null || document.timeoutId === undefined)
			document.timeoutId = setInterval(blink, 1000);

		var clear = function() {
			clearInterval(document.timeoutId);
			document.title = oldTitle;
			window.onfocus = null;
			window.onmousemove = null;
			document.timeoutId = null;
		};
		window.onfocus = clear;
		window.onmousemove = clear;
	};
	self.initAudio = function() {
		if(self.audio === undefined || self.audio === null) {
			self.audio = document.getElementById("audio_notif_sound");
			self.audioplaying = false;

			self.audio.addEventListener('ended', function() {
				self.audioplaying = false;
				self.audio.load();
			});
		}
	};
	self.initAudio();
}
$(document).ready(function() {
	loungeChat.chat = new chatViewModel();

	ko.bindingHandlers.returnKey = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			ko.utils.registerEventHandler(element, 'keydown', function(evt) {
				var ENTERKEY = 13;
				if (evt.keyCode === ENTERKEY && !evt.shiftKey && $(evt.target).val().length !== 0) {
					// 
					evt.preventDefault();
					evt.target.blur();
					valueAccessor().call(viewModel, bindingContext.$data);
					evt.target.focus();
				}
			});
		}
	};
	ko.bindingHandlers.tabKey = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			ko.utils.registerEventHandler(element, 'keydown', function(evt) {
				var TABKEY = 9;
				if(evt.keyCode === TABKEY && !evt.shiftKey && $(evt.target).val().length !== 0) {
					// Try to tab-complete the username.
					//  sadklkjlads ljkadslk jads kS S
					
					var wordEnd = evt.target.selectionStart;
					var wordStart = $(this).val().lastIndexOf(" ", wordEnd-1) + 1;
					if(wordStart < 0 ) {
						return;
					}
					evt.preventDefault();
					evt.target.blur();
					valueAccessor().call(viewModel, bindingContext.$data, wordStart, wordEnd);
					evt.target.focus();
				}
			});
		}
	};
	ko.applyBindings(loungeChat.chat);
});
