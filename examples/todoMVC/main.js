"use strict";

/*Define the variables
---------------------*/
var now = Date.now,

todos = O_O.list({

	idProp: 'id',
}),

filterState = 2,
noTodos = O_O.value(0),
allChecked = O_O.value(0),
activeCount = O_O.value(0),
completedCount = O_O.value(0),

todoCount, todoList,

todoApp = O_O.box(new function()
{
	this.newTodo = {$: { event: {

		keyup: function(e)
		{
			if(e.keyCode == 13)
			{
				todos.data({
					id: now(),
					completed: false,
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
		
		mode: 'prepend',

		item: function(itemData)
		{
			function changeTitle(e, box)
			{
				var $ = box.$.parent.$;
				
				$.data({
				
					title: e.target.value
				});
				
				$.class('editing', 0);
			}
			
			this.isHidden = O_O.value(filterState == 2 ? false : Boolean(filterState) == itemData.completed); //<-here
			
			this.isDone = O_O.value(itemData.completed);
			
			this.$ = {

				event: {

					'click .destroy': function(e, item)
					{
						todos.remove(item.$.id);
					}
				},

				class: {

					hidden: this.isHidden,

					completed: this.isDone
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
						box.$.parent.$.data({
						
							completed: e.target.checked
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
O_O.state.add({

	'/': function()
	{
		filterState = 2;
	},
	
	'/active': function()
	{
		filterState = 1;
	},	
	
	'/completed': function()
	{
		filterState = 0;
	}	
});

O_O.listen(O_O.state.change, function()
{
	DOM.$('#filters a.selected').class('selected', 0);
	DOM.$('#filters li:nth-of-type(' + (3 - filterState) + ') a').class('selected', 1);
	
	var i = 0, item, keys = Object.keys(todos.items);
	
	for(; i < keys.length; ++i)
	{
		item = todoList.items[keys[i]];
		item.isHidden(filterState == 2 ? false : Boolean(filterState) == item.isDone());
	}	
});

O_O.listen(todos.event, function(e, list)
{
	var active, completed, change;
	
	if(e.type == 'change')
	{
		var changes, item = todoList.items[e.id];
		
		item.$.set(changes = e.changes);
		
		change = changes.completed;
		
		if(change === undefined)
			return;
		
		item.isHidden(filterState == 2 ? false : Boolean(filterState) == change);
		item.isDone(change);
		
		completed = change ? 1 : -1;
		active = completed * -1;
	}
	else
	{
		noTodos(todos.length == 0);
		
		change = e.data.completed;
		
		if(e.type == 'add')
			change ? completed = 1 : active = 1;
		
		else
			change ? completed = -1 : active = -1;
	}
	
	if(completed)
		completedCount(completedCount() + completed);
		
	if(active)
		activeCount(activeCount() + active);
		
	allChecked(activeCount() == 0);
});

/*Finally load the todoApp
------------------------*/
O_O.ready(function()
{
	todoCount = todoApp.todoCount;
	
	todos.data([{
		
		id: now(),
		completed: true,
		title: 'Say hello'
		
	},
	{
		
		id: now() + 1,
		completed: false,
		title: 'hi'
		
	}]);
	
	todoApp.$.at('todoApp'); //always set the root element after all the intializations have been done
});