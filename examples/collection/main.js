"use strict";

var Server = mockServer;

Server.add(routes); //setting up mockServer

var App = O_O.element(new function()
{
	var self = this;

	self.people = O_O.list({

		idProp: 'name1',
		
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

		source:  self.people,
		
		item: {
		
			event: {
			
				click: function()
				{
					console.log(App.people.items[this.id]);
					console.log(App.collection[this.id]());
				}
			}
		}
	});
});

O_O.ready(function()
{
	App('el', 'App');
});