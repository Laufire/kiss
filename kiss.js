//? DOM node tpe to specify whether a node could have children
//? An automatic UI generation check;
//? JSONP instead of requirejs (check browserify)
//? friendly events
//? localStorage as a data source for O_O.values
//? data-type list (non-duplicated) with methods add, remove, replace etc.
//? ?using CSS selectors + js arrays on the head element instead of ids?
//? runtime bindings
//? ajax text templates - plugin

/*!
KISS rw0.0.1

NO2 Liscence
*/
(function(window, document)
{
	"use strict";

	var O_O = window.O_O = new function()
	{
		document.documentElement.style.display = 'none'; //hide the document untill DOM.ready fires

		var self = this;
		self.VERSION = '0.0.1';

		var
			//helpers
			$ = DOM.$,

			//init
			hider, //a DOM.$ element that helps to hide the elements to be KISSed untill kissing completes; //? could also be used to show a 'loading' indicator, it would be more cool...
			ready, //store the ready function
			keyAttr; //the keyAttr that marks the element to be KISSed

		self.keyAttr = function(attr) //change the keyAttr to be KISSed
		{
			keyAttr = attr;
			
			hider = $(document.head).$('script').before('style').html('[' + keyAttr + ']{display:none}')
		}
		
		self.keyAttr('id');//the default keyAttr is id
		
		self.ready = function(func)
		{
			ready = func;
		}

		DOM.ready(function()
		{
			document.documentElement.style.display = '';
			
			if(ready)
			{
				ready();
				hider.remove();
			}

			else //a ready function is not available
				self.ready = function(func) //so execute it as soon as it's available
				{
					func();
					hider.remove();
				}
		});

		//helpers
		//var slice = Array.prototype.slice;
		
		function iterate(array, func)
		{
			for(var i = 0; i < array.length; ++i)
				func(array[i]);
		}
		
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
			return $('[' + keyAttr + '="' + key + '"]', parent);
		}

		function getVal(value)
		{
			if(typeof value == 'function')
				return value();

			return value;
		}

		function getProp(obj, prop)
		{
			if(typeof obj[prop] == 'function')
				return prop();

			return obj[prop];
		}

		function setProp(obj, prop, value)
		{
			if(typeof obj[prop] == 'function')
				return obj[prop](value);

			return obj[prop] = value;
		}

		//public
		self.class = { /*base classes that could be extended by plugins*/

			host: function()
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

				self.fire = function(val, source)
				{
					for(var i = 0; i < plugs.length; ++i)
						plugs[i](val, source);
				}
			}

			//UI classes
			,element: function(data/*saved untill the element is set*/)
			{
				var self = this;
				var $el;
				var events = {};
				var $data = extract(data, '$'); //?could input  skip the $
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

				self.el = function(query, parent) /*sets the el for the element and loads it with existing html, attrs etc*/
				{
					if(!arguments.length)
						return $el;

					$el = get$el(query/*keyAttr or a DOM.$.el*/, parent);

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

						else if (typeof obj[childName] == 'function')
						{
							if(obj[childName].plug)
								obj[childName] = O_O.element({$:{value: obj[childName]}}); //assign the pluggable to the object's default value
								
							//create an element with the assigned object as its default value
						}
						else
							obj[childName] = O_O.element({$:{value: obj[childName]}}); //create an element with the assigned object as its default value

						obj[childName]('el', childName, el);

					}
				}
			}

			//Data Classes
			,value: function(val) // a host that lists a simple value
			{
				var self = this;

				self.val = function(newVal)
				{
					if(!arguments.length)
						return val;

					else
					{
						if(newVal === val) //? Could equality check be passed to the plugged function?
							return;

						host.fire(newVal, self.val); //fires the change; self.val() could be called to get the prevVal
						val = newVal;
					}
				}

				var host = new O_O.class.host(self.val);

				extend(self.val, host);
			}

			,object: function(data)
			{
				this.wrapper = function(newData)
				{
					if(newData)
					{
						for(var key in newData)
							setProp(data, key, newData[key]);
					}
					else
					{
						var ret = {};

						for(var prop in data)
							getProp(data, prop);

						return ret;
					}
				}

				extend(this.wrapper, data);
			}
			
			,watch: function() //? here: watches could be closely related to lists, spread sheet totaling
			{
				var self = this,
				
					action = function(){},
					
					plug = function(val, source) //the function executes the triggered val and the watch itself
					{
						action(val, source);
					},
				
					plugs = [];
				
				self.watch = function()
				{
					for(var i = 0; i < arguments.length; ++i)
						if(plugs.indexOf(arguments[i]) == -1) //don't watch the val if it's being watched already
						{
							plugs.push(arguments[i]);
							arguments[i].plug(plug);
						}
					
					return self;
				}
				
				self.unwatch = function()
				{
					for(var i = 0, idx = plugs.indexOf(arguments[i]); i < arguments.length; ++i)
					{
						if(idx > -1) //if the element is already being watched
							plugs.splice(idx, 1)[0].unplug(plug);
					}
					
					return self;
				}
				
				self.clear = function()
				{
					for(var i = 0; i < plugs.length; ++i)
						plugs[i].unplug(plug);
						
					plugs = [];
					
					return self;
				}
				
				self.action = function(newAct)
				{
					action = newAct;
					
					return self
				}
			}
		}

		//Decorators
		//UI wrappers
		self.element = function() //an element that could have nested elements
		{
			if(arguments.length == 1)
				return new O_O.class.element(arguments[0]).wrapper;
			
			var data = {};
			data.$ = {};
			
			if(arguments.length == 2)
				data.$[arguments[0]] = arguments[1];
				
			else if(arguments.length == 3)
			{
				data.$[arguments[0]] = {};
				data.$[arguments[0]][arguments[1]] = arguments[2];
			}
			
			return new O_O.class.element(data).wrapper;
		}

		//Data wrappers
		self.value = function(val)
		{
			return new O_O.class.value(val).val;
		}

		self.object = function(data)
		{
			return new O_O.class.object(data).wrapper;
		}
		
		//control wrappers
		self.listen = function(val, func)
		{
			return {
			
				stop: val.plug(func)
			}
		}
		
		self.watch = function()
		{
			var _watch = new O_O.class.watch;
			
			iterate(arguments, _watch.watch);
			
			return _watch;
		}
		
		//plugin wrapper
		self.plugin = function(name, plugin)
		{
			if(!plugin)
				return self.plugin[name];
				
			self.plugin[name] = plugin;
		}			

		//Factories
		self.trans = function(process) //a function that transforms values
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

})(window, document);