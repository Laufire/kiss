/*!
microDOM v0.0.1
a simple DOM utility for modern browsers (ie 10+)

NO2 Liscence.

Thanks:
http://www.dustindiaz.com/smallest-domready-ever

*/

"use strict";

(function(document, window)
{
	window.DOM = new function()
	{
		//var DOM = this;
		
		this.$ = function(selector/*, parent*/)
		{
			return new el(selector, arguments.length > 1 ? arguments[1] : document);
		};

		this.ready = function (handler)
		{
		   /c/.test(document.readyState) ? handler() : document.addEventListener('DOMContentLoaded', handler);
		}
		
		var $ = this.$;
		
		function el(el /*a DOM element or a selector string*/, parent)
		{
			if(!el)
				return;
			
			if(typeof el == 'string')
				el = parent.querySelector(el);
			
			this.el = el;
			
			this.$ = function() //gets the first-child of the current element for the given selector
			{
				return $(arguments[0], el);
			}
			
			this.html = function()
			{
				if(!arguments.length)
					return el.innerHTML;
					
				el.innerHTML = arguments[0];
				
				return this;
			}
			
			this.attr = function()
			{
				if(arguments.length == 1)
					return el.getAttribute(arguments[0]);
				
				el.setAttribute(arguments[0], arguments[1]);
				
				return this;
			}
			
			this.prop = function()
			{
				if(arguments.length == 1)
					return el[arguments[0]];
					
				el[arguments[0]] =  arguments[1];
					
				return this;
			}
			
			this.class = function()
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
				
				return this;
			}
			
			this.on = function(type, handler)
			{
				el.addEventListener(type, handler);
			}

			this.off = function (type, handler)
			{
				el.removeEventListener(type, handler);
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