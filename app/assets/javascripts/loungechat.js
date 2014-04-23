(function(angular, lcApp){
	'use strict';
	if(!angular){
		console.error("No angular loaded, cannot init!");
		return;
	}
	
	// 'cache' some vars for shorter and more readable code.;
	var app = retrieveRawStuff('app', lcApp);
	var services = retrieveRawStuff('services', lcApp);
	var filters = retrieveRawStuff('filters', lcApp);
	var directives = retrieveRawStuff('directives', lcApp);
	var controllers = retrieveRawStuff('controllers', lcApp);


	app = angular.module('LoungeChat', []);
	app.service('messageRouter', [lcApp.services.MessageRouter]);
	app.service('room', ['messageRouter' ,lcApp.services.Room]);
	app.controller('messageCtrl', ['$scope', 'room', lcApp.controllers.MessageCtrl]);

	function retrieveRawStuff(what, from) {
		var stuff = from[what];
		if(stuff === undefined || stuff === {} ) {
			console.info("No " + what + " defined.");
		}
		return stuff;
	}
}(window.angular, window.lcApp));