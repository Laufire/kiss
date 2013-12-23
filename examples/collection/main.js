"use strict";

var Server = mockServer;

Server.add(routes); //setting up mockServer

var App = O_O.box(new function()
{
	var self = this;

	self.people = O_O.list({

		idProp: 'name',
		
		data: [
			{
				name: 'A',
				age: 65
			},
			{
				name: 'M',
				age: 77
			},
			{
				name: 'Z',
				age: 90
			}
		]
	});

	self.title = 'Collection - example';

	self.collection = O_O.pod({

		source:  self.people,
		
		item: {
		
			event: {
			
				click: function()
				{
					console.log(App.people.items[this.id]);
					App.collection.change({name: this.id, age: 66});
				}
			}
		}
	});
});

O_O.ready(function()
{
	App.$.el('App');
});