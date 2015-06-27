/**
	The plugin could be written more efficiently
	but is written, so to be used as an example.
*/
(function() {

	"use strict";

	//a O_O plugin for autocomplete

	O_O.plugin('autocomplete', function autocomplete(callback /*to be executed on every keyup event*/, reqFunc /*to request data*/) {
	
		var prev, selection,
			matches = [],
			values = [],
		
		autocomplete = O_O.box({

			$: {

				/** have some dynamic html with some placeholders for the children */
				html: '<input type="text" id="input"/>\
						<div id="suggestions">\
							<div class="suggsetion"></div>\
						</div>',

				event: {

					keyup: function(e) {
					
						var code = e.keyCode;

						if(code == 38) //up arrow
							select(-1);

						else if(code == 40) //down arrow
							select(1);

						else if(code == 27) { //esc
							setValue('');
							clear();
						}
						else if(code == 13) { //enter
						
							clear();
							input.$.prop('selectionStart', input.$.val().length)
						}
						
						if(callback)
							callback(e);
					}
				},
				
				/** init functions execute after all the $ props have been loaded an before the children are loaded*/
				init: function(autocomplete) {
				
					inputEl = autocomplete.$.$el.$('input').el;
				}
			},

			input: {

				$: {

					event: {

						keyup: function(e) {
						
							var str = e.target.value.toLowerCase();

							if(str !== prev) {
							
								prev = str;

								if(reqFunc) { //request for data
								
									if(str === '') { //to avoid un-necessary requests
									
										clear();
										return;
									}
									
									reqFunc(str, function(vals) {
									
										values = vals;
										populate(str);
									});
								}
								else
									populate(str); //populate cached data
							}
						},
						
						blur: function() {
						
							clear();
						}
					}
				}
			},

			suggestions: O_O.pod({

				item: function(data) {
				
					this.$ = {

						text: data.text
					}
				}

			}),

			values: function(vals) {
			
				values = vals;
			},
			
			VERSION: '0.0.1',
			
			BASE: '0.0.7'
		});

		var input = autocomplete.input,
			inputEl,
			suggestions = autocomplete.suggestions;

		function populate(str) {
		
			var value;
			
			matches = [];

			if(str)
				for(var i = 0; i < values.length; ++i) {
				
					value = values[i];

					if(value.indexOf(str) == 0) //if the input is in the beginning of the value
						matches.push({

							text: value
						});
				}

			selection = undefined;
			suggestions.reset(matches);
		}
		
		function select(dir) {
		
			var prevSel,
				count = matches.length,
				items = suggestions.items,
				order = suggestions.order;

			if(selection === undefined)
				selection = dir == 1 ? 0 : count - 1;

			else {
			
				prevSel = selection;
				selection = (selection + dir + count) % count;
				items[order[prevSel]].$.class('selected', 0);
			}

			items[order[selection]].$.class('selected', 1);

			setValue(matches[selection].text);
		}

		function clear() {
		
			suggestions.reset();
			selection = undefined;
		}

		function setValue(val) {
		
			input.$.val(prev = val).el.select();
		}
		
		/** a custom override on the .box.$.val method*/
		autocomplete.$.val = function(val) {
		
			if(!val)
				return inputEl.value;
				
			inputEl.value = val;
		}
		
		return autocomplete;
	});
})();