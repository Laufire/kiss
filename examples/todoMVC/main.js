"use strict";

/*Define the variables
---------------------*/
var todos = O_O.list({

	idProp: 'id',
}),

noTodos = O_O.value(0),
allChecked = O_O.value(0),
activeCount = O_O.value(0),
completedCount = O_O.value(0),
filterState = O_O.value(2),

todoCount, todoList,

todoApp = O_O.box(new function()
{
	this.newTodo = {

		$: {

			event: {

				keyup: function(e)
				{
					if(e.keyCode == 13)
					{
						todos.data({
							id: Date.now(),
							completed: false,
							title: e.target.value
						});

						e.target.value = '';
					}
				}
			}
		}
	}

	this.toggleAll = {

		$: {

			event: {

				change: function(e)
				{
					var i, key, 
						checked = e.target.checked,
						keys = Object.keys(todoList.items),
						data = [];

					for(i = 0; i < keys.length; ++i)
					{
						key = keys[i];
						
						if(!checked == todos.items[key].completed)
							data.push({
							
								id: key,
								completed: checked
							})
					}
					
					todos.data(data);
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

			function changeTitle(e, box)
			{
				var item = box.$.parent;
				
				todos.data({
				
					id: item.$.id,
					title: e.target.value
				});
				
				item.$.class('editing', 0);
			}
			
			this.isHidden = O_O.value(filterState() == 2 ? false : Boolean(filterState()) == itemData.completed); //<-here
			
			this.isComplete = O_O.value(itemData.completed);
			
			this.$ = {

				event: {

					'click .destroy': function(e, item)
					{
						todos.remove(item.$.id);
					}
				},

				class: {

					hidden: this.isHidden,

					completed: this.isComplete
				}
			}
			
			this.title = {$: {event: {

				dblclick: function(e, box)
				{
					var item = box.$.parent,
						edit = item.edit;
					
					item.$.class('editing', 1);
					edit.$.val(todos.items[item.$.id].title);
					edit.$.el.select();
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

			this.completed = {$: {
			
				event: {
			
					change: function(e, box)
					{
						var item = box.$.parent,
							checked = e.target.checked;
						
						todos.data({
						
							id: item.$.id,
							completed: checked
						});						
					}
				}
			}}
		}
	});
	
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
						id = ids[i], items[id].completed && todos.remove(id);
				}
			}
		},
		
		count: completedCount
	}		
});

/*Initial setup
--------------*/
O_O.listen(O_O.state, function(state)
{
	var now;
	
	if(state == '/active')
		now = 1
	
	else if(state == '/completed')
		now = 0;
		
	else
		now = 2;
	
	filterState(now);
});

O_O.listen(filterState, function(val)
{
	DOM.$('#filters li:nth-of-type(' + (3 - val) + ') a').class('selected', 1);
	DOM.$('#filters li:nth-of-type(' + (3 - filterState.prev) + ') a').class('selected', 0);
	
	var i, item, keys = Object.keys(todos.items);
	
	for(i = 0; i < keys.length; ++i)
	{
		item = todoList.items[keys[i]];
		item.isHidden(val == 2 ? false : Boolean(val) == item.isComplete());
	}	
});

O_O.listen(todos.event, function(e, list)
{
	var active, completed, change, changes;
	
	if(e.type == 'change')
	{
		var item = todoList.items[e.id];
		
		item.$.set(changes = e.changes);
		
		change = changes.completed;
		
		if(change === undefined)
			return;
		
		var state = filterState();
		
		item.isHidden(state == 2 ? false : Boolean(state) == change);
		item.isComplete(change);
		
		completed = change ? 1 : -1;
		active = completed * -1;
	}
	else
	{
		noTodos(todos.length == 0);
		
		if(e.type == 'add')
			e.data.completed ? completed = 1 : active = 1;
		
		else
			e.data.completed ? completed = -1 : active = -1;
	}
	
	if(completed)
		completedCount(completedCount() + completed) == todos.length && allChecked(1);
		
	if(active)
		activeCount(activeCount() + active) > 0 && allChecked(0);
});

/*Finally load the todoApp
------------------------*/
O_O.ready(function()
{
	todoApp.$.at('todoApp');
	
	todoCount = todoApp.todoCount;
	
	todos.data([{
		
		id: Date.now(),
		completed: true,
		title: 'Say hello'
		
	},
	{
		
		id: Date.now() + 1,
		completed: false,
		title: 'hi'
		
	}]);
});