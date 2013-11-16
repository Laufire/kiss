"use strict";

var App, _K; //? it's in the global scope to make debugging easy

require.config({
	
	paths: {
	  
		jquery: 'lib/jquery-2.0.2.min',
		kiss: 'kiss',
		develop: 'lib/develop' //? develop
	}
});

define(['jquery', 'kiss', 'develop'], function($, O_O)
{
	_K = O_O; //? develop
	
	App = new O_O.nested(new function()
	{
		var App = this;
		
		this.data = {
		
			//message: 'This object shouldn\'t be changed, as the DOM has no reference to it',
			message: new O_O.value('This is a dynamic value'),
			message1: new O_O.value('This too is a dynamic value'),
			
		}
		
		this.header =  {
		
			logo: {
				
				$html: 'KISS - a stupid JS framework',
				
				$attr: {
				
					href : '/'
					
				}
			}
		}
		
		this.screen1 = new function(){
		
			this.$attr = {style: 'display:  none'};
			
			this.message = 'I\'m a view named Screen 1';
			
			this.pane1 = {
			
				list: new O_O.collection({
				
					data: [{name: 'a', age: 1}, {name: 'b', age: 2}, {name: 'c', age: 3}]
				})
			}
		}
		
		this.screen2 = {			
			
			title: {
				
				$html : App.data.message
			}			
		},
		
		this.footer = {			
			
			$html : function()
			{
				console.log(this);
				this.html(this.attr('id'));
			}
		}
	});
	
	$(document).ready(function()
	{
		App.load($('#App'));		
		
		//App.data.message('Message0 set via the value')
		
		//setTimeout(function(){App.screen2.title.$html('Message4 set set directly')}, 4000);
		//setTimeout(function(){App.data.message('Message3 set via the value')}, 3000);
		setTimeout(function(){App.screen2.title.$html('Message2 set directly')}, 2000);
		setTimeout(function(){App.data.message('Message1 set via the value')}, 1000);
		
		//console.log(App.screen1.pane1.list.$node.html());
	});

	
});