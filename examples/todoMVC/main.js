﻿(function()
{
"use strict";

/*Define the variables
---------------------*/
var todos = O_O.list({

	idProp: 'id',
}),

filterState = 2,
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
					isDone: false,
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
			
			this.isHidden = O_O.value(filterState == 2 ? false : Boolean(filterState) == itemData.completed); //<-here
			
			this.isDone = O_O.value(itemData.completed);
			
			this.$ = {

				event: {

					'click .destroy': function(e, item)
					{
						item.$.event('click .destroy'); //remove the event listener so it isn't invoked during the fade out
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

/*Initial setup
--------------*/
O_O.state.routes = {

	'*': function()
	{
		filterState = 2;
	},
	
	'active': function()
	{
		filterState = 1;
	},	
	
	'completed': function()
	{
		filterState = 0;
	}
};

O_O.listen(O_O.state.change, function()
{
	//var start = Date.now();
	
	DOM.$('#filters a.selected').class('selected', 0);
	DOM.$('#filters li:nth-of-type(' + (3 - filterState) + ') a').class('selected', 1);
	
	var i = 0, item, keys = Object.keys(todos.items);
	
	for(; i < keys.length; ++i)
	{
		item = todoList.items[keys[i]];
		item.isHidden(filterState == 2 ? false : filterState == item.isDone());
	}
	
	//console.log(Date.now() - start);
});

O_O.listen(todos.event, function(e, list)
{
	var active, completed, change,
		type = e.type;
	
	if(type == 'change')
	{
		var item = todoList.items[e.id];
		
		change = e.changes.isDone;
		
		if(change === undefined)
			return;
		
		item.isHidden(filterState == 2 ? false : filterState == change);
		
		completed = change ? 1 : -1;
		active = completed * -1;
	}
	else
	{
		noTodos(todos.length == 0);
		
		change = e.data.isDone;
		
		if(type == 'add')
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