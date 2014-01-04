(function()
{
"use strict";

/*Define the variables
---------------------*/
var todoList = O_O.list(),

filterState = 2,
allChecked = O_O.value(0),
activeCount = O_O.value(0),
completedCount = O_O.value(0),

noTodos = O_O.trans(function(val)
{
	return !val;
	
})(todoList.length),

todoPod,

todoApp = O_O.box(new function()
{
	this.newTodo = {$: { event: {

		keyup: function(e)
		{
			if(e.keyCode == 13)
			{
				todoList.add(Date.now(), {
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
						items = todoPod.items,
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

	todoPod = this.todoPod = O_O.pod({

		source:  todoList,
		
		item: function(data)
		{
			var self = this;
			
			this.isHidden = O_O.value(filterState == 2 ? false : Boolean(filterState) == data.isDone);
			
			this.isDone = O_O.value(data.isDone);
			
			this.$ = {

				event: {

					'click .destroy': function(e, item)
					{
						item.$.event('click .destroy'); //remove the event listener so it isn't invoked during the fade out
						item.$.class('fadeOutUp', 1);
						
						setTimeout(function()
						{
							todoList.remove(item.$.id);
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
					edit$.val(todoList.items[item$.id].data.title);
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
				var $ = box.$.parent.$,
					value = e.target.value;
				
				if(value)
				{
					$.data({
					
						title: value
					});
					
					$.class('editing', 0);
				}
				else
					todoList.remove($.id);
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
							items = todoList.items,
							keys = Object.keys(todoList.items);
						
						for(i = 0; i < keys.length; ++i)
							id = keys[i], items[id].data.isDone && todoList.remove(id);
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
	var i = 0, item,
		keys = Object.keys(todoList.items);
		
	DOM.$('#filters a.selected').class('selected', 0);
	DOM.$('#filters li:nth-of-type(' + (3 - filterState) + ') a').class('selected', 1);
	
	for(; i < keys.length; ++i)
	{
		item = todoPod.items[keys[i]];
		item.isHidden(filterState == 2 ? false : filterState == item.isDone());
	}
	
	//console.log(Date.now() - start);
});

O_O.listen(todoList.event, function(e, list)
{
	var active, completed, change,
		type = e.type;
	
	if(type == 'change')
	{
		var item = todoPod.items[e.id];
		
		change = e.changes.isDone;
		
		if(change === undefined)
			return;
		
		item.isHidden(filterState == 2 ? false : filterState == change);
		
		completed = change ? 1 : -1;
		active = completed * -1;
	}
	else
	{
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
	
	for(var i = 0; i < 1000; ++i)
		todoList.add(i, {
		
			isDone: Boolean(i%2),
			title: i
			
		});
	
	todoApp.$.at('todoApp'); //always set the root element after all the intializations have been done
	console.log(Date.now() - start);
	
	var start = Date.now();
	
	for(var i = 0; i < 1000; ++i)
		todoList.change(i, {
		
			isDone: !Boolean(i%2),
			title: i + i
			
		});
		
	console.log(Date.now() - start);
	
	todoApp.$.class('hidden', 0);
	DOM.$('#info p').class('hidden', 0);
});
})()