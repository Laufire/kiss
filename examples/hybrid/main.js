var outputNode;

var modules = [{//the root module

	commands: {

		clear: function()
		{
			UI.clear();		
		},
		
		load: function(moduleName)
		{
			require([['modules/', moduleName, '/', moduleName].join('')], function(module)
			{
				modules.push(currentModule); //pushes the module into the queue
				
				UI.notifyUser(['module \'', moduleName, '\' loaded.'].join(''));
			});
		},
		
		unload: function()
		{
			if(modules.length > 1) //do not unload the root module
				UI.notifyUser([
					'module \'',
					modules.pop() //pops the module out of the queue
					.name,
					'\' unloaded.'
				].join(''));
		}			
	}
}];

//exposed
var Client = {

	processInput: function(input)
	{
		var params = input.match(/"(?:\\"|[^"])*?"|[^\s]+/g);

		for(var i in params)
			params[i] = params[i].replace(/^"|"$/g, '').replace(/\\"/,'"');
		
		var command = params.shift();
		
		var ret;		
		var processed;
		
		for(var i = 0, l = modules.length; i < l; ++i) //check the module queue for the specified action
		{
			if(modules[i].commands[command])
			{
				ret = modules[i].commands[command].apply(null, [params, command]);
				processed = true;
				break;
			}
		}
		
		if(!processed) //the command is not available in the module queue
		{
			var defaultAction = modules[modules.length - 1].defaultAction;
			
			if(defaultAction) //check the end of the module queue for a 'defaultAction'
				ret = defaultAction.apply(null, [params, command]);
			else
				UI.notifyUser('No such command!', 'warning'); //return a warning message
		}
		
		if(ret)
			UI.notifyUser(ret); //?here requirejs circular dependencies
	},
	
	processResponse: function(response)
	{
		switch(response.type)
		{
			case 'error':
				UI.notifyUser(response.data, 'error');
			break;
			
			case 'message':
				UI.notifyUser(response.data);
			break;
			
			case 'table':
				UI.createTable(response.data);
			break;
			
			default: //?develop
				console.log(response);
		}
	}
}

var Connection = new function()
{
	this.request = function(requestParams)
	{
		$.ajax($.extend(requestParams, {//load the requestParams with the defaults and make an ajax request
		
			success: function(response){Client.processResponse(response)},
			dataType: 'json'
		}));
	}
}

var UI = new function()
{
	var appendToOutput = function($frag)
	{
		outputNode.append($frag);
		
		outputNode.scrollTop(outputNode[0].scrollHeight); //scroll to the bottom after new content is added
	}
	
	var self = this;
	
	self.clear = function()
	{
		outputNode.html('');			
	}	

	self.notifyUser = function(data, type)
	{
		switch(type)
		{
			case 'error':
				appendToOutput($('<div class="result error"></div>').html(data));
			break;
			
			case 'warning':
				appendToOutput($('<div class="result warning"></div>').html(data));
			break;
			
			default:
				appendToOutput($('<div class="result"></div>').html(data));
		}			
	}
	
	self.createTable = function(table)
	{
		if(!table.rows.length)
			UI.notifyUser('No results!', 'warning');
			
		else
		{
			var $frag = $('<div class="result"><table><thead></thead><tbody></tbody></table></div>');
			
			var $thead = $frag.find('thead');
			
			$.each(table.fields, function(index, name)
			{
				$thead.append($('<td>').html(/[^.]+$/.exec(name)));
			});
			
			var $tbody = $frag.find('tbody');
			
			$.each(table.rows, function(index, row)
			{
				var $tr = $('<tr>');
				
				$.each(row, function(index, data)
				{
					$tr.append($('<td>').html(data));
				});
				
				$tbody.append($tr);
			});
			
			appendToOutput($frag);
		}
	}
}

var App = new O_O.element(new function()
	{
		this.name = 'App';
		
		this.output = {};
		
		this.input = {
		
			inputText: {
			
				$: {
					event: {
					
						keydown: function(e){
						
							if(e.keyCode == 13)
							{
								Client.processInput(e.currentTarget.value);
								e.currentTarget.value = '';
							}
							
						}
					}
				}
			}
		}		
	});
	
O_O.ready(function()
{
	App('el', 'App');
	
	outputNode = $('#output');
	//onload here
});