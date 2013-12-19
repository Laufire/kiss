﻿//?watches

"use strict";

var App; //? it's in the global scope to make debugging easy

require.config({

	paths: {

		microDOM: '../../lib/microDOM',
		kiss: '../../kiss',
		mockServer: '../../lib/mockServer',
		trans: '../../lib/O_O.trans',
		keyUpText: '../../lib/O_O.keyUpText',
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
		},

		keyUpText: {

			depends: ['kiss']
		}
	}
});

define(['microDOM', 'kiss', 'mockServer', 'routes', 'trans', 'keyUpText', 'develop'], function(DOM, O_O, Server, routes)
{
	Server.add(routes); //setting up mockServer

	var usernameListener, textWatch,

		falsy = O_O.plugin.trans.falsy,

		passwordStrength = O_O.trans(function(val)
		{
			var strength = 0;
			
			val.length > 3 && strength++;
				
			val.length > 7 && strength++;
			
			/[a-z][A-Z]|[A-Z][a-z]/.test(val) && strength++;
			
			return strength;
		});

	App = O_O.element(new function()
	{
		var self = this;

		self.data = O_O.object({

			username: O_O.value(localStorage.user || 'user'),

			password: O_O.value(localStorage.pass || 'pass')
		});

		self.title = 'Login - example';

		self.loginForm = {

			username: {},

			password: O_O.plugin.keyUpText(self.data.password),

			login: O_O.element('event', 'click', function()
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
			}),

			display: {

				$: {

					class: { hidden: falsy(self.data.password) }
				},
				
				strength: passwordStrength(self.data.password)
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

		usernameListener = O_O.listen(App.data.username, function(val)
		{
			console.log(val);
		});

		textWatch = O_O.watch(App.data.username, App.data.password)
			.action(function(val, source)
			{
				if(source == App.data.username)
					localStorage.user = val;
				else
					localStorage.pass = val;
			});
	});
});