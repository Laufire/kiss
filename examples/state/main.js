"use strict";

var App = O_O.box(new function() {

	var self = this;

	self.title = 'State handling';
	
	self.state = {};
});

O_O.listen(O_O.state.change, function(hash) {

	App.$.set({state: hash});
});

O_O.at('App', App);

/* ! Older Syntax

O_O.ready(function() {

	App.$.at('App');
});
*/