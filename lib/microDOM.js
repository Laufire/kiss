/*!
microDOM v0.0.3
fix: 02
a simple DOM utility for modern browsers (ie 10+)

NO2 Liscence.
*/

"use strict";

(function(document, window)
{
	window.DOM = new function()
	{
		var self = this; //this replacement
		
		self.VERSION = '0.0.3';
		
		var $ = self.$ = function(query, ancestor)
		{
			return new $el(query, ancestor || document);
		};

		self.ready = function (handler)
		{
		   //?this might have a tiny possibilty of missing the event; as the event could fire asyncly during the execution
		   document.readyState.indexOf('c') > -1 ? handler() : document.addEventListener('DOMContentLoaded', handler);
		}
		
		//a shortcyt for document.createElement
		self.new = function(tag)
		{
			return document.createElement(tag);
		}
		
		function $el(el /*a DOM element or a selector string*/, parent /*actualy an ancestor to be reseted*/)
		{
			var self = this; //this replacement
			
			if(typeof el == 'string')
				el = parent.querySelector(el);
			
			if(el instanceof $el) //el is a microDOM $el
				el = el.el;
			
			if(!el)
				return; //an empty object is returned if the selector doesn't get a match
				
			self.el = el; //the selected or the fed DOM element
			
			parent = el.parentElement; //the parent argument might be an ancestor, reset it to the actual parent of the element
			
			self.$ = function(query) //gets the first-child of the current element for the given selector
			{
				return $(query, el);
			}
			
			//changes
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
						classArray(classes.split(/\s/), option);
					
					else if(Array.isArray(classes)) //parses an array
						classArray(classes, option);							
				}
				else
				{
					if(typeof classes == 'string') //parses a string
						return el.classList.contains(classes);
					
					if(Array.isArray(classes)) //adds the array of classes
						classArray(classes, 1);
					
					else if(typeof classes == 'object')
						for(var i in classes) //parses an object
							classString(i, classes[i]);					
				}
				
				return self;
			}
			
			//events
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
			
			//addition and deletion
			self.prepend = function(tag)
			{
				return self.$(el.insertBefore(getEl(tag), el.firstChild));
			}
			
			self.append = function(tag)
			{
				return self.$(el.appendChild(getEl(tag)));
			}
			
			self.before = function(tag)
			{
				return $(parent.insertBefore(getEl(tag), el), parent);
			}
			
			self.after = function(tag)
			{
				return $(parent.insertBefore(getEl(tag), el.nextElementSibling), parent);
			}
			
			self.replace = function(newEl/*Should be a DOM element*/)
			{
				if(!self.el)
				{
					el = self.el = newEl;
					parent.appendChild(el);
				}
				else
				{
					newEl = self.after(newEl);
					el.remove();
					el = self.el = newEl.el;
				}
				
				return self;
			}
			
			self.remove = function(query)
			{
				if(query)
					return self.$(query).remove();
				
				self.el = undefined;
				
				el.remove();
				return el;
			}
			
			//privates
			var classString = function(cName, action)
			{
				if(action === -1)
					return el.classList.toggle(cName);
					
				if(action)  //truthy values adds the class name
					return el.classList.add(cName);
					
				el.classList.remove(cName); //falsy values removes the class name
			}
			
			var classArray = function(classes, action)
			{
				if(action === -1)
					action = 'toggle';
					
				else if(action) //truthy values adds the class name
					action = 'add';
					
				else
					action = 'remove';//falsy values removes the class name
				
				for(var i = 0, l = classes.length; i < l; ++i)
					el.classList[action](classes[i]);
			}
			
			var getEl = function(query)
			{
				if(typeof query == 'string')
					return document.createElement(query);
					
				return query;
			}
		}
	}
})(document, window)