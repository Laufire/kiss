﻿"use strict";

/*Define the variables
---------------------*/
var Server = mockServer

, people = O_O.list({

	idProp: 'name',

	data: [
		{
			name: 'A',
			age: 65,
			isMale: 0
		},
		{
			name: '$',
			age: 65,
			isMale: 1
		},
		{
			name: 'M',
			age: 77,
			isMale: 1
		},
		{
			name: 'Z',
			age: 90,
			isMale: 0
		}
	]
})

, rndBtwn = function(n1, n2)
{
	return n1 + (Math.floor(Math.random() * (n2 - n1 + 1)));
}

, random = {

	add: function()
	{
		var ret;

		while(people.items[ret = String.fromCharCode(rndBtwn(65, 90))]);

		return [{

			name: ret,

			age: rndBtwn(5, 90),

			isMale: rndBtwn(0, 1)
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
		
		return [];
	}
}

, selection = O_O.value()

, App = O_O.box(new function()
{
	var self = this;

	self.people = people;

	self.title = 'Collection - example';

	self.toolbar = {

		add: function()
		{
			self.people(random.add());
		},

		edit: {

			$: {

				prop:{

					disabled: O_O.plugin.trans.falsy(selection)
				},

				event: {

					click: function()
					{
						self.people(random.change());
					}
				}
			}
		},

		delete: {

			$: {

				prop:{

					disabled: O_O.plugin.trans.falsy(selection)
				},

				event: {

					click: function()
					{
						var selected = selection();
						
						if(selected)
							self.people([selected.$.id], 0);
					}
				}
			}
		}
	}

	self.collection = O_O.pod({

		source:  self.people,

		$: {

			event: {

				click: function(e)
				{
					selection('');
				}
			}
		},

		item: function(){

			var sayName = function(e, box)
			{
				alert('My name is: ' + box.$.html());
			};
			
			this.$ = {

				event: {

					click: function(e, item)
					{
						selection(item);
						e.stopPropagation();
					},

					'click .close': function(e, item)
					{
						App.people.remove(item.$.id);
						e.stopPropagation();
					}
				}
			}

			this.isMale = O_O.value();

			this.name = {

				$: {

					class: {

						male: this.isMale
					},

					event: {

						click: sayName
					}
				}
			}

			this.age = {}
		}
	});
});

/*Initial setup
--------------*/

Server.add(routes); //setting up mockServer

//Managing selection
O_O.listen(selection, function(val, source)
{
	var prev = source();

	if(prev)
		prev.$.class('selected', 0);

	if(val)
		val.$.class('selected', 1);
});

//Responding to collection events
O_O.listen(App.collection.event, function(e, item)
{
	if(e.type == 'add')
		item.$.el.scrollIntoView();

	else if(e.type == 'remove')
	{
		if(item === selection())
			selection('');
	}
});

/*Finally load the App
--------------------*/
O_O.ready(function()
{
	App.$.at('App');	
});