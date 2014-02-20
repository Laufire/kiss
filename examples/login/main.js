"use strict";

var Server = mockServer;

Server.add(routes); //setting up mockServer

var usernameListener, textWatch,

falsy = O_O.plugin.trans.falsy,

passwordStrength = O_O.trans(function(val) {

	var strength = 0;
	
	val.length > 3 && strength++;
	
	val.length > 7 && strength++;
	
	/[a-z]/.test(val) && strength++;
	/[A-Z]/.test(val) && strength++;
	/[0-9]/.test(val) && strength++;
	/.[!,@,#,$,%,^,&,*,?,_,~,-,£,(,)]/.test(val) && strength++;
	
	return strength;
}),

App = O_O.box(new function() {

	var self = this;

	self.data = O_O.object({

		username: O_O.value(),

		password: O_O.value(localStorage.pass || 'pass'),
		
		tree: O_O.object({
		
			a: 1, b: 2
		})
	});

	self.title = 'Login - example';

	self.loginForm = {

		username: {$ : { default: {
		
			value: self.data.username,
			
			event: 'keyup'
		}}},

		password: O_O.plugin.keyUpText(self.data.password),

		login: function(e) {
		
			console.log(App.data());
			
			Server.request({

				url: 'login',
				
				data: App.loginForm.$.val(),
				
				success: function(response) {
				
					usernameListener.stop();

					if(response)
						alert('success');
					else
						alert('failure');
				}
			});
		},

		display: {

			$: {

				class: {
				
					hidden: falsy(self.data.password)
				}
			},
			
			strength: passwordStrength(self.data.password)
		}
	}
});

O_O.ready(function() {

	App.$.at('App');

	App.data.username(localStorage.user || 'user');

	usernameListener = O_O.listen(App.data.username, function(val) {
	
		console.log(val);
	});

	textWatch = O_O.watch(App.data.username, App.data.password)
		.action(function(val, source) {
		
			if(source == App.data.username)
				localStorage.user = val;
			else
				localStorage.pass = val;
		});
});