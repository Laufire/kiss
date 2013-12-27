//? history state changes after O_O.ready executes, this causes a glitch (by rendering content regardless the state)
//? .list.event doesn't fire when the intial data is loaded. (initial data might need a removal)
//? event handlers could be passed to the constructors of .list
//? if else vs object keys
//? typescript
//? adding item.$.data
//? $wrap function
//? should loadChildren after construction (this will need caching of $ properties), not after .at
//? O_O.filter / .list.filter
//? .list assigning id on addition
//? .list.reset, invert
//? .box.append
//? todos could help fixing bugs
//? DOM caching
//? changing sources
//? History and states
//? localStorage as a data source for O_O.values
//? runtime bindings
//? data stores, as interfaces to existing data objects like localStorage
//? An automatic UI generation check
//? ajax text templates - plugin
/*!
KISS v0.0.5

NO2 Liscence
*/
(function(window, document)
{
	"use strict";
	
	var O_O = window.O_O = new function()
	{
		document.documentElement.style.display = 'none'; //hide the document until DOM.ready fires

		var O_O = this,
		
			//helpers
			$ = DOM.$,

			//init
			hider, //a DOM.$ element that helps to hide the elements to be KISSed until kissing completes; //? could also be used to show a 'loading' indicator, it would be more cool...
			ready, //store the ready function
			keyAttr, //the keyAttr that marks the element to be KISSed
			
			//helpers functions
			isArray = Array.isArray; 

		O_O.VERSION = '0.0.5';
		
		O_O.keyAttr = function(attr) //change the keyAttr to be KISSed
		{
			keyAttr = attr;
			
			hider = $('script').before('style').html('[' + keyAttr + ']{display:none}')
		}

		O_O.keyAttr('id'); //the default keyAttr is id
		
		O_O.ready = function(func) /*multiple read functions are not implemented, as it could make the code complex*/
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
				O_O.ready = function(func) //so execute it as soon as it's available
				{
					func();
					hider.remove();
				}
		});

		//helpers
		function remove(arr, val)
		{
			var i = arr.indexOf(val);

			if(i > -1)
				return arr.splice(i, 1);
		}
			
		function enumerate(obj, func)
		{
			var i, key, keys = Object.keys(obj);
			
			for(i = 0; i < keys.length; ++i)
				func(key = keys[i], obj[key]);
		}

		function diff(obj1, obj2)
		{
			var i, key, prop,
				ret = {},
				keys = Object.keys(obj1);
			
			for(i = 0; i < keys.length; ++i)
			{
				key = keys[i], prop = obj1[key];
				
				if(obj2[key] !== prop)
					ret[key] = prop;
			}
			
			//console.log(ret, obj1, obj2)
			
			return ret;
		}
		
		function extend(target)
		{
			var i, source, keys;
			
			for(i = 1; i < arguments.length; ++i)
			{
				source = arguments[i];
				keys = Object.keys(source);
				
				var j, key, prop;
				
				for(j = 0; j < keys.length; ++j)
				{
					key = keys[j], prop = source[key];
					
					if(prop !== undefined)
						target[key] = prop;
				}
			}
			
			return target;
		}
		
		function get$el(key, parent)
		{
			if(typeof key != 'object')
				return $('[' + keyAttr + '="' + key + '"]', parent);
				
			return $(key, parent);
		}

		function getVal(value)
		{
			if(typeof value == 'function')
				return value();

			return value;
		}

		function load(target, source, props)
		{
			var i, prop;
			
			for(i = 0; i < props.length; ++i)
				prop = props[i], target[prop] = source[prop];
				
			return target;
		}
		
		function getProp(obj, prop)
		{
			var prop = obj[prop];
			
			if(typeof  prop == 'function')
				return prop ();

			return prop;
		}

		function setProp(obj, prop, value)
		{
			var prop = obj[prop];
			
			if(typeof prop == 'function')
				return prop(value);

			return prop = value;
		}

		//public
		O_O.class = {

			host: function()
			{
				var plugs = [],

				wrap = this.wrap = function(val, source) //set the value and fire the event
				{
					for(var i = 0; i < plugs.length; ++i)
						plugs[i](val, source);
				};

				wrap.plug = function(func)
				{
					plugs.push(func);

					return function() //a function used to unplug
					{
						wrap.unplug(func);
					}
				}

				wrap.unplug = function(func)
				{
					remove(plugs, func);
				}
			}

			//UI classes
			,box: function box(data/*consists of $data and child element data, saved until the element is set*/) //!the passed object will be modified
			{
				var self = this,
					_$, $el, events = {},
					plugs = {prop: {}, attr: {}, class: {}}, /*stores the 'unplug' functions from the hosts*/				
				
					$data = data.$ || {},
				
					children = Object.keys(extend(self, data));		
				//? *here*
				remove(children, '$'); //remove the $ from the children
				
				var data = load({}, data, children),
				
				_$ = self.$ = function(data)
				{
					var keys = Object.keys(data);					

					enumerate($data, function(key, val)
					{
						if(typeof val == 'object') //the prop is an enumerable
							enumerate(val, function(k)
							{
								_$[key](k, val[k])
							});
						else if(_$[key])
							_$[key](val)
					});
					
					return _$;
				}				
				
				load(self, data, children);
				
				_$.set = function(data)
				{
					var keys = Object.keys(data);
					
					for(var i = 0; i < keys.length; ++i)
					{
						var key = keys[i],
							val = data[key],
							child = self[key];
						
						if(child)
							if(child.$)
								child.$.val(val); //the child is ui element
							
							else if(child.data) //the child is a data source
								child.data(val);
								
							else //the child is a value
								child(val);
					}
					
					return _$;
				}				
				
				_$.at = function(query/*keyAttr, a DOM.$.el or a DOM element*/, parent) /*sets the el for the element and loads it with existing html, attrs etc*/
				{
					if(!parent)
						$el = get$el(query, document);
					else
					{
						self.$.parent = parent;
						$el = get$el(query, parent.$.el);
					}
					
					self.$.$el = $el;
					self.$.el = $el.el;

					if($data.init)
						$data.init();
					
					_$($data); //load $data on to the element
					
					//data = undefined;

					_$.id = $el.attr(keyAttr); //give the element an id
					$el.el.style.display = 'none';
					loadChildren();
					$el.el.style.display = '';

					return _$;
				}
				
				_$.remove = function()
				{
					var i, child, childName;
					
					for(i = 0; i < children.length; ++i) //remove all children (boxes and pods)
					{
						childName = children[i], child = self[childName];
						
						child.$ && child.$.remove();
						
						delete self[childName];
					}
					
					//? should html be cleared to remove event handlers
					enumerate(plugs, function(key, branch) //clear all plugs
					{							
						enumerate(branch, function(key, unplug)
						{
							unplug(); //unplug the plug
						});
					});
					
					$el.el.remove();
				}

				_$.val = function(newVal) //helps with form serialization, returns the default value when data is collected, sets the default values when hosts are directly assigned
				{
					if($el.el.required !== undefined) //the element is an editable control (input, textarea, select), so it couldn't have html
					{
						var prop;

						//? type submit could cause problems
						if($el.el.type == 'checkbox') //? radio
							prop = 'checked';
						else
							prop = 'value';

						if(newVal !== undefined)
						{
							_$.prop(prop, newVal);
							
							if(newVal.plug)
								_$.el.addEventListener('change', function(e) //this doesn't count as the 'single' handler for the control
								{
									newVal(e.target[prop]);
								});
						}
						else
							return _$.prop(prop); //
					}
					else if($el.el.formAction !== undefined) //the element is a button
					{
						if(newVal)
							_$.event('click', newVal);
						else
							return;
					}
					else
					{
						if(newVal !== undefined)
							_$.html(newVal);
						else
						{
							if(!children.length) //the element has no children
								return; //so return empty

							var i, ret = {};

							for(i = 0; i < children.length; ++i)
							{
								var val,
									name = children[i],
									child = self[name];

								if(child && child.$)
									val = child.$.val();

								if(val !== undefined) //non form elements return undefined
									ret[name] = val;
							}

							return ret;
						}
					}

					return _$;
				}

				_$.html = function(newVal)
				{
					if(!arguments.length)
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

				_$.event = function(name, handler)
				{
					var el, eName,
						pos = name.indexOf(' ');
						
					if(pos > -1)
					{
						el = $el.$(name.substr(pos + 1));
						eName = name.substr(0, pos);
					}						
					else
					{
						el = $el;
						eName = name;
					}
						
					if(events[name]) //the event already has a handler
						el.off(eName, events[name]); //remove the handler; having a single handler per event by design, this is to maintain simplicity and structure. 'A button could turn on only a single light'.
					
						
					if(handler) //allows to remove the event listener by not passing a handler
						el.on(eName, events[name] = function(e)
						{
							//!'this' context is lost, that could be got through the e.target
							handler(e, self);
						});

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

				function loadChildren()
				{
					var i, childName, child;
					
					for(i = 0; i < children.length; ++i) //load child objects with matching elements
					{
						childName = children[i];

						if(!get$el(childName, $el.el).el)
							continue;  //tags without matching objects are left intact; so to play nice with other libs

						child = self[childName];

						if(typeof child == 'object')
						{
							//!Any plugin that needs to be loaded within a box should be constructed using a 'named' function
							if(child.constructor.name == '' || child.constructor.name == 'Object') //a plain object containing self attrs and children
								self[childName] = O_O.box(child); //build a box using the given 'data' and replace the data with it
						}
						else
							self[childName] = O_O.box({$:{val: child}}); //create a box with the assigned object as its default value

						self[childName].$.at(childName, self);
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
					itemNode = box.$.prop('firstElementChild').cloneNode(); //clone the node for reuse while adding elements
					box.$.html(''); //empty the pod

					self.source(options.source);
					//options = undefined;
				}

				var source,
					self = this,
					idProp, //the name of the id property for the items
					item = options.item || {}, //!the empty object could be removed
					items = self.items = {},
					itemNode,
					box = O_O.box({$: options.$});

				self.$ = box.$;

				self.set = function(data)
				{
					enumerate(data, function(key, val)
					{
						setProp(self[key], val);
					});
				}

				self.source = function(_source) //sets the data source
				{
					source = _source;

					source.event.plug(listen);

					idProp = source.idProp;

					enumerate(source.items, function(i, val)
					{
						self.add(val);
					});

					return self;
				}

				self.add = function(itemData) //adds an item
				{
					var id = itemData[idProp];

					box.$.$el.append(itemNode.cloneNode()).attr(keyAttr, id); //clone the node and append

					//make a new box and register it to the items array
					//item could be a constructor function (when bindings are needed) or a static object (when there aren't any bindings).
					items[id] = O_O.box(typeof item == 'object' ? item : new item(itemData)); //!passing the itemData to the constructor function allows it to act as an 'init' function and would help in handling diverse objects as a group
					
					items[id].$.at(id, self).set(itemData); //set its el and its data
				}

				self.change = function(itemData) //changes an item
				{
					items[itemData[idProp]].$.set(itemData);
				}

				self.remove = function(id) //removes an item
				{
					items[id].$.remove();
					delete items[id];
				}

				self.event = O_O.host();

				function listen(event)
				{
					if(event.type != 'remove')
					{
						self[event.type](event.data);
						self.event(event, items[event.data[idProp]]);
					}
					else
					{
						var id = event.data[idProp];
						
						self.remove(id);
						self.event(event, items[id]);
					}
				}
			}

			//Data Classes
			,value: function(val) // a host that stores a simple value
			{
				var self = this;

				self.val = function(newVal)
				{					
					if(arguments.length)
					{
						if(newVal === val) //this equality check is to break circular references (when the value is bound to a UI control) and false changes (the value is reset to the same value)
							return;

						self.val.prev = val;
						val = newVal;
						host(newVal, self.val); //fires the change; self.val() could be called to get the prevVal
					}
					
					return val;
				}

				var host = O_O.host();

				self.val.plug = host.plug;
				self.val.unplug = host.unplug;
			}

			,object: function(store) //supports the handling of dynamic JSON data
			{
				this.wrap = function(newData)
				{
					if(newData)
					{
						enumerate(newData, function(key, val)
						{
							setProp(store, key, val);
						});
					}
					else
					{
						var ret = {};

						enumerate(store, function(prop)
						{
							ret[prop] = getProp(store, prop);
						});

						return ret;
					}
				}

				extend(this.wrap, store);
			}

			,list: function(options)
			{
				var self = this,
					items = self.items = {},
					idProp = self.idProp = options.idProp,
					event = self.event = O_O.host();
				
				if(!options.data)
					options.data = []; //allows the construction withour initial data
					
				self.data = function(data) //? ?removing the wrap and using .update instead
				{
					//? a size changed event
					if(isArray(data))
						for(var i = 0; i < data.length; ++i)
							setData(data[i]);
					else
						setData(data);

					return self;
				}
				
				function setData(item)
				{
					if(items[item[idProp]])
						change(item);
					else
						add(item);
				}
				
				self.remove = function(ids)
				{
					if(isArray(ids))
						for(var i = 0; i < ids.length; ++i)
							remove(ids[i]);
					else
						remove(ids);
						
					return self;
				}
				
				self.length = 0;

				function add(data)
				{
					self.length++;
					
					//! converting the idProp to string might cause DB errors
					//? consider using a separate _id for storing the idProp
					var id = data[idProp] += ''; //convert the idProp to string (for storing it as an object key)
					
					event({

						type: 'add',
						id: id,
						data: items[id] = extend({}, data)

					}, self);					
				}

				function change(changes)
				{
					var id = changes[idProp];
					var data = items[id];
					
					event({

						type: 'change',
						id: id,
						changes: diff(changes, data),
						data: extend(data, changes)

					}, self);
				}
				
				function remove(id)
				{
					self.length--;
					
					event({

						type: 'remove',
						id: id,
						data: items[id]

					}, self);
					
					delete items[id];
				}

				self.data(options.data);
				options = undefined;
			}

			//control classes
			,watch: function() //? here: watches could be closely related to lists, spread sheet totaling (with a watch is not necessary as it could be done) with a .listen on the .list.event
			{
				var self = this,

					action = function(){},

					plug = function(val, source) //the action to take whent one of the watches change
					{
						action(val, source);
					},

					plugs = [];

				self.watch = function()
				{
					var i, arg;
					
					for(i = 0; i < arguments.length; ++i)
					{
						arg = arguments[i];
						
						if(plugs.indexOf(arg) == -1) //don't watch the val if it's being watched already
						{
							plugs.push(arg);
							arg.plug(plug);
						}
					}

					return self;
				}

				self.unwatch = function()
				{
					for(var i = 0; i < arguments.length; ++i)
					{
						plug = remove(plugs, arguments[i]);

						if(plug)
							plugs.unplug(plug);
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
		//UI wraps
		O_O.box = function(data) //an element that could have children
		{
			return new O_O.class.box(data);
		}

		O_O.pod = function(data) //an element that acts as a collection
		{
			return new O_O.class.pod(data || {});
		}

		//Data wraps
		O_O.host = function()
		{
			return new O_O.class.host().wrap;
		}

		O_O.value = function(val)
		{
			return new O_O.class.value(val).val;
		}

		O_O.object = function(data)
		{
			return new O_O.class.object(data).wrap;
		}

		O_O.list = function(options)
		{
			return new O_O.class.list(options);
		}

		//control wraps
		O_O.listen = function(val, func)
		{
			return {

				stop: val.plug(func)
			}
		}

		O_O.watch = function()
		{
			var i, _watch = new O_O.class.watch;

			for(i = 0; i < arguments.length; ++i)
				_watch.watch(arguments[i]);

			return _watch;
		}

		//Factories
		O_O.trans = function(process) //a function that transforms values
		{
			return function(host, param)
			{
				var inject = function(){return process(host(), host, param)}

				inject.plug = function(outFunc)
				{
					return host.plug(function(val, host)
					{
						outFunc(process(val, host, param));
					});
				}

				return inject;
			}
		}
		/*
		O_O.state = new function()
		{
			var self = this,
			
			var list = self.list = {};
			
			self.add = function(hash, action)
			{
				list[hash] = action;
			}
			
			self.remove = function(hash, action)
			{
				delete list[hash];
			}
			
			self.set = function(hash)
			{
				var action = list[hash];
				
				if(action)
					action(hash);					
			}
		}
		*/
		O_O.state = O_O.value();

		//plugin wrap
		O_O.plugin = function(name, plugin)
		{
			if(!plugin)
				return self.plugin[name];

			O_O.plugin[name] = plugin;
		}
	}
	
	window.addEventListener('popstate', function()
	{
		O_O.state(location.hash.substr(1));
		
		//O_O.state.set(location.hash.substr(1));
	});

})(window, document);