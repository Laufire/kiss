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

			deps: ['jquery']

		}
	}
});

define(['jquery', 'kiss', 'develop'], function($, O_O)
{
	_K = O_O; //? develop

	App = new O_O.element(new function()
	{
		var App = this;
		
		this.data = new function(){ //this object has no corresponding html elemrnt; it can serve as the data

			this.tieableValue = new O_O.value('This is from a tied value');

			this.tieableValue1 = new O_O.value(1);

			this.tieableValue2 = new O_O.value(1);

			this.tieableValue3 = new O_O.value(5);

			this.tieableFunction = new O_O.function(function(val1, val2)
			{
				return [val1, ' X ', val2, ' = ', val1 * val2].join(' ');
			});

			this.presetTiedFunction = this.tieableFunction(3, this.tieableValue2);

			this.truthy = new O_O.function(function(val)
			{
				if(val)
					return true;

				return false;
			});
		}

		this.simple =  { //example of simple values(without ties)

			simpleString: {

				$: {
				
					html: 'This is a simple string as the html of an element',
					
					attrs: {

						href : 'a simple string applied to an attr'

					}
				}
			},

			simpleFunction : {

				$: {
					
					html : function()
					{
						return 'This is a calculated value, as the html of an element';
					}
				}
			}
		}

		this.table = { //example of collection

			title:
			{
				$: {
				
					html: 'The title for this section'
				}
			},

			collection: new O_O.collection({

				data: [{name: 'a', age: 1}, {name: 'b', age: 2}, {name: 'c', age: 3}]
			})
		}

		this.ties = {

			tiedValue: App.data.tieableValue, //the tieable is assigned directly to the elements default attribute

			tiedFunction: {

				$: {
				
					props : {

						checked: this.data.truthy(App.data.tieableValue1)
					}

				}
			},

			tiedFunction_Call1: App.data.tieableFunction(1, App.data.tieableValue2),

			tiedFunction_Call2: {

				//calling the same function twice creates two separate bindings
				$: {
				
					html : App.data.tieableFunction(2, App.data.tieableValue2)
				}
			},

			presetTiedFunction: {

				//using preset tied functions a tiedFunction could be used multiple times.
				$: {
				
					html : App.data.presetTiedFunction
				}
			}
		}
		
		this.events = new function()
		{
			var v1 = new O_O.value('Text');
			var v2 = new O_O.value(1);
			var v3 = new O_O.value(true);
			
			var showHtml = function(event)
			{
				alert(event.currentTarget.innerHTML);
			}
			
			this.text = v1;
			this.output1 = v1;
			
			this.select = v2;
			this.output2 = v2;
			
			this.checkbox = {
			
				$: {
				
					default: v3, //this ties the value to the change event and the 'checked' property
					
					events: {
					
						change: function(){v1(new Date())}
					}
				}
			};
			this.output3 = v3
			
			this.click = {

				$: {
				
					html : 'Click Me!',
					
					events: {
					
						click: showHtml
						
					}
				}
			}
		}
	});
	
	var testTies = function()
	{
		App.data.tieableValue('I\'m from a tieable value');

		setTimeout(function(){

			App.data.tieableValue2(1);
			App.data.tieableValue1(0);

		}, 1000);

		setTimeout(function(){App.data.tieableValue2(2)}, 2000);
		setTimeout(function(){App.data.presetTiedFunction(2, App.data.tieableValue3)}, 3000);
		setTimeout(function(){App.data.tieableValue2(3)}, 4000);

		setTimeout(function(){

			App.data.tieableValue3(10);
			App.ties.tiedFunction_Call1.$.html(App.data.tieableFunction(App.data.tieableValue3, App.data.tieableValue2));
			App.ties.tiedFunction_Call2.$.html(App.data.tieableValue3);
			App.data.tieableValue1(1);

		}, 5000);

		setTimeout(function(){App.data.tieableValue3(5)}, 6000);
	}

	$(document).ready(function()
	{
		App.load($('#App'));

		testTies();
	});


});