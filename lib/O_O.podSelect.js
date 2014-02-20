/**
	O_O.podSelect
		a O_O.plugin to implement a generic 'select' like O_O.pod
		it also demonstrates how to extend O_O.pod's items
		
	depends on: kiss-v0.0.7.js
*/

(function() {

	"use strict";
	
	//a O_O plugin that changes a given val on keyup
	
	O_O.plugin('podSelect', function podSelect(_options) {
	
		var pod, eventWrapper, eventBuilder, exEvent,
		
		selection = O_O.value(),
		
		options = {
		
			source: _options.source,
			
			item: _options.item,
			
			$: {} || _options.$
		},
		
		podEvent = options.$.event = options.$.event || {},
		
		podClick = podEvent.click;
		
		podEvent.click = function(e) {
		
			var target = e.target;
			
			if(target == pod.$.el)
				selection(null);
			else
				selection(options.source.items[target.id]) //? could fail when the model._id is different from the element.id
			
			if(podClick)
				podClick(e, pod);
		}
		
		pod = new O_O.class.pod(options);
		
		pod.selection = selection;
		
		eventBuilder = pod.event.plug(function(e) { //an one time plug to build the eventWrapper
		
			if (e.type= 'add') {
			
				exEvent = e.item.$.event('click');
				
				if(exEvent)
					eventWrapper = function(e, box) { //there already is an event handler so the wrapper should pass the event through
					
						selection(options.source.items[box.$.id]);
						exEvent(e, box);
					}
				else
					eventWrapper = function(e, box) { //there isn't an event handler; so the wrapper could be a simple function
					
						selection(options.source.items[box.$.id]);
					}
			}
			
			eventBuilder(); //unplug the plug
		});
		
		pod.event.plug(function(e) {
		
			if(e.type = 'add')
				e.item.$.event('click', eventWrapper);
		});
		
		return pod;
	});
	
})();