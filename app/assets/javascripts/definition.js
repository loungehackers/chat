// Init a app container objects so that we don't litter the global scope.
window.lcApp = window.lcApp || {
	// Angular App Object.
	app: {},
	// Angular Services before dependency injection.
	services: {},
	// Angular Filters before dependency injection.
	filters: {},
	// Angular Directives before dependency injection.
	directives: {},
	// Angular Controllers before dependency injection.
	controllers: {}
};