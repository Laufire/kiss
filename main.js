"use strict";

var App, _K; //? it's in the global scope to make debugging easy

require.config({

	paths: {

		microDOM: 'lib/microDOM',
		kiss: 'kiss',
		develop: 'lib/develop' //? develop
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

define(['microDOM', 'kiss', 'develop'], function(DOM, O_O, develop)
{
	_K = O_O; //? develop

	var observed = O_O.value(false);
	var pv = O_O.value('Dynamic Value');
	
	App = O_O.element({
		
		simple: {
		
			input: observed,
			
			simpleString: {
				
				$: {
				
					html: pv,
					
					attr: {
					
						//style: 'background: red'
						style: function(){return 'background: red'}
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
					
						checked: false
					},
					
					event: {change: function(){observed(!observed())}}
				}
			}
		}
	});
	
	O_O.ready(function()
	{
		App('el', 'App');
		pv(1);
	});		
});