(function()
{
"use strict";

/*Define the variables
---------------------*/
var todos = O_O.list({

	idProp: 'id',
}),

filterState = O_O.value(2),
noTodos = O_O.value(1),
allChecked = O_O.value(0),
activeCount = O_O.value(0),
completedCount = O_O.value(0),

todoList,

todoApp = O_O.box(new function()
{
	this.newTodo = {$: { event: {

		keyup: function(e)
		{
			if(e.keyCode == 13)
			{
				todos.data({
					id: Date.now(),
					isDone: true,
					title: e.target.value
				});

				e.target.value = '';
			}
		}
	}}}

	this.toggleAll = {

		$: {

			event: {

				change: function(e)
				{
					//var start = Date.now();
					var i, checked = e.target.checked,
						items = todoList.items,
						keys = Object.keys(items);

					for(i = 0; i < keys.length; ++i)
						items[keys[i]].isDone(checked);
						
					//console.log(Date.now() - start);
				}
			},
			
			class: {
			
				hidden: noTodos
			},
			
			prop: {
			
				checked: allChecked
			}
		}
	}

	todoList = this.todoList = O_O.pod({

		source:  todos,
		
		item: function(itemData)
		{
			var self = this;
			
			this.isHidden = O_O.value(filterState() == 2 ? false : Boolean(filterState()) == itemData.completed); //<-here
			
			this.isDone = O_O.value(itemData.isDone);
			
			this.$ = {

				event: {

					'click .destroy': function(e, item)
					{
						item.$.event('click .destroy', function(){}); //remove the event listener so it isn't invoked during the fade out
						item.$.class('fadeOutUp', 1);
						
						setTimeout(function()
						{
							todos.remove(item.$.id);
						}, 400);
					}
				},

				class: {

					hidden: this.isHidden,

					completed: this.isDone
				},
				
				clean: function()
				{
					alterCounts(self.isDone(), -1);
				}
			}
			
			this.title = {$: {event: {

				dblclick: function(e, box)
				{
					var item =  box.$.parent,
						item$ = item.$,
						edit$ = item.edit.$;						
					
					item$.class('editing', 1);
					edit$.val(todos.items[item$.id].title);
					edit$.el.select();
				}
			}}}
			
			this.edit = {$: {event: {
			
				keyup: function(e, box)
				{
					if(e.keyCode == 13)
						changeTitle(e, box);
				},
				
				blur: changeTitle
			}}}
			
			this.completed = this.isDone;
			
			O_O.listen(this.isDone, function(val, source)
			{
				self.$.data({
				
					isDone: val
				});
			});
			
			function changeTitle(e, box)
			{
				var $ = box.$.parent.$;
				
				$.data({
				
					title: e.target.value
				});
				
				$.class('editing', 0);
			}
			
			//global changes
			noTodos(false);
			alterCounts(itemData.isDone, 1);
		}
	});
	
	this.footer = new function()
	{
		this.$ = { class: {
		
			hidden: noTodos
		
		}}
		
		this.todoCount = O_O.trans(function(val) //!inline-trans
		{
			if(val > 1)
				return val + ' items left';
				
			if(val == 1)
				return '1 item left';
			
			return 'No items left'
			
		})(activeCount)
		
		this.clearCompleted = {
		
			$: {
			
				class: {
				
					hidden: O_O.trans(function(val)
					{
						return val == 0;
						
					})(completedCount)
				},
				
				event: {
				
					click: function(e)
					{
						var i, id,
							items = todos.items,
							ids = Object.keys(items);
						
						for(i = 0; i < ids.length; ++i)
							id = ids[i], items[id].isDone && todos.remove(id);
					}
				}
			},
			
			count: completedCount
		}
	}
});

function alterCounts(isDone, change)
{
	if(isDone)
		completedCount(completedCount() + change);
	else
		activeCount(activeCount() + change);
		
	allChecked(activeCount() == 0);
}

/*Initial setup
--------------*/
O_O.state.routes = new function(){

	var states = ['active', 'completed']
	
	this['*'] = function(hash)
	{
		filterState(1 - states.indexOf(hash));
	}
}

O_O.listen(O_O.state.change, function()
{
	//var start = Date.now();
	
	var i = 0, item,
		keys = Object.keys(todos.items),
		state = filterState();
	
	DOM.$('#filters a.selected').class('selected', 0);
	DOM.$('#filters li:nth-of-type(' + (3 - state) + ') a').class('selected', 1);
	
	for(; i < keys.length; ++i)
	{
		item = todoList.items[keys[i]];
		item.isHidden(state == 2 ? false : state == item.isDone());
	}
	
	//console.log(Date.now() - start);
});

O_O.listen(todos.event, function(e, list)
{
	if(e.type == 'change')
	{
		var item = todoList.items[e.id],
			state = filterState(),
			completed, change;
		
		change = e.changes.isDone;
		
		if(change === undefined)
			return;
		
		item.isHidden(state == 2 ? false : state == change);
		
		completed = change ? 1 : -1;
		
		completedCount(completedCount() + completed);
		activeCount(activeCount() + completed * -1);
	}
});

/*Finally load the todoApp
------------------------*/
O_O.ready(function()
{
	var start = Date.now();
	
	var data = [];
	
	for(var i = 0; i < 8; ++i)
		data.push({
		
			id: i,
			isDone: Boolean(i%2),
			title: i
			
		});
		
	todos.data(data);
	
	todoApp.$.at('todoApp'); //always set the root element after all the intializations have been done
	console.log(Date.now() - start);
	
	todoApp.$.class('hidden', 0);
	DOM.$('#info p').class('hidden', 0);
});
})()