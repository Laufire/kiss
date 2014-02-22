"use strict";

/*Define the variables
---------------------*/
var people = O_O.list()

, rndBtwn = function(n1, n2) {

	return n1 + (Math.floor(Math.random() * (n2 - n1 + 1)));
}

, random = {

	add: function() {
		
		var ret;

		while(people.items[ret = String.fromCharCode(rndBtwn(65, 90))]);
		
		return {
		
			_id: ret,
			
			name: String.fromCharCode(rndBtwn(65, 90)),

			age: rndBtwn(5, 90),

			isMale: rndBtwn(0, 1)
		}
	},

	change: function() {
	
		return {
			
			age: rndBtwn(5, 90),

			isMale: rndBtwn(0, 1)
		}
	}
}

, selection = O_O.value()
, genderFilter = O_O.value(2)

, genderTrans = O_O.trans(function(val, source, data) { //this hides the filtered gender when genderfilter changes. Note: this doen't hide the elements when their data changes; for that to hapen use .watch(genderFilter, this.isMale) on the iten, and set the results to a this.isVisible which determines the visibility
	
	var val = parseInt(val, 10);
	
	return !(val == 2 || val == data.isMale);
})

, App = O_O.box(new function() {

	var App = this;

	App.people = people;

	App.title = 'Collection - example';

	App.toolbar = {

		add: function() {
		
			App.people.add(random.add());
		},

		edit: {

			$: {

				prop:{

					disabled: O_O.plugin.trans.falsy(selection)
				},

				event: {

					click: function() {
					
						var selected = selection();
						
						if(selected)
							App.people.change(selected.$.id, random.change());
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

					click: function() {
					
						var selected = selection();
						
						if(selected)
							App.people.remove(selected.$.id);
					}
				}
			}
		},
		
		gender: genderFilter
	}

	App.peoplePod = O_O.pod({

		source:  App.people,

		$: {

			event: {

				click: function(e) {
				
					selection('');
				}
			}
		},

		item: function(itemData) {

			var sayName = function(e, box) {
			
				alert('My name is: ' + box.$.html());
			};
			
			this.$ = {

				event: {

					click: function(e, item) {
					
						selection(item);
						e.stopPropagation();
					},

					'click .close': function(e, item) {
					
						App.people.remove(item.$.id);
						e.stopPropagation();
					}
				},
				
				class: {
				
					hidden: genderTrans(genderFilter, itemData)
				}
			}

			this.isMale = O_O.value(itemData.isMale);

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

//Managing selection
O_O.listen(selection, function(val, source) {

	var prev = source.prev;
	
	if(prev)
		prev.$.class('selected', 0);

	if(val)
		val.$.class('selected', 1);
});

//Responding to collection events
O_O.listen(App.peoplePod.event, function(e) {

	var item = e.item;
	
	if(e.type == 'add')
		item.$.el.scrollIntoView();

	else if(e.type == 'remove')
		selection('');
});

O_O.listen(App.toolbar.gender, function(val) {

	//App.toolbar.gender could be listened until the box is loaded as a child (then this property will be replaced by a box; when a lasting connection is needed use an independent variable like 'genderFilter'
	console.log(val);
});

/*Finally load the App
--------------------*/
O_O.ready(function() {

	App.$.at('App');
	
	people.add({
		_id: 1,
		name: 'A',
		age: 65,
		isMale: 0
	});
	
	people.add({
		_id: 2,
		name: '$',
		age: 65,
		isMale: 1
	});
	
	people.add({
		_id: 3,
		name: 'M',
		age: 77,
		isMale: 1
	});
	
	people.add({
		_id: 4,
		name: 'Z',
		age: 90,
		isMale: 0
	});
});