"use strict";

var App, _K; //? it's in the global scope to make debugging easy

require.config({

	paths: {

		jquery: 'lib/jquery-2.0.2.min',
		kiss: 'kiss',
		develop: 'lib/develop' //? develop
	},

	shim: {

		jquery: {

			exports: '$'
		},

		kiss: {

			deps: ['jquery'],
			exports: 'O_O'

		}
	}
});

define(['jquery', 'kiss', 'develop'], function($, O_O, develop)
{
	_K = O_O; //? develop

	var observed = O_O.value(false);
	var pv = O_O.value('Dynamic Value');
	
	App = O_O.element({
		
		simple: {
		
			input: {
				
				$: {
				
					val: observed
				}
				
			},
			
			simpleString: {
				
				$: {
				
					html: pv,
					
					attr: {
					
						style: 'background: red'
						//style: function(){return 'background: red'}
					},
					
					class: {
					
						hidden: observed
						//hidden: function(){return true}
					},
					
					event: {
					
						click: function(){
						
							alert('The html of this element is: ' + this.html());
						}
					}
				},
				
				voidOfElement: 'So wouldn\'t be used as for an element'
				
			},
			
			check:
			{
				$: {
				
					prop: {
					
						checked: true
					},
					
					event: {change: function(){observed(!observed())}}
				}
			}
		}
	});
	
	//var test = new develop.test();
	
	$(document).ready(function()
	{
		App('el', 'App');
		pv(1);
		
		O_O.show();		
	});		
});