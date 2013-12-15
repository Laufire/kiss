/*!
MockServer v0.0.1

NO2 Liscence
*/
define(function()
{
	"use strict";
	
	return new function()
	{
	
		var routes, self = this;
		
		self.request = function(request, callback)
		{
			if(typeof request == 'string')
				request = {url: request, data: {}}
				
			if(!request.success)
				request.success = callback || function(){};
			
			if(routes[request.url])
				respond(request, routes[request.url](request.data || {}));
			else
				spawn(request, {error:1});
		}
		
		self.add = function(data)
		{
			routes = data;
		}
		
		//privates
		
		var respond = function(request, result)
		{
			spawn(request.success, result);
		}
		
		var spawn = function spawn(callback, data)
		{
			setTimeout(function()
			{
				callback(data);
				
			}, 10);
		}
	}

});