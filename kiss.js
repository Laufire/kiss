//? History and states

//? is init needed; init & loadChildren
//? .box.append
//? .box.style
//? runtime bindings
//? renaming $.parent to $.root/host (to avoid possible confusion)

//? O_O.filter / .list.filter
//? .list assigning id on addition
//? master list

//? localStorage as a data source for O_O.values
//? data stores, as interfaces to existing data objects like localStorage

//? An automatic UI generation check
//? ajax text templates - plugin

/*!
KISS v0.0.6

NO2 Liscence
*/
(function(window, document)
{
	"use strict";

	var O_O = window.O_O = new function()
	{
		var O_O = this,

			//helpers
			$ = DOM.$,

			//init
			ready, //store the ready function
			keyAttr = 'id', //the keyAttr that marks the element to be KISSed (the default is 'id')

			//helpers functions
			isArray = Array.isArray,
			getKeys = Object.keys;

		O_O.VERSION = '0.0.6';

		O_O.keyAttr = function(attr) //change the keyAttr to be KISSed
		{
			keyAttr = attr;
		}

		O_O.ready = function(func) /*multiple read functions are not implemented, as it could make the code complex*/
		{
			ready = func;
		}

		DOM.ready(function()
		{
			var hash = location.hash.substr(1);
			
			if(ready) //! this doesn't seem to fire (as the script of the app hasn't been fully executed on DOM ready)
			{
				ready();
				O_O.state.set(hash);
			}

			else //a ready function is not available
				O_O.ready = function(func) //so execute it as soon as it's available
				{
					func();
					O_O.state.set(hash);
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
			var key, i = 0,
				keys = getKeys(obj);

			for(; i < keys.length; ++i)
				func(key = keys[i], obj[key]);
		}

		function diff(obj1, obj2)
		{
			var key, prop, i = 0,
				ret = {},
				keys = getKeys(obj1);

			for(; i < keys.length; ++i)
			{
				key = keys[i], prop = obj1[key];

				if(obj2[key] !== prop)
					ret[key] = prop;
			}

			return ret;
		}

		function extend(target)
		{
			var i = 0, source, keys;

			for(; i < arguments.length; ++i)
			{
				source = arguments[i];
				keys = getKeys(source);

				var j = 0, key, prop;

				for(; j < keys.length; ++j)
				{
					key = keys[j], prop = source[key];

					if(prop !== undefined)
						target[key] = prop;
				}
			}

			return target;
		}
		
		function clone(source, depth)
		{
			var i = 0,
				target = {},
				source, keys;

			if(!depth)
				depth = 1;
				
			keys = getKeys(source);

			var j = 0, key, prop;

			for(; j < keys.length; ++j)
			{
				key = keys[j], prop = source[key];

				if(prop !== undefined)
				{
					if(typeof prop == 'object' && depth)
						prop = clone(prop, depth - 1);
				
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
			var i = 0, prop;

			for(; i < props.length; ++i)
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

		//classes
		O_O.class = {

			host: function()
			{
				var plugs = [],

				wrap = this.wrap = function(val, source) //set the value and fire the event
				{
					for(var i = 0; i < plugs.length; ++i)
						plugs[i](val, source);
				};

				wrap.plug = function(func) //plugs a function to this host
				{
					plugs.push(func);

					return function() //a function used to unplug
					{
						wrap.unplug(func);
					}
				}

				wrap.unplug = function(func) //unplug an existing function
				{
					remove(plugs, func);
				}
			}

			//UI classes
			,box: function box(data/*consists of $data and child element data, saved until the element is set*/) //!the passed object will be modified
			{
				var self = this,
					_$, $el, elType,

					events = {},
					plugs = {prop: {}, attr: {}, class: {}}, /*stores the 'unplug' functions from the hosts*/

					$data = data.$,

					children = getKeys(extend(self, data));

				remove(children, '$'); //remove the $ from the children

				_$ = data.$ = self.$ = function(data)
				{
					enumerate(data, function(key, val)
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

				_$.set = function(data)
				{
					var i = 0, keys = getKeys(data);

					for(; i < keys.length; ++i)
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

					_$.$el = $el;
					_$.el = $el.el;
					_$.id = $el.attr(keyAttr); //give the element an id					
					elType = getElType($el.el); //the type of the element (to be used in .val and .default);
					
					init();
					loadChildren();

					return _$;
				}

				_$.remove = function()
				{
					var child, childName,
						i = 0;

					for(; i < children.length; ++i) //remove all children (boxes and pods)
					{
						childName = children[i], child = self[childName];

						child.$ && child.$.remove();

						delete self[childName];
					}

					enumerate(plugs, function(key, branch) //clear all plugs
					{
						enumerate(branch, function(key, unplug)
						{
							unplug(); //unplug the plug
						});
					});

					$el.el.remove();
				}

				_$.val = function(newVal) //helps with form serialization, returns the value when data is collected
				{
					var prop;

					if(elType == 3) //the element is an editable control (input, textarea, select)
						prop = 'value';

					else if(elType == 2) //the element is a checkable //? radio
						prop = 'checked';

					if(newVal !== undefined)
					{
						if(prop)
							$el.prop(prop, newVal);

						else
							$el.html(newVal);

						return _$;
					}
					else
					{
						if(prop)
							return _$.prop(prop);

						else if(elType == 0) //the element is an HTML so get the nested data
						{
							if(!children.length) //the element has no children
								return; //so return empty

							var i = 0, ret = {};

							for(; i < children.length; ++i)
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
				function init() //sets the default values (when hosts are directly assigned they are plugged)
				{
					if($data)
					{
						if($data.init)
						{
							$data.init(self);
							delete $data.init;
						}

						if($data.default)
						{

							var evt = 'change',
								def = $data.default;

							if(def.event)
								evt = def.event, def = def.value;

							delete $data.default;

							if(elType > 1) //the element is an editable control (input, textarea, select) or a check box
							{
								var prop = elType == 2 ? 'checked' : 'value';

								if(def.plug)
								{
									def.plug(function(val)
									{
										$el.prop(prop, val); //set the property

										//dispatch an event
										var evt = document.createEvent('UIEvent');
										evt.initUIEvent(evt, false, false, window, val);
										$el.el.dispatchEvent(evt);
									});

									$el.el.addEventListener(evt, function(e) //this event won't be unplugged
									{
										def(e.target[prop]);
									});

									$el.prop(prop, def()); //run the function with initial value
								}

								else
									return $el[method](prop, getVal(def)); //set the value

								return _$;
							}

							else if(elType == 1) //the element is a button (only a function could be the default value for buttons (as event handlers); other elements renderrs the returb vakues as therir contebt though
								_$.event('click', def);

							else
								_$.html(def);
						}
						
						_$($data); //load $data on to the element
						
						$data = undefined; //deleting the var
					}
				}

				//?? could this be exposed as $.type?
				function getElType(el) //returns the type of an element 0: display, 1: button, 2: toggle, 3: editable
				{
					if(el.required !== undefined)
					{
						var type = el.type;

						if(type == 'checkbox') //? radio
							return 2;

						else if(type == 'submit')
							return 1;

						else return 3; //the element is an editable
					}
					else if($el.el.formAction !== undefined) //the element is a button
						return 1;

					return 0; //the element is a display
				}

				function $elRouter(method, prop, newVal) //sets attr/prop/etc via $
				{
					if(newVal === undefined) //!arguments.length won't work here as the interface functions pass their undefined variables directly to this function
						return $el[method](prop);

					if(plugs[method][prop]) //if there already is a plug
					{
						plugs[method][prop](); //unplug the existing plug
						delete plugs[method][prop];
					}

					if(newVal.plug)
					{
						var func = factory(method, prop); //generate a function to change the value

						plugs[method][prop] = newVal.plug(func); //plug into the value and get the unplug function

						func(newVal()); //run the function with initial value
					}

					else
						return $el[method](prop, getVal(newVal)); //set the value

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
					var childName, child, i = 0;

					for(; i < children.length; ++i) //load child objects with matching elements
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
							self[childName] = O_O.box({$:{default: child}}); //create a box with the assigned object as its default value

						self[childName].$.at(childName, self);
					}
				}
			}

			,pod: function pod(options)
			{
				var source = options.source,
					self = this,
					idProp, //the name of the id property for the items
					item = options.item,
					items = self.items = {},
					itemNode,
					mode = options.mode || 'append',
					box = O_O.box({$: options.$}),
					options = undefined; //cleaning the var

				self.$ = extend({}, box.$);
				
				self.$.at = function(query, parent)
				{
					box.$.at(query, parent);
					
					itemNode = box.$.prop('firstElementChild'); //use the first chid element as the template for items
					box.$.html(''); //empty the pod's box

					if(source)
						self.source(source);					
				}

				self.set = function(data) //? is this necessary?
				{
					enumerate(data, function(key, val)
					{
						setProp(self[key], val);
					});
				}

				self.source = function(_source) //sets the data source
				{
					if(_source === undefined)
						return source;
					
					source = _source;

					source.event.plug(listen);

					idProp = source.idProp;

					enumerate(items, function(i) //remove the existing items in the list
					{
						self.remove(i);
					});
					
					enumerate(source.items, function(i, val) //add the existing items from the source
					{
						self.add(val);
					});

					return self;
				}

				self.add = function(itemData) //adds an item
				{
					var _item, id = itemData[idProp];

					box.$.$el[mode](itemNode.cloneNode()).attr(keyAttr, id); //clone the node and append

					//!passing the itemData to the constructor function allows it to act as an 'init' function and would help in handling diverse objects as a group
					_item = items[id] = O_O.box(new item(itemData)); //make a new box and register it to the items array

					_item.$.data = setItemData;

					_item.$.at(id, self).set(itemData); //set its el and its data
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
					var type = event.type,
						data = event.data,
						id = data[idProp],
						item = items[id];

					if(type != 'remove')
						self[type](data);

					else
						self.remove(id);

					self.event(event, item);
				}

				function setItemData(data)
				{
					data[idProp] = this.id;
					source.data(data)
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
					options.data = []; //allows the construction without initial data

				self.data = function(data) //? ?using .update instead
				{
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

				self.reset = function(data)
				{
					self.remove(getKeys(items));

					if(data)
						self.data(data);
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
					var i = 0, arg;

					for(; i < arguments.length; ++i)
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
			return new O_O.class.box(data || {});
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
			var i = 0, _watch = new O_O.class.watch;

			for(; i < arguments.length; ++i)
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

		//Monoliths
		O_O.state = new function()
		{
			var self = this,
			list = self.list = {};

			self.change = O_O.value();

			self.add = function(hash, action)
			{
				if(typeof hash == 'object')
					enumerate(hash, add);

				else
					add(hash, action);
			}

			self.remove = function(hash)
			{
				var action = list[hash];

				delete list[hash];

				return action;
			}

			self.set = function(hash)
			{
				//process the hash before setting it
				//nested routess as object trees + functions with /, *, :, ** etc

				if(!hash)
					hash = '/'; //the default hash

				self.change(hash);
			}

			self.change.plug(function(hash)
			{
				var action = list[hash];

				if(action)
					action(hash);

				self.set(hash);

				location.hash = hash;
			});

			function add(hash, action)
			{
				list[hash] = action;
			}
		}

		//plugin wrap
		O_O.plugin = function(name, plugin)
		{
			if(!plugin)
				return self.plugin[name];

			O_O.plugin[name] = plugin;
		}
	}

	//listen to changes in the history
	window.addEventListener('popstate', function()
	{
		O_O.state.set(location.hash.substr(1));
	});

})(window, document);