//?function.name is a read only property
//? data-type list (non-duplicated) with methods add, remove, replace etc.
//? runtime bindings
//? data stores, as interfaces to existing data objects like localStorage
//? localStorage as a data source for O_O.values
//? DOM node type to specify whether a node could have children
//? An automatic UI generation check;
//? ?using CSS selectors + js arrays on the head element instead of ids?
//? ajax text templates - plugin

/*!
KISS v0.0.3

NO2 Liscence
*/
(function(window, document)
{
	"use strict";

	var O_O = window.O_O = new function()
	{
		document.documentElement.style.display = 'none'; //hide the document until DOM.ready fires

		var self = this;
		self.VERSION = '0.0.1';

		var
			//helpers
			$ = DOM.$,

			//init
			hider, //a DOM.$ element that helps to hide the elements to be KISSed until kissing completes; //? could also be used to show a 'loading' indicator, it would be more cool...
			ready, //store the ready function
			keyAttr; //the keyAttr that marks the element to be KISSed

		self.keyAttr = function(attr) //change the keyAttr to be KISSed
		{
			keyAttr = attr;
			
			hider = $('script').before('style').html('[' + keyAttr + ']{display:none}')
		}
		
		self.keyAttr('id');//the default keyAttr is id
		
		self.ready = function(func) /*multiple read functions are not implemented, as it could make the code complex*/
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
			if(obj && obj[prop])
			{
				var ret = obj[prop];

				delete obj[prop];
				
				return ret;
			}
		}
		
		function load(target, source, props)
		{
			for(var i = 0; i < props.length; ++i)
				target[props[i]] = source[props[i]];
				
			return target;
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
		self.class = { //base classes that could be extended by plugins

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
			,element: function(data/*consits of $data and child element data, saved until the element is set*/) //!the passed object will be modified
			{
				var self = this;
				var $el;
				var events = {};
				var $data = extract(data, '$'); //extracts $data (attr, html, event etc)
				var plugs = {prop: {}, attr: {}, class: {}};  /*stores the 'unplug' functions from the hosts*/

				self.wrapper = function(p1, p2, p3)
				{
					if(arguments.length == 3) //!this could be reduced to a single checkm if the undefined vars doesn't cost a lot
						return self[p1](p2, p3); //elm('prop', 'value', 'hello')

					if(arguments.length == 2) //elm('html', 'hello'), elm('prop', 'value')
						return self[p1](p2);

					if(arguments.length == 1)
					{
						if(typeof p1 == 'string') //elm('html')
							return self[p1]();

						else
							return digest(p1); //the first param is a digestible object
					}

					return self.value();
				}

				extend(self.wrapper, data); //load the children on to the wrapper to allow writing code like App.title('Hello');
				data = undefined;

				self.el = function(query/*keyAttr or a DOM.$.el*/, parent) /*sets the el for the element and loads it with existing html, attrs etc*/
				{
					if(!arguments.length)
						return $el;

					$el = get$el(query, parent);

					self.$($data); //load $data on to the element
					$data = undefined;

					loadChildren(self.wrapper, $el.el);

					return self.wrapper;
				}

				self.value = function(newVal) //returns the default value on data collection, sets the default values when hosts are directly assigned
				{
					if('readOnly' in $el.el) //the element couldn't have html
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

					$el.on(name, events[name] = handler);

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
			
			,repeat: function(options)
			{
				var list,
					self = this,
					el = O_O.element(options.$), $el,
					item = options.item || {}, //!the empty object could be removed
					itemHtml;
					
				//element methods
				self.el = function(_el, parent)
				{
					el('el', _el, parent);
					
					$el = el('el');
					
					itemHtml = el('html');
					el('html', '');
					
					self.list(options.list);
					
					for(var i in list())
						self.add(list(i));
				}
				
				self.wrapper = function(p1, p2, p3)
				{
					if(!self[p1])
						el(p1, p2, p3); //!check for performence issues with undefined vars
						
					if(arguments.length == 1)
					{
						if(typeof p1 == 'string') //repeat('list')
							return self[p1]();

						else
							return digest(p1); //the first param is a digestible object
					}					
					else
						return self[p1](p2, p3);

					return self.value();
				}
				
				//repeat methods
				self.list = function(_list)
				{
					list = _list;
					
					list.event(monitor);
					
					return self;
				}
				
				self.add = function(itemData)
				{
					var _el = $el.append($(DOM.new('div')).html(itemHtml).prop('firstElementChild')).attr(keyAttr, itemData[list.id]);
					var id = itemData[list.id];
					
					self.wrapper[id] = O_O.element(extend({$: item}, itemData))('el', id, $el.el);
				}
				
				self.change = function(itemData)
				{
					self.wrapper[itemData[list.id]](extend(itemData, {$: item}));
				}
				
				function digest(data) /*setting properties for sel and children !This might alter the passed data object!*/
				{
					//?consider run time bindings; as of now only objects passed with the constructor could be modified

					if(data.$)
						$el(extract(data, '$'));

					for(var key in data)
						if(self.wrapper[key].plug)
							self.wrapper[key](data[key]);
						else
							self.wrapper[key]('value', data[key]);
				}
				
				function monitor(event, source)
				{
					self[event.type](event.data);
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

			,object: function(store)
			{
				this.wrapper = function(newData)
				{
					if(newData)
					{
						for(var key in newData)
							setProp(store, key, newData[key]);
					}
					else
					{
						var ret = {};

						for(var prop in store)
							ret[prop] = getProp(store, prop);

						return ret;
					}
				}

				extend(this.wrapper, store);
			}
			
			,list: function(options)
			{
				var self = this,
					store = {};
					
				self.event = O_O.value();
				
				self.wrapper = function(param)
				{
					if(typeof param == 'undefined')
						return store;
					
					if(Array.isArray(param))
					{
						for(var i = 0; i < param.length; ++i)
						{
							var id = param[i][options.id];
							
							self.event({
								
								type: id in store ? 'change' : 'add',
								data: extend(store[id] || {}, param[i])
								
							}, self);
							
							store[id] = param[i];
						}
					}
					else
					{
						return store[param]; //return the value with the given 'id'
					}
				}
				
				self.wrapper(options.data);

				//extend(self.wrapper, store);
				self.wrapper.event = self.event;
				self.wrapper.id = options.id;
			}
			
			//control classes
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
		self.element = function(p1, p2, p3) //an element that could have nested elements
		{
			if(arguments.length == 1) //the argument is an object, this is checked first as usual this will be the case
				return new O_O.class.element(p1).wrapper;
			
			//the following is to implement the wrapper interface, for developer convenience; it allows to reduce some redundant code
			//there are several arguments
			var data = {$:{}};
			
			if(arguments.length == 2)
				data.$[p1] = p2;
				
			else if(arguments.length == 3)
			{
				data.$[p1] = {};
				data.$[p1][p2] = p3;
			}
			
			return new O_O.class.element(data).wrapper;
		}
		
		self.repeat = function(p1, p2, p3) //an element that acts as a collection
		{
			if(arguments.length == 1) //the argument is an object, this is checked first as usual this will be the case
				return new O_O.class.repeat(p1).wrapper;
			
			//the following is to implement the wrapper interface, for developer convenience; it allows to reduce some redundant code
			//there are several arguments
			var data = {$:{}};
			
			if(arguments.length == 2)
				data.$[p1] = p2;
				
			else if(arguments.length == 3)
			{
				data.$[p1] = {};
				data.$[p1][p2] = p3;
			}
			
			return new O_O.class.repeat(data).wrapper;
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
		
		self.list = function(options)
		{
			return new O_O.class.list(options).wrapper;
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
		
		//Factories
		self.trans = function(process) //a function that transforms values
		{
			return function(host)
			{
				var inject = function(){return process(host())}

				inject.plug = function(outFunc)
				{
					return host.plug(function(val, source)
					{
						outFunc(process(val, source));
					});
				}

				return inject;
			}
		}
		
		//plugin wrapper
		self.plugin = function(name, plugin)
		{
			if(!plugin)
				return self.plugin[name];
				
			self.plugin[name] = plugin;
		}
	}

})(window, document);