"use strict";

var Server = mockServer;

Server.add(routes); //setting up mockServer

var values = [],

autocomplete,

App = O_O.box(new function()
{
	var self = this;

	self.autocomplete = autocomplete = O_O.plugin.autocomplete(function(e)
	{
		if(e.keyCode == 13)
			alert(autocomplete.$.val());
	});
	
	self.possibleValues = {}
	
	self.live = O_O.plugin.autocomplete(function(e)
	{
		if(e.keyCode == 13)
			alert(App.live.$.val());
			
	}, requestFunction);
	
});

O_O.ready(function()
{
	App.$.at('App');
	
	Server.request({

		url: 'all',
		
		success: function(response)
		{
			values = JSON.parse(response);
			
			autocomplete.values(values);
			App.possibleValues.$.text(values.sort().join(', '));
		}
	});
});

function requestFunction(str, callback)
{
	Server.request({

		url: 'filter',
		
		data: str,
		
		success: function(response)
		{
			values = JSON.parse(response);
			
			callback(values);
		}
	});
}