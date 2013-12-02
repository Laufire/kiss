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
	var v1 = O_O.value('Dynamic Value');
	//var v2 = new O_O.value('Dynamic Value');
	var v2 = new O_O.value(
	
		'Dynamic Trans',
		function(val){
		
			//return val + val;
			return val.toLowerCase();
			
		}/*,
		function(newVal)
		{
			return newVal.toLowerCase();		
		}*/
	);
	///*
	App = O_O.element({
		
		simple: {
		
			/*$:
			{
				classes: {
				
					hidden: true
				}
			},*/
				
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
						//alert('I\'m from an init');
					}
				},
				
				voidOfElement: 'So wouldn\'t be used as for an element'
				
			},
			/*
			simpleString1: {
				
				$: {
				
					html: v2
				}
			}*/
			simpleString1: v2,
			check1: observed,
			check: observed
		}
	});
	
	$(document).ready(function()
	{
		//observed = new O_O.value(true);
		
		App('el', 'App');		
		
		//App.simple.simpleString('html', 'simpleString');
		
		v1('Click Me!');
		//v1('Click Me again!');
		v2('Transformed');
		observed(false);
	});
	
	//console.log(App('el'));
	//App('html', '1').$.html(2);
	//App({html: 3});
});