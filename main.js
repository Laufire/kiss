"use strict";

var App, _K; //? it's in the global scope to make debugging easy
var observed;

require.config({

	paths: {

		jquery: 'lib/jquery-2.0.2.min',
		kiss: 'kiss',
		develop: 'lib/develop-0.0.1' //? develop
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
	_K = O_O; //? develop

	var observed = O_O.value(false);
	var pv = O_O.value('Dynamic Value');
	var pv1 = O_O.value('Dynamic Value1');
	
	var pvg = new O_O.value(
		
		'Dynamic Trans',
		
		function(val, prev)
		{
			console.log(val);
			console.log(prev);
			return val.toLowerCase();
		}
	);
	
	var pf = O_O.function(function(v){return v + v});
	
	App = O_O.element({
		
		simple: {
		
			simpleString: {
				
				$: {
				
					html: pv,
					
					events: {
					
						click: function(){
						
							alert('The html of this element is: ' + this.html());
						}
					},
					
					init: function()
					{
						//alert('I\'m from an init');
					}
				},
				
				voidOfElement: 'So wouldn\'t be used as for an element'
				
			},
			
			simpleString1: pvg
		}
	});
	
	$(document).ready(function()
	{
		App('el', 'App');
		
		
	});
});