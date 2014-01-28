(function()
{
"use strict";

/*Define the variables
---------------------*/
var todoList = O_O.list(),

filterState = O_O.value(2),
allChecked = O_O.value(0),
activeCount = O_O.value(0),
completedCount = O_O.value(0),

noTodos = O_O.value(true),

todoPod,

todoApp = O_O.box(new function()
{
	this.newTodo = {$: { event: {

		keyup: function(e)
		{
			if(e.keyCode == 13)
			{
				todoList.add({
				
					id: Date.now(),
					
					data: {
						isDone: false,
						title: e.target.value
					}
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
			
			this.isHidden = O_O.value(filterState() == 2 ? false : Boolean(filterState()) == data.isDone);
			
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
				},
				
				clean: function()
				{
					alterCounts(self.isDone(), -1);
					noTodos(todoList.length() == 0);
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
			
			//global changes
			noTodos(false);
			alterCounts(data.isDone, 1);
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
							id = keys[i], items[id].isDone && todoList.remove(id);
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
		keys = Object.keys(todoList.items),
		state = filterState();
		
	DOM.$('#filters a.selected').class('selected', 0);
	DOM.$('#filters li:nth-of-type(' + (3 - state) + ') a').class('selected', 1);
	
	for(; i < keys.length; ++i)
	{
		item = todoPod.items[keys[i]];
		item.isHidden(state == 2 ? false : state == item.isDone());
	}
	
	//console.log(Date.now() - start);
});

O_O.listen(todoList.event, function(e, list)
{
	if(e.type == 'change')
	{
		var item = todoPod.items[e.data._id],
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
	else if(e.type == 'remove')
	{
		if(e.data.isDone)
			completedCount(completedCount() - 1);
		else
			activeCount(activeCount() - 1);
	}
});

/*Finally load the todoApp
------------------------*/
O_O.ready(function()
{
	var start = Date.now();
	
	for(var i = 0; i < 10; ++i)
		todoList.add({
			
			_id: i,
			isDone: Boolean(i%2),
			title: i
		});
	
	todoApp.$.at('todoApp'); //always set the root element after all the intializations have been done
	console.log(Date.now() - start);
	
	var start = Date.now();
	
	for(var i = 0; i < 10; ++i)
		todoList.change(i, {
		
			isDone: !Boolean(i%2),
			title: i + i
			
		});
		
	console.log(Date.now() - start);
	
	todoApp.$.class('hidden', 0);
	DOM.$('#info p').class('hidden', 0);
});
})()