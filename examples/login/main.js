//?watches

"use strict";

var App, _K; //? it's in the global scope to make debugging easy

require.config({

	paths: {

		microDOM: '../../lib/microDOM',
		kiss: '../../kiss',
		mockServer: '../../lib/mockServer',
		//trans: '../../lib/trans',
		develop: '../../lib/develop'
	},

	shim: {

		microDOM: {
		
			exports: 'DOM'
		},
		
		kiss: {
		
			exports: 'O_O',
			depends: ['microDOM']

		},
		
		trans: {
		
			depends: ['kiss']
		}
	}
});

//define(['microDOM', 'kiss', 'trans', 'mockServer', 'routes', 'develop'], function(DOM, O_O, trans, Server, routes)
define(['microDOM', 'kiss', 'mockServer', 'routes', 'develop'], function(DOM, O_O, Server, routes)
{
	//console.log(trans);
	
	_K = O_O; //? develop

	Server.add(routes);
	
	var count = O_O.trans.count;
	var falsy = O_O.trans.falsy;
	var usernameListener, textWatch;
	
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
			
			password: self.data.password, //?convert this to a plugin
			
			login: function()
			{
				Server.request({
				
					url: 'login',
					data: App.loginForm(),
					success: function(response)
					{
						usernameListener.stop();
						
						if(response)
							alert('success');
						else
							alert('failure');
					}
				})
			},
			
			display: {
			
				$: {
				
					html: count(self.data.username),
					
					class: { hidden: falsy(self.data.username) }
				}
			}
		}
	});
	
	function log(val)
	{
		console.log(val);
	}

	O_O.ready(function()
	{
		App('el', 'App');
		
		App.loginForm({username: App.data.username});
		App.loginForm('$', {class: ['hidden']});
		
		usernameListener = O_O.listen(App.data.username, function(val)
		{
			console.log(val);
		});
		
		textWatch = O_O.watch(App.data.username, App.data.password)
			.action(function(val, source)
			{
				if(val == 'no')
					this.unwatch(source);
					
				console.log(val);
			});
	});		
});