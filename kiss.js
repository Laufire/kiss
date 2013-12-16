﻿//? runtime bindings
//? removal of elements

/*!
KISS rw0.0.1

NO2 Liscence
*/
(function(window)
{
	"use strict";

	var O_O = new function()
	{
		//helpers
		//var $ = DOM.$

		//privates
		var keyAttr = 'id'; //the default keyAttr is id

		//init
		var hider;
		this.hide = function() //? ?could js be used to hide? ?Does JS have a class list like style list?
		{
			var frag = document.createDocumentFragment();

			hider = document.createElement('style');
			hider.setAttribute('type', 'text/css');
			hider.innerHTML = 'body{display:none}';

			document.head.insertBefore(hider, document.querySelector('script'));
		}

		this.hide();

		this.show = function()
		{
			hider.parentNode.removeChild(hider);
		}

		//helpers
		//var slice = Array.prototype.slice;

		function extend(target)
		{
			Array.prototype.slice.call(arguments, 1).forEach(function(source)
			{
				for(var key in source)
					if(source[key] !== undefined)
						target[key] = source[key];
			});

			return target
		}

		function extract(obj, prop)
		{
			var ret;

			if(obj && obj[prop])
			{
				ret = obj[prop];

				delete obj[prop];
			}

			return ret;
		}

		function get$el(key, parent)
		{
			return DOM.$('[' + keyAttr + '="' + key + '"]', parent);
		}

		function getVal(value)
		{
			if(typeof value == 'function') //the value is a function
				return value();

			return value;
		}

		function get(obj, key)
		{
			if(typeof obj[key] == 'function') //the key is a function
				return key();

			return obj[key];
		}

		function set(obj, key, value)
		{
			if(typeof obj[key] == 'function') //the key is a function
				return obj[key](value);

			return obj[key] = value;
		}

		//public
		this.keyAttr = function(key) //change the keyAttr to be KISSed
		{
			keyAttr = key;
		}

		this.classes = new function() /*base classes that could be extended by plugins*/
		{
			this.host = function(wrapper) //a base class for other hosts like value, trans, function etc
			{
				var self = this;
				var plugs = [];

				self.plug = function(func)
				{
					plugs.push(func);
					
					return function() //a function used to unplug
					{
						self.unplug(func);
					}
				}

				self.unplug = function(func)
				{
					var i = plugs.indexOf(func);

					if(i > -1)
						plugs.splice(i, 1);
				}

				self.fire = function(newVal, prevVal)
				{
					for(var i = 0, l = plugs.length; i < l; ++i)
						plugs[i](newVal, prevVal);
				}
			}

			//UI classes
			this.element = function(data/*saved untill the element is set*/)
			{
				var self = this;
				var $el;
				var events = {};
				var $data = extract(data, '$');
				
				var plugs = {prop: {}, attr: {}, class: {}};  /*stores the hosts like {propToChange: [wrapper function of the host, a generated function]*/

				self.wrapper = function(p1, p2, p3)
				{
					if(arguments.length == 3)
						return self[p1](p2, p3); //elm('prop', 'value', 'hello')

					if(arguments.length == 2) //elm('html', 'hello'), elm('prop', 'value')
						return self[p1](p2);

					if(arguments.length == 1)
					{
						if(typeof p1 == 'string') //elm('html')
							return self[p1]();

						else
							return digest(p1); //the first param is a digestable object
					}

					return self.value();
				}
				
				extend(self.wrapper, data);
				data = undefined;
				
				self.el = function(selector, parent) /*sets the el for the element and loads it with existing html, attrs etc*/
				{
					if(!arguments.length)
						return $el;

					$el = get$el(selector, parent);

					self.$($data);
					$data = undefined;

					loadChildren(self.wrapper, $el.el);

					return self.wrapper;
				}

				self.value = function(newVal) //sets the default values (when hosts or events are directly assigned)
				{
					if($el.el instanceof HTMLInputElement) //?textarea
					{
						var prop;

						if($el.el.type == 'checkbox') //?radio
							prop = 'checked';
						else
							prop = 'value';

						if(newVal)
						{
							self.prop(prop, newVal);

							if(typeof newVal == 'function')
								self.event('change', function(e)
								{
									newVal(e.currentTarget.value);
								});
						}
						else
							return self.prop(prop);
					}

					else if($el.el instanceof HTMLButtonElement)
					{
						if(!newVal)
							return;

						self.event('click', newVal);
					}

					else
					{
						if(newVal)
							self.html(newVal);

						else
						{
							var ret = {};

							for(var key in self.wrapper)
							{
								var val = self.wrapper[key]();

								if(typeof val != 'undefined')
									ret[key] = val;
							}

							return ret;
						}
					}

					return self.wrapper;
				}

				self.$ = function(data) /*sets multiple attributes like html, attr at once*/
				{
					for(var key in data)
					{
						if(typeof data[key] == 'object') //the prop is an enumerable
							for(var k in data[key])
								self[key](k, data[key][k])
						else
							self[key](data[key])
					}

					return self.wrapper;
				}

				self.html = function(newVal)
				{
					return $elRouter('prop', 'innerHTML', newVal);
				}

				self.prop = function(prop, newVal)
				{
					return $elRouter('prop', prop, newVal);
				}

				self.attr = function(attr, newVal)
				{
					return $elRouter('attr', attr, newVal);
				}

				self.class = function(_class, newVal)
				{
					return $elRouter('class', _class, newVal);
				}

				self.event = function(name, handler) //?make it friendly
				{
					if(events[name]) //the event already has a handler
						$el.off(name, events[name]); //remove the handler; having a single handler per event by design, this is to maintain simplicity and structure. 'A button could turn on only a single light'.

					$el.on(name, events[name] = handler.bind(self));

					return self.wrapper
				}

				//helpers
				function digest(data) /*setting properties for sel and children !This might alter the passed data object!*/
				{
					//?consider run time bindings; as of now only objects passed with the constructor could be modified

					if(data.$)
						self.$(extract(data, '$'));

					for(var key in data)
						if(self.wrapper[key].plug)
							self.wrapper[key](data[key]);
						else
							self.wrapper[key]('value', data[key]);
				}

				function $elRouter(method, prop, newVal) //sets attr/prop/etc via $
				{
					if(typeof newVal == 'undefined') //!arguments.length won't work here
						return $el[method](prop);

					if(plugs[method][prop]) //unplugs the existing plug
					{
						plugs[method][prop]();
						delete plugs[method][prop];
					}

					if(newVal.plug)
					{
						var func = factory(method, prop); //generate a function to change the value

						plugs[method][prop] = newVal.plug(func); //plug into the value and get unplug data

						func(newVal());
					}

					else
						return $el[method](prop, getVal(newVal));

					return self.wrapper;
				}

				function factory(method, prop)
				{
					return function(val)
					{
						$el[method](prop, val);
					}
				}

				var loadChildren = function(obj, el)
				{
					for(var childName in obj) //load child objects with matching elements
					{
						if(!get$el(childName, el).el)
							continue;  //tags without matching objects are left intact; so to play nice with other libs

						//console.log(childName);

						if(typeof obj[childName] == 'object') //a plain object containing self attrs and children
							obj[childName] = O_O.element(obj[childName]);

						else
							obj[childName] = O_O.element({$:{value: obj[childName]}}); //create an element with the assigned object as its default value

						obj[childName]('el', childName, el);

					}
				}
			}

			//Data Classes
			this.value = function(val) // a host that lists a simple value
			{
				var self = this;
				
				self.val = function(newVal)
				{
					if(!arguments.length)
						return val;

					else
					{
						if(newVal === val) //? ?use a trans to control equlaity checking?
							return;

						host.fire(newVal, val); //send both the new and the previous val
						val = newVal;
					}
				}
				
				var host = new O_O.classes.host(self.val);

				extend(self.val, host);
			}

			this.object = function(data)
			{
				this.wrapper = function(newData)
				{
					if(newData)
					{
						for(var key in newData)
							set(data, key, newData[key]);
					}
					else
					{
						var ret = {};

						for(var key in data)
							get(data, key);

						return ret;
					}
				}

				extend(this.wrapper, data);
			}

			this.watch = function()
			{
				//
			}
		}

		//Decorators
		//UI element wrappers
		this.element = function(data) //an element that could have nested elements
		{
			return new O_O.classes.element(data).wrapper;			
		}

		//Data wrappers
		this.value = function(val)
		{
			return new O_O.classes.value(val).val;
		}
		
		this.object = function(data)
		{
			return new O_O.classes.object(data).wrapper;
		}
		
		//Factories
		this.trans = function(process) //a function that transforms values
		{	
			return function(host)
			{
				var inject = function(){return process(host())}
				
				inject.plug = function(outFunc)
				{
					return host.plug(function(val, prev)
					{
						outFunc(process(val, prev));
					});
				}
				
				return inject;
			}
		}
	}

	window.O_O = O_O;

})(window);