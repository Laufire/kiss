// ?? elements and their data
//? cleaning the pod, removing pod's liseners to sources
//? changing sources
//? History and states
//? data-type list (non-duplicated) with methods add, remove, replace etc.
//? runtime bindings
//? data stores, as interfaces to existing data objects like localStorage
//? localStorage as a data source for O_O.values
//? An automatic UI generation check;
//? ?using CSS selectors + js arrays on the head element instead of ids?
//? ajax text templates - plugin

/*!
KISS v0.0.4

NO2 Liscence
*/
(function(window, document)
{
	"use strict";

	var O_O = window.O_O = new function()
	{
		document.documentElement.style.display = 'none'; //hide the document until DOM.ready fires

		var self = this;
		self.VERSION = '0.0.4';

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
				return obj[prop]();

			return obj[prop];
		}

		function setProp(obj, prop, value)
		{
			if(typeof obj[prop] == 'function')
				return obj[prop](value);

			return obj[prop] = value;
		}

		function remove(arr, val)
		{
			var i = arr.indexOf(val);

			if(i > -1)
				return arr.splice(i, 1);
		}

		//public
		self.class = {

			host: function()
			{
				var plugs = [],

				wrapper = this.wrapper = function(val, source)
				{
					for(var i = 0; i < plugs.length; ++i)
						plugs[i](val, source);
				};

				wrapper.plug = function(func)
				{
					plugs.push(func);

					return function() //a function used to unplug
					{
						wrapper.unplug(func);
					}
				}

				wrapper.unplug = function(func)
				{
					var i = plugs.indexOf(func);

					if(i > -1)
						plugs.splice(i, 1);
				}
			}

			//UI classes
			,box: function box(children/*consists of $children and child element data, saved until the element is set*/) //!the passed object will be modified
			{
				var self = this,
				$el, events = {},
				_$ = self.$ = {}, //the root for $ attributes
				plugs = {prop: {}, attr: {}, class: {}}, /*stores the 'unplug' functions from the hosts*/

				$data = extract(children, '$');
				extend(self, children); //add the chidren to the box
				children = Object.keys(children); //keep only the names for future reference

				_$.at = function(query/*keyAttr or a DOM.$.el*/, parent) /*sets the el for the element and loads it with existing html, attrs etc*/
				{
					self.$.$el = $el = get$el(query, parent);
					self.$.el = $el.el;

					if($data)
					{
						if($data.init)
						{
							$data.init();
							delete $data.init;
						}

						_$.digest({$: $data}); //load $data on to the element
						$data = undefined;
					}

					_$.id = $el.attr(keyAttr); //give the element an id
					$el.el.style.display = 'none';
					loadChildren();
					$el.el.style.display = '';

					return _$;
				}

				_$.val = function(newVal) //returns the default value when data is collected, sets the default values when hosts are directly assigned
				{
					if('readOnly' in $el.el) //?typeof undefined check //the element couldn't have html
					{
						var prop;

						if($el.el.type == 'checkbox') //?radio
							prop = 'checked';
						else
							prop = 'value';

						if(newVal)
						{
							_$.prop(prop, newVal);

							if(typeof newVal == 'function')
								_$.event('change', function(e)
								{
									newVal(e.currentTarget.value);
								});
						}
						else
							return _$.prop(prop);
					}
					else if(typeof newVal == 'function' && $el.el instanceof HTMLButtonElement)
					{
						_$.event('click', newVal)
					}
					else
					{
						if(newVal)
							_$.html(newVal);

						else
						{
							if(!children.length) //the element has no children
								return; //so return empty

							var ret = {};

							for(var i = 0; i < children.length; ++i)
							{
								var val,
									name = children[i],
									child = self[name];

								if(typeof child == 'object')
									val = self[name].$.val();
								else
									val = self[name]();

								if(typeof val != 'undefined')
									ret[name] = val;
							}

							return ret;
						}
					}

					return _$;
				}

				_$.html = function(newVal)
				{
					if(typeof newVal == 'undefined')
						return $el.html()

					$elRouter('prop', 'innerHTML', newVal);

					loadChildren();
				}

				_$.prop = function(prop, newVal)
				{
					return $elRouter('prop', prop, newVal);
				}

				_$.attr = function(attr, newVal)
				{
					return $elRouter('attr', attr, newVal);
				}

				_$.class = function(_class, newVal)
				{
					return $elRouter('class', _class, newVal);
				}

				_$.event = function(name, handler) //?make it friendly
				{
					if(events[name]) //the event already has a handler
						$el.off(name, events[name]); //remove the handler; having a single handler per event by design, this is to maintain simplicity and structure. 'A button could turn on only a single light'.

					$el.on(name, events[name] = function(e)
					{
						//!'this' context is lost, that could be got through the e.target
						handler(e, self)
					});

					return _$;
				}

				_$.digest = function(data)  /*setting properties for $el and children !This might alter the passed data object!*/
				{
					if(data.$)
					{
						var $data = extract(data, '$');

						for(var key in $data)
						{
							if(typeof $data[key] == 'object') //the prop is an enumerable
								for(var k in $data[key])
									_$[key](k, $data[key][k])
							else
								_$[key]($data[key])
						}
					}

					var keys = Object.keys(data)

					for(var i = 0; i < keys.length; ++i)
						if(self[keys[i]].$) //? instanceOf
							self[keys[i]].$.val(data[keys[i]]);
						else
							self[keys[i]](data[keys[i]]);

					return _$;
				}

				//helpers
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

					return _$;
				}

				function factory(method, prop)
				{
					return function(val)
					{
						$el[method](prop, val);
					}
				}

				var loadChildren = function()
				{
					for(var i = 0; i < children.length; ++i) //load child objects with matching elements
					{
						var childName = children[i];

						if(!get$el(childName, $el.el).el)
							continue;  //tags without matching objects are left intact; so to play nice with other libs

						//console.log(childName);
						var child = self[childName];

						if(typeof child == 'object')
						{
							if(child.constructor.name == '' || child.constructor.name == 'Object') //a plain object containing self attrs and children
								self[childName] = O_O.box(child);
						}
						else
							self[childName] = O_O.box({$:{val: child}}); //create an element with the assigned object as its default value

						self[childName].$.at(childName, $el.el);
					}
				}
			}

			,pod: function pod(options)
			{
				if(!options.$)
					options.$ = {};

				//? ?should pod have an 'init'
				options.$.init = function() //this is to queue the tasks after the el is set
				{
					itemNode = $el.$.prop('firstElementChild').cloneNode();

					$el.$.html('');

					self.source(options.source);
					options = undefined;
				}

				var source,
					self = this,
					idProp, //the name of the id property for the items
					item = options.item || {}, //!the empty object could be removed
					items = self.items = {},
					itemNode,
					exInit,

					$el = O_O.box(options); //the box that holds the items

				self.$ = $el.$;

				self.digest = function(options)
				{
					var keys = Object.keys(options)

					for(var i = 0; i < keys.length; ++i)
						self[keys[i]](data[keys[i]]);
				}

				self.source = function(_source) //sets the data source
				{
					source = _source;

					source.event.plug(listen);

					idProp = source.idProp;

					for(var i in source.items)
						self.add(source.items[i]);

					return self;
				}

				self.add = function(itemData) //adds an item
				{
					var id = itemData[idProp];

					$el.$.$el.append(itemNode.cloneNode()).attr(keyAttr, itemData[idProp]); //cone the node and append

					items[id] = O_O.box(extend({$: item}, itemData)); //register a box to the items array
					items[id].$.at(id, $el.el); //set its el
				}

				self.change = function(itemData) //changes an item
				{
					items[itemData[idProp]].$.digest(extend(itemData, {$: item}));
				}

				self.remove = function(id) //changes an item
				{
					items[id].$.el.remove();
					delete items[id];
				}

				self.event = O_O.host();

				function listen(event)
				{
					self[event.type](event.data);

					self.event(event, items[event.data[idProp]]);
				}
			}


			//Data Classes
			,value: function(val) // a host that stores a simple value
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

						host(newVal, self.val); //fires the change; self.val() could be called to get the prevVal
						val = newVal;
					}
				}

				var host = O_O.host();

				self.val.plug = host.plug;
				self.val.unplug = host.unplug;//?prototypal instead
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
					items = {},
					deleted = [],
					live = [],
					added = [],
					idProp = options.idProp,
					event = O_O.host();

				self.wrapper = function(param)
				{
					if(!param.length)
						return;

					if(typeof param[0] == 'object') //the first param is an object, so add or change items

						for(var i = 0; i < param.length; ++i)
						{
							if(items[param[i][idProp]])
								change(param[i]);
							else
								add(param[i]);
						}

					else //the first param id an id, so remove items
						for(var i = 0; i < param.length; ++i)
							remove(param[i]);

					return self.wrapper;
				}

				function add(data)
				{
					event({

						type: 'add',
						data: items[data[idProp]] = extend({}, data)

					}, self);
				}

				function change(data)
				{
					event({

						type: 'change',
						data: extend(items[data[idProp]], data)

					}, self);
				}

				function remove(id)
				{
					if(typeof items[id] == 'undefined')
						return;

					delete items[id];

					event({

						type: 'remove',
						data: id

					}, self);
				}

				self.wrapper(options.data);
				//options = undefined;

				self.wrapper.items = items;
				self.wrapper.event = event;
				self.wrapper.idProp = idProp;
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
					for(var i = 0, idx; i < arguments.length; ++i)
					{
						idx = plugs.indexOf(arguments[i]);

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
		self.box = function(data) //an element that could have children
		{
			return new O_O.class.box(data);
		}

		self.pod = function(data) //an element that acts as a collection
		{
			return new O_O.class.pod(data || {});
		}

		//Data wrappers
		self.host = function()
		{
			return new O_O.class.host().wrapper;
		}

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