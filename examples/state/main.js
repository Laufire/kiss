"use strict";

var App = O_O.box(new function()
{
	var self = this;

	self.title = 'State handling';
	
	self.state = O_O.state;
});

/*
O_O.state.add('/completed', function(hash)
{
	console.log(hash);
})
*/

O_O.ready(function()
{
	App.$.at('App');
});