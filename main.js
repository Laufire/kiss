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

	var v1 = new O_O.value('Dynamic Value');
	///*
	App = O_O.element({
		
		simple: {
		
			simpleString: {
				
				$: {
				
					html: v1,
					
					events: {
					
						click: function(){
						
							alert('The html of this element is: ' + this.html());
						}
					},
					
					init: function()
					{
						alert('I\'m from an init');
					}
				},
				
				voidOfElement: 'So wouldn\'t be used as element'
				
			}
		}
	});
	//*/
	/*
	var simpleString = O_O.element({
			
		$: {
		
			html: v1,
			
			init: function()
			{
				alert('hi');
			},
			
			events: {
			
				click: function(){
				
					console.log(this);
				}
			}
		},
		
		o: 1		
	});
	*/
	$(document).ready(function()
	{
		observed = new O_O.value(true);
		
		App('el', 'App');		
		//simpleString('el', 'simpleString');
		
		v1('Click Me!');
		observed(false);
	});
	
	//console.log(App('el'));
	//App('html', '1').$.html(2);
	//App({html: 3});
});