/*!
microDOM v0.0.5
a simple DOM utility for modern browsers (ie 10+)

NO2 Liscence.
*/

(function(document, window) {

	"use strict";
	
	window.DOM = new function() {
	
		var self = this, //'this' replacement (for shorter code size)
		
		$ = self.$ = function(elm, ancestor) {
		
			if(ancestor === undefined)
				return new $el(elm, document);
			
			return new $el(elm, ancestor.el || ancestor);
		};
		
		self.VERSION = '0.0.5';

		self.ready = function (handler) {
		
		   //?this might have a tiny possibilty of missing the event; as the event could fire asyncly during the execution
		   document.readyState.indexOf('c') > -1 ? handler() : document.addEventListener('DOMContentLoaded', handler);
		}
		
		self.new = function(tagName) { //a shortcut for document.createElement
		
			return document.createElement(tagName);
		}
		
		function $el(el /*a DOM element or a selector string*/, parent /*actualy an ancestor to be reseted*/) {
		
			var self = this; //this replacement
			
			if(typeof el == 'string')
				el = parent.querySelector(el);
			
			if(!el)
				return; //an empty object is returned if the selector doesn't get a match
			
			if(el.el) //el is a microDOM $el
				el = el.el;
			
			self.el = el; //the selected or the fed DOM element
			
			parent = el.parentElement; //the parent argument might be an ancestor, reset it to the actual parent of the element
			
			self.$ = function(elm) {//gets the first-child of the current element for the given selector
			
				return $(elm, el);
			}
			
			//changing node properties
			self.html = function(value) { //use $.text whenever possible (especially when the elemwnt doesn't have children)
			
				if(!arguments.length)
					return el.innerHTML;
				
				el.innerHTML = value;
				
				return self;
			}
			
			self.text = function(value) { //a faster and safer alterbative to $.html (doesn't allow html, so no child elements, no 'script injections')
			
				if(!arguments.length)
					return el.textContent;
				
				el.textContent = value;
				
				return self;
			}
			
			self.attr = function(attr, value) { //set the DOM node's attributes
			
				if(arguments.length == 1)
					return el.getAttribute(attr);
				
				el.setAttribute(attr, value);
				
				return self;
			}
			
			self.prop = function(prop, value) { //set the DOM elements 'js' properties
			
				if(arguments.length == 1)
					return el[prop];
				
				el[prop] = value;
					
				return self;
			}
			
			self.style = function(prop, value) {
			
				if(arguments.length == 1)
					return el.style[prop];
					
				el.style[prop] = value;
					
				return self;
			}
			
			self.class = function(classes, action) {
			
				/*
					arguments: 
					
						classes:
							a string alone returns the existence of the class
							an object sets on/off/toggle the classes acording to 1/0/-1 or true/false
							an array sets all the classes based on the argument 'action', if there ins't an 'action' specified '1 (on)' is assumed
							
						action:
							0 / falsy: turns off the classs(es)
							1 / truthy: turns on the classs(es)
							-1: toggle classs(es)
				*/
				var type = typeof classes;
				
				if(arguments.length > 1) {
				
					if(type == 'string') //parses a string
						classString(classes, action);
					
					else if(Array.isArray(classes)) //parses an array
						classArray(classes, action);
				}
				else {
				
					if(type == 'string') //parses a string
						return el.classList.contains(classes);
					
					if(Array.isArray(classes)) //adds the array of classes
						classArray(classes, 1);
					
					else if(type == 'object') {
					
						var keys = Object.keys(classes),
							i = 0,
							key;
						
						for(;i < keys.length; ++i) //parses an object
							key = keys[i], classString(key, classes[key]);
					}
				}
				
				return self;
			}
			
			//events
			self.on = function(type, handler) {
			
				el.addEventListener(type, handler);
				
				return self;
			}

			self.off = function (type, handler) {
			
				el.removeEventListener(type, handler);
				
				return self;
			}
			
			//addition and deletion
			self.prepend = function(elm) { //insert a child as the first-child
			
				return self.$(el.insertBefore(getEl(elm), el.firstChild));
			}
			
			self.append = function(elm) { //insert a child as the last-child
			
				return self.$(el.appendChild(getEl(elm)));
			}
			
			self.before = function(elm) { //insert a sibling before the element
			
				return $(parent.insertBefore(getEl(elm), el), parent);
			}
			
			self.after = function(elm) { //insert a sibling after the element
			
				return $(parent.insertBefore(getEl(elm), el.nextElementSibling), parent);
			}
			
			self.replace = function(newEl/*Should be a DOM element*/) { //replace the element with another
			
				if(!self.el)
					parent.appendChild(el = self.el = newEl);
				
				else {
				
					newEl = self.after(newEl);
					el.remove();
					el = self.el = newEl.el;
				}
				
				return self;
			}
			
			self.remove = function(elm) { //removes the current element
			
				if(elm)
					return self.$(elm).remove();
				
				self.el = undefined;
				
				el.remove();
				return el;
			}
			
			//helpers
			var classString = function(cName, action) {
			
				if(action === -1)
					return el.classList.toggle(cName);
					
				if(action)  //truthy values adds the class name
					return el.classList.add(cName);
					
				el.classList.remove(cName); //falsy values removes the class name
			}
			
			var classArray = function(classes, action) {
			
				if(action === -1)
					action = 'toggle';
					
				else if(action) //truthy values adds the class name
					action = 'add';
					
				else
					action = 'remove';//falsy values removes the class name
				
				for(var i = 0; i < classes.length; ++i)
					el.classList[action](classes[i]);
			}
			
			var getEl = function(elm) {
			
				if(typeof elm == 'string')
					return document.createElement(elm);
					
				return elm;
			}
		}
	}
})(document, window)