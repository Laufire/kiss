"use strict";

var App, _K; //? it's in the global scope to make debugging easy

require.config({

	paths: {

		microDOM: '../../lib/microDOM',
		kiss: '../../kiss',
		mockServer: '../../lib/mockServer',
		jquery: '../../lib/jquery-2.0.2.min',
		develop: '../../lib/develop'
	},

	shim: {

		microDOM: {
		
			exports: 'DOM'
		},
		
		kiss: {
		
			exports: 'O_O',
			depends: ['microDOM']

		}
	}
});

define(['microDOM', 'kiss', 'mockServer', 'routes', 'develop'], function(DOM, O_O, Server, routes)
{
	_K = O_O; //? develop

	Server.add(routes);
	
	var count = O_O.trans(function(val)
	{
		return val.length;
	});
	
	App = O_O.element(new function()
	{		
		var self = this;
		
		self.data = O_O.object({
		
			username: O_O.value('user'),
			
			password: O_O.value('pass')			
		});
		
		self.title = 'Login - example';
		
		self.loginForm = {
		
			username: {},
			
			password: self.data.password,
			
			login: function()
			{
				Server.request({
				
					url: 'login',
					data: App.loginForm(),
					success: function(response)
					{
						if(response)
							alert('success');
						else
							alert('failure');
					}
				})
			},
			
			letterCount1: count(self.data.username),
			letterCount2: count(self.data.password)
		}
		
		//console.log(count(self.data.username));
	});
	
	DOM.ready(function()
	{
		App('el', 'App');
		
		App.loginForm({username: App.data.username});
		App.loginForm('$', {class: ['hidden']});
		O_O.show();
	});		
});