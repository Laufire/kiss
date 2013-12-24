"use strict";

var Server = mockServer, selection;

Server.add(routes); //setting up mockServer

var people = O_O.list({

	idProp: 'name',
	
	data: [
		{
			name: 'A',
			age: 65
		},
		{
			name: '$',
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

function rndBtwn(n1, n2)
{
	return n1 + (Math.floor(Math.random() * (n2 - n1 + 1)));
}

var random = {

	add: function()
	{
		var ret;
		
		while(people.items[ret = String.fromCharCode(rndBtwn(65, 90))]);
		
		return [{
		
			name: ret,
			
			age: rndBtwn(5, 90)
		}]
	},
	
	change: function()
	{
		var keys = Object.keys(people.items);
		
		var index = rndBtwn(0, keys.length - 1);
		
		if(index > -1)
			return [{
				
				name: keys[index],
				
				age: rndBtwn(5, 90)
			}]
		else
			return []; //<-here
	},
	
	remove: function()
	{
		var keys = Object.keys(people.items);
		
		if(!keys.length)
			return [];
		
		var index = rndBtwn(0, keys.length - 1);
		
		return [{
			
			name: keys[index]
		}];
	}
}
	
var App = O_O.box(new function()
{
	var self = this;

	self.people = people;

	self.title = 'Collection - example';
	
	self.toolbar = {
	
		add: function()
		{
			self.people(random.add());
		},
		
		change: function()
		{
			self.people(random.change());
		},
		
		remove: function()
		{
			self.people(random.remove(), 0);
		}
	}		
		
	self.collection = O_O.pod({

		source:  self.people,
		
		item: {
		
			$: {
			
				event: {
				
					'click .close': function(e, item)
					{
						console.log(item.$.id);
						//console.log(App.collection.items[item.$.id]);
						//App.people([App.people[item.$.id]], 0);
					}
				}
			}
		}
	});
});

O_O.ready(function()
{
	App.$.at('App');
	
	O_O.listen(App.collection.event, function(e, item)
	{
		console.log(item.$.id);
		
		if(e.type == 'add')
			item.$.el.scrollIntoView();
	});
});