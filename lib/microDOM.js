/*!
microDOM v0.0.2
a simple DOM utility for modern browsers (ie 10+)

NO2 Liscence.
*/

"use strict";

(function(document, window)
{
	window.DOM = new function()
	{
		var self = this; //this replacement
		
		self.$ = function(selector, parent)
		{
			return new el(selector, parent || document);
		};

		self.ready = function (handler)
		{
		   //?this might have a tiny possibilty of missing the event; as the event could fire asyncly during the execution
		   document.readyState.indexOf('c') > -1 ? handler() : document.addEventListener('DOMContentLoaded', handler);
		}
		
		var $ = self.$;
		
		function el(el /*a DOM element or a selector string*/, parent)
		{
			var self = this; //this replacement
			
			if(typeof el == 'string')
				el = parent.querySelector(el);
			
			if(!el)
				return; //an empty object is returned if the selector doesn't get a match
				
			self.el = el; //the selected or the fed DOM element
			
			self.$ = function(slector) //gets the first-child of the current element for the given selector
			{
				return $(slector, el);
			}
			
			self.html = function(value)
			{
				if(!arguments.length)
					return el.innerHTML;
					
				el.innerHTML = value;
				
				return self;
			}
			
			self.attr = function(attr, value)
			{
				if(arguments.length == 1)
					return el.getAttribute(attr);
				
				el.setAttribute(attr, value);
				
				return self;
			}
			
			self.prop = function(prop, value)
			{
				if(arguments.length == 1)
					return el[prop];
					
				el[prop] = value;
					
				return self;
			}
			
			self.class = function(classes, option)
			{
				/*
					a string alone returns the existence of the class
					an object sets on/off/toggle the classes acording to 1/0/-1 or true/false
					an array sets all the classes based on argument[1], if there ins't an argument[1] the default is 1 (on)
				*/
				if(arguments.length > 1)
				{
					if(typeof classes == 'string') //parses a string
						_class(classes, option);
					
					else if(Array.isArray(classes)) //parses an array
						for(var i = 0, l = classes.length; i < l; ++i)
							_class(classes[i], option);
							
				}
				else
				{
					if(typeof classes == 'string') //parses a string
						return el.classList.contains(classes);
					
					if(Array.isArray(classes)) //adds the array of classes
						for(var i = 0, l = classes.length; i < l; ++i)
							_class(classes[i], 1);
							
					else if(typeof classes == 'object')
						for(var i in classes) //parses an object
							_class(i, classes[i]);					
				}
				
				return self;
			}
			
			self.on = function(type, handler)
			{
				el.addEventListener(type, handler);
				
				return self;
			}

			self.off = function (type, handler)
			{
				el.removeEventListener(type, handler);
				
				return self;
			}
			
			//privates
			var _class = function(cName, action)
			{
				if(action === -1)
					return el.classList.toggle(cName);
					
				if(action) //allows 'true' to be used
					return el.classList.add(cName);
					
				el.classList.remove(cName); //falsy values removes the class name
			}
		}
	}
})(document, window)