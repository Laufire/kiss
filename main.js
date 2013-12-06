"use strict";

var App, _K; //? it's in the global scope to make debugging easy
var observed;

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

			deps: ['jquery']

		}
	}
});

define(['jquery', 'kiss', 'develop'], function($, O_O, develop)
{
	_K = O_O; //? develop

	var observed = O_O.value(false);
	var pv = O_O.value('Dynamic Value');
	//var pv1 = O_O.value('Dynamic Value1');
	/*
	var pvg = new O_O.value(
		
		'Dynamic Trans',
		
		function(val, prev)
		{
			console.log(val);
			console.log(prev);
			return val.toLowerCase();
		}
	);*/
	
	//var pf = O_O.function(function(v){return v + v});
	
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
					},
					
					class: {
					
						hidden: observed
					},
					
					event: {
					
						click: function(){
						
							alert('The html of this element is: ' + this.html());
						}
					}/*,
					
					init: function()
					{
						//alert('I\'m from an init');
					}*/
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
			
			//,simpleString1: pvg
		}
	});
	
	var test = new develop.test();
	
	$(document).ready(function()
	{
		App('el', 'App');
		pv(1);
	
		//test.queue([step1, step2, step3], 1000);
		
	});		
});

/*
	var h = O_O.element({
		
		$: {
			html: 'hi',
			
			attr: {'style' : 'background:green'},
			
			event: {
			
				click: function()
				{
					console.log(this);
				}
			}
		}
		
	});
	var c = O_O.element();
	var ht = O_O.value('ooooooooooooooo');
	var ch = O_O.value(true);
	
	var step1 = function()
	{
		c('prop', 'checked', ch);
		h('html', 'cut');
	}
	
	var step2 = function()
	{
		ht('sssssssssssss');
		h('attr', 'style', 'background:red');
		ch(false);
		h('class', 'hidden', ch);
	}
	
	var step3 = function()
	{
		h('class', 'hidden', function(){return false});
		h('html', 'Shown');
		ch(function(){return true});
	}
	*/