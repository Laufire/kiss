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
		var s = this; //this replacement
		
		s.$ = function(selector/*, parent*/)
		{
			return new el(selector, arguments.length > 1 ? arguments[1] : document);
		};

		s.ready = function (handler)
		{
		   //?this might have a tiny possibilty of missing the event; as the event could fire asyncly during the execution
		   document.readyState.indexOf('c') > -1 ? handler() : document.addEventListener('DOMContentLoaded', handler);
		}
		
		var $ = s.$;
		
		function el(el /*a DOM element or a selector string*/, parent)
		{
			var s = this; //this replacement
			
			if(typeof el == 'string')
				el = parent.querySelector(el);
			
			if(!el)
				return; //an empty object is returned if the selector doesn't get a match
				
			s.el = el; //the selected or the fed DOM element
			
			s.$ = function() //gets the first-child of the current element for the given selector
			{
				return $(arguments[0], el);
			}
			
			s.html = function()
			{
				if(!arguments.length)
					return el.innerHTML;
					
				el.innerHTML = arguments[0];
				
				return s;
			}
			
			s.attr = function()
			{
				if(arguments.length == 1)
					return el.getAttribute(arguments[0]);
				
				el.setAttribute(arguments[0], arguments[1]);
				
				return s;
			}
			
			s.prop = function()
			{
				if(arguments.length == 1)
					return el[arguments[0]];
					
				el[arguments[0]] =  arguments[1];
					
				return s;
			}
			
			s.class = function()
			{
				/*
					a string alone returns the existence of the class
					an object sets on/off/toggle the classes acording to 1/0/-1 or true/false
					an array sets all the classes based on argument[1], if there ins't an argument[1] the default is 1 (on)
				*/
				if(arguments.length > 1)
				{
					if(typeof arguments[0] == 'string') //parses a string
						_class(arguments[0], arguments[1]);
					
					else if(Array.isArray(arguments[0])) //parses an array
						for(var i = 0, l = arguments[0].length; i < l; ++i)
							_class(arguments[0][i], arguments[1]);
							
				}
				else //a string alone returns the existense of the class
				{
					if(typeof arguments[0] == 'string') //parses a string
						return el.classList.contains(arguments[0]);
					
					if(Array.isArray(arguments[0])) //adds the array of classes
						for(var i = 0, l = arguments[0].length; i < l; ++i)
							_class(arguments[0][i], 1);
							
					else if(typeof arguments[0] == 'object')
						for(var i in arguments[0]) //parses an object
							_class(i, arguments[0][i]);					
				}
				
				return s;
			}
			
			s.on = function(type, handler)
			{
				el.addEventListener(type, handler);
				
				return s;
			}

			s.off = function (type, handler)
			{
				el.removeEventListener(type, handler);
				
				return s;
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