"use strict";

var Server = mockServer;

Server.add(routes); //setting up mockServer

var App = O_O.element(new function()
{
	var self = this;

	self.list = O_O.list({

		id: 'name1',
		
		data: [
			{
				name1: 'A',
				age: 65
			},
			{
				name1: 'M',
				age: 77
			},
			{
				name1: 'Z',
				age: 90
			}
		]
	});

	self.title = 'Collection - example';

	self.collection = O_O.repeat({

		list:  self.list,
		
		item: {
		
			event: {
			
				click: function()
				{
					alert(this.innerHTML);
				}
			}
		}
	});
});

O_O.ready(function()
{
	App('el', 'App');
});