"use strict";

require.config({

	paths: {

		jquery: '../lib/jquery-2.0.2.min',
		kiss: '../kiss',
		develop: '../lib/develop-0.0.1' //? develop
	},

	shim: {

		jquery: {

			exports: '$'
		},

		kiss: {

			deps: ['jquery']

		}
	}
});

define(['jquery', 'kiss', 'develop'], function($, O_O)
{
	var hider = O_O.function(function(val)
	{
		if(this.prev)
			App.content[this.prev]('classes', {hidden: true});
		
		App.content[val]('classes', {hidden: false});
		
		this.prev = val;
	});
	
	var App = O_O.element(new function(){
		
		this.selectedExample = O_O.value('');
		
		this.content = {
		
			basicConcepts: {
				
				simpleValue: {
				
					$: {
					
						html: 'pv',
						
						events: {
						
							click: function(){
							
								alert('The html of this element is: ' + this.html());
							}
						},
						
						init: function()
						{
							//alert('I\'m from an init');
						}
					}
				},
				
				voidOfElement: 'So wouldn\'t be used as for element'				
			},
			
			inputControls: new function()
			{
			
				var message = 'Set via a local var';
				
				this.$ = {html: message};
				
			},
		}
		
		this.toolbar = {
		
			exampleSelect: this.selectedExample
		
		}
	});
	
	$(document).ready(function()
	{
		App('el', 'App');
		
		for(var i in App.content)
			App.toolbar.exampleSelect('el').append('<option value="' + i + '">' + i + '</option>');
		
		App.selectedExample(App.toolbar.exampleSelect('val'));
		
		hider(App.selectedExample);
	});
});