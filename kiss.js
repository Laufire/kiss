//? O_O.filter / .list.filter (.restrict)
//? passing the models around
//? master list

//? localStorage as a data source for O_O.values
//? data stores, as interfaces to existing data objects like localStorage

/*!
KISS v0.0.7

NO2 Liscence
*/
(function(window, document)
{
	"use strict";

	var changeState,
		ready, //stores the ready function
	
	O_O = window.O_O = new function()
	{
		var O_O = this,

			//helpers
			$ = DOM.$,

			//init
			keyAttr = 'id', //the keyAttr that marks the element to be KISSed (the default is 'id')

			//helpers functions
			isArray = Array.isArray,
			getKeys = Object.keys,
			dCode = decodeURIComponent;

		O_O.VERSION = '0.0.7';

		O_O.keyAttr = function(attr) //change the keyAttr to be KISSed
		{
			keyAttr = attr;
		}

		O_O.ready = function(func) /*multiple ready functions are not implemented, as it could make the code complex*/
		{
			ready = func;
		}

		//helpers		
		function emptyFunction()
		{
			return function(){}
		}
		
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

			for(; i < keys.length;)
				func(key = keys[i++], obj[key]);
		}

		function extend(target)
		{
			var i = 1, source, keys;

			for(; i < arguments.length;)
			{
				source = arguments[i++];
				keys = getKeys(source);

				var j = 0, key, prop;

				for(; j < keys.length;)
				{
					key = keys[j++], prop = source[key];

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
				source,
				key, prop,
				keys = getKeys(source);
			
			if(!depth)
				depth = 1;
			
			for(; i < keys.length;)
			{
				key = keys[i++], prop = source[key];

				if(prop !== undefined)
				{
					if(typeof prop == 'object' && depth)
						prop = clone(prop, depth - 1);
				
					target[key] = prop;
				}
			}

			return target;
		}
		
		function getFreeKey(obj) //returns a 'free' key name (with alpha-numeric) characters for the given object;
		{
			var key = '';

			do{

				key += (0 + (Math.round(Math.random() * 25))).toString(36);

			}while(obj[key] !== undefined);

			return key;
		}


		function extract(obj, prop)
		{
			var ret = obj[prop];

			delete obj[prop];

			return ret;
		}

		function get$el(key, parent)
		{
			if(typeof key != 'object')
				return $('[' + keyAttr + '=' + key + ']', parent);

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

			for(; i < props.length;)
				prop = props[i++], target[prop] = source[prop];

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
					for(var i = 0; i < plugs.length;)
						plugs[i++](val, source);
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
					_$, $el, elType, cleanUp,

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

					for(; i < keys.length;)
					{
						var key = keys[i++],
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
				
				_$.clear = function(name, tagName, boxProps)
				{
					var child, childName,
						i = 0;

					for(; i < children.length;) //remove all children (boxes and pods)
						_$.remove(children[i++]);

					enumerate(plugs, function(key, branch) //clear all plugs
					{
						enumerate(branch, function(key, unplug)
						{
							unplug(); //unplug the plug
						});
					});
					
					if(cleanUp)
						cleanUp(self);

					$el.el.remove();
				}
				
				_$.append = function(childName, tagName, boxProps)
				{
					var $el = self.$.$el.append(tagName).attr('id', childName),
						box = self[childName] = O_O.box(boxProps);
					
					return box.$.at(childName, self);
				}
				
				_$.remove = function(childName)
				{
					var $child = self[childName].$;

					if($child)
					{
						$child.clear();
						delete self[childName];
						children.splice(children.indexOf(childName), 1);
					}
				}

				/*/helps with form serialization, returns the value when data is collected
					custon controls may use this method to return a custom val*/
				_$.val = function(newVal)
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
							$el.text(newVal);

						return _$;
					}
					else
					{
						if(prop)
							return _$.prop(prop);

						else if(elType == 0) //the element is an HTML element
						{
							var length = children.length;
							
							if(!length) //the element has no children
								return _$.text(); //so return its text
								
							var i = 0,
								length = children.length,
								ret = {};
								
							for(; i < length;) // the element has children so get the nested data
							{
								var name = children[i++],
									child = self[name],
									val;

								if(child && child.$)
								{
									val = child.$.val()
									
									if(val !== undefined) //to skip buttons and the like
										ret[name] = val;
										
								}
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
				}
				
				_$.text = function(newVal)
				{
					if(!arguments.length)
						return $el.text()

					$elRouter('prop', 'textContent', newVal);
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
						el.off(eName, events[name]); //remove the handler; having a single handler per event is by design, this is to maintain simplicity and structure. 'A button could turn on only a single light'.


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
						var init = extract($data, 'init'),
							def = extract($data, 'default');
							
						cleanUp = extract($data, 'clear');
						
						if(def)
						{
							var evt = 'change';

							if(def.event)
								evt = def.event, def = def.value;

							if(elType > 1) //the element is an editable control (input, textarea, select) or a check box
							{
								var prop = elType == 2 ? 'checked' : 'value';

								if(def.plug)
								{
									//? should an event be fired
									def.plug(function(val)
									{
										$el.prop(prop, val); //set the property

										//dispatch an event
										var event = document.createEvent('UIEvent');
										event.initUIEvent(evt, true, true, window);
										$el.el.dispatchEvent(event);
									});

									$el.on(evt, function(e) //this event won't be unplugged
									{
										def(e.target[prop]);
									});

									$el.prop(prop, def()); //run the function with initial value
								}

								else
									return $el.prop(prop, getVal(def)); //set the value

								return _$;
							}

							else if(elType == 1) //the element is a button (only a function could be the default value for buttons (as event handlers); other elements renderrs the returb vakues as therir contebt though
								_$.event('click', def);

							else
								_$.text(def);
						}
						
						_$($data); //load $data on to the element
						
						if(init)
							init(self);
						
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
						var func = function(val) //a function to change the value
						{
							$el[method](prop, val);
						}

						plugs[method][prop] = newVal.plug(func); //plug into the value and get the unplug function

						func(newVal()); //run the function with initial value
					}

					else
						return $el[method](prop, getVal(newVal)); //set the value

					return _$;
				}

				function loadChildren()
				{
					var child, child$el, i = 0;

					for(; i < children.length;) //load child objects with matching elements
						loadChild(children[i++]);
				}
				
				function loadChild(childName)
				{
					var child, child$el;

					child$el = get$el(childName, $el.el);

					if(child$el.el) //tags without matching objects are left intact; so to play nice with other libs
					{
						child = self[childName];

						if(typeof child == 'object')
						{
							/*/Any plugin that needs to be loaded within a box should be constructed using a 'named' function*, else it'll be treated as an argument toa box constructor, this is simply because, I don't know how to check whether the object passed was an instanceOf a class*/
							if(child.constructor.name == '' || child.constructor.name == 'Object') //a plain object containing self attrs and children
								self[childName] = O_O.box(child); //build a box using the given 'data' and replace the data with it
						}
						else
							self[childName] = O_O.box({$:{default: child}}); //create a box with the assigned object as its default value

						self[childName].$.at(child$el, self); //plugins may have a plugin.$.at function to merge themself with the tree.
					}
				}
			}

			,pod: function pod(options)
			{
				var source = options.source,
					self = this,
					items = self.items = {}, //holds all the items
					order = self.order = [], //holds the list of ids in the order of addition
					event = self.event = O_O.host(),
					item = options.item,
					mode = options.mode || 'append',
					freeId = 0,
					box = O_O.box({$: options.$}),
					itemNode,
					options = undefined; //cleaning the var

				self.$ = extend({}, box.$);
				
				self.$.at = function(query, parent)
				{
					box.$.at(query, parent);
					
					getItemNode();

					if(source)
						self.source(source);					
				}
				
				self.item = function(_item, html)
				{
					box.$.html(html);
					
					if(_item)
						item = _item;
					
					if(html)
						getItemNode();
					
					if(source)
						addAll();
				}
				
				self.add = function(data) //adds an item
				{
					var _item,
						node = itemNode.cloneNode(true), //deep clone the node
						id = data._id;

					id = id !== undefined  ? id + '' : getFreeKey(items); //convert the id to string to maintain type safety
					
					box.$.$el[mode](node).attr(keyAttr, id); //add it to the pod
					
					/*/passing the itemData to the constructor function allows it to act as an 'init' function and would help in handling diverse objects as a group*/
					_item = items[id] = O_O.box(new item(data)); //make a new box and register it to the items array
					
					order.push(id);
					
					_item.$.at(node, self).set(data).data = setItemData; //set the items el, its data and $.data method
					
					event({
					
						type: 'add',
						item: _item
					});
				}

				self.remove = function(id) //removes an item
				{
					var item = items[id];
					
					item.$.clear();
					delete items[id];
					order.splice(order.indexOf(id), 1);
					
					event({
					
						type: 'remove',
						item: item
					});
				}

				self.source = function(_source) //sets the data source
				{
					source = _source;
					
					self.reset();
					
					addAll();
					
					source.event.plug(listen);
				}
				
				self.reset = function(data)
				{
					enumerate(items, function(i) //remove the existing items in the pod
					{
						self.remove(i);
					});
					
					freeId = 0;
					
					if(data)
						for(var i = 0; i < data.length;) //add the given data
							self.add(data[i++]);
				}
				
				self.refresh = function() //mirror the order changes in the source
				{
					var i = 0, data, id, sId, item$, _items = {},
						sOrder = source.order,
						items = source.items;
				
					for(; i < sOrder.length; i++)
					{
						sId = sOrder[i];
						id = order[i];
						
						_items[id] = items[sId];
						data = source.items[sId];
						
						item$ = items[id].$;
						item$.id = order[i] = data._id;
						item$.set(data);						
					}
					
					self.items = items = _items;
					self.order = order;
				}
				
				function getItemNode()
				{
					itemNode = box.$.prop('firstElementChild'); //use the first child element as the template for items
					box.$.html(''); //empty the pod's box
				}
				
				function addAll()
				{
					var i = 0, item,
						order = source.order;
					
					for(; i < order.length;) //add the existing items from the source
					{
						item = source.items[order[i++]];
						self.add(item);
					}
				}
				
				function listen(event) //listen to the events from the source-list
				{
					var data = event.data,
						id = data._id,
						type = event.type;						
					
					if(type == 'add')
						self.add(data);
					
					else if(type == 'change')
						items[id].$.set(data);
						
					else //remove the item
						self.remove(id);
				}
				
				function setItemData(data)
				{
					source.change(this.id, data);
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
					order = self.order = [], //holds the list of ids in the order of addition, is used by .pod-s to refresh data.
					event = self.event = O_O.host();

				self.length = O_O.value(0);
				
				self.add = function(data)
				{
					var id = data._id;

					id = id !== undefined  ? id + '' : getFreeKey(items); //convert the id to string to maintain type safety
					
					order.push(data._id = id);
					items[id] = data;
					
					self.length(order.length);

					event({

						type: 'add',
						data: data

					}, self);
				}
				
				self.change = function(id, changes)
				{
					var data = items[id];
					
					extend(data, changes);
					
					event({

						type: 'change',
						data: data,
						changes: changes

					}, self);
				}
				
				self.remove = function(ids)
				{
					if(isArray(ids))
						for(var i = 0; i < ids.length;)
							remove(ids[i++]);
					else
						remove(ids);

					return self;
				}

				self.reset = function(data)
				{
					self.remove(getKeys(items));

					if(data)
						for(var i = 0; i < data.length;)
							self.add(data[i++]);
				}
				
				function remove(id) //? needed only if multiple removes are to be allowed
				{
					var data = items[id];
					
					if(!data)
						return;
					
					delete items[id];
					order.splice(order.indexOf(id), 1);
					
					self.length(order.length);
					
					event({

						type: 'remove',
						data: data
						
					}, self);					
				}

				if(options.data)
					self.reset(options.data);
					
				options = undefined;
			}

			//control classes
			,watch: function() //? here: watches could be closely related to lists, spread sheet totaling (with a watch is not necessary as it could be done) with a .listen on the .list.event
			{
				var self = this,

					action = emptyFunction(),

					plug = function(val, source) //the action to take whent one of the watches change
					{
						action(val, source);
					},

					plugs = [];

				self.watch = function()
				{
					var i = 0, arg;

					for(; i < arguments.length;)
					{
						arg = arguments[i++];

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
					for(var i = 0; i < arguments.length;)
					{
						plug = remove(plugs, arguments[i++]);

						if(plug)
							plugs.unplug(plug);
					}

					return self;
				}

				self.clear = function()
				{
					for(var i = 0; i < plugs.length;)
						plugs[i++].unplug(plug);

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
			return new O_O.class.list(options || {});
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

			for(; i < arguments.length;)
				_watch.watch(arguments[i++]);

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
			var self = this;
			
			/*/use 'change' to change the state and set the history*/
			self.change = O_O.value();
			
			self.routes = {}; // to be overrided by the user provided routes

			/*/use 'set' if the state has to be changed without affecting the history*/
			self.set = function(hash) //processes the hash, ececutes the related function and changes the hash on sucessful execution
			{
				if(!hash) //firefox sets an 'undefined' has when there's no hash
					hash = ''; //the default hash
					
				if(resolve(self.routes, hash)) //the state is set if the route is resolved successfully (a non-truthy value is returned)
					return;
			}

			self.change.plug(function(hash) //listens to the hash changes and sets the route
			{
				self.set(hash);
				window.location.hash = hash;
			});
			
			/*/route resolution
			
				state.routes = {
				
					a: {
					
						'*' : {
						
							b: {
							
								'*': function(finalParam, otherCollectedParamsArray)
								{
									//
								}
							}
						}
					}
				}
				
				state.change('a/param1/b/param/2') resolves to a.*.b('param/2', [param1])
			*/
			function resolve(route, path, params) //resolves the route
			{
				if(!route)
					return 1; //notify failure if the route is not suresolved
				
				if(!params)
					params = [];
				
				if(typeof route == 'function')
					return route(dCode(path), params);
				
				var pos = path.indexOf('/'),
					part = pos > 0 ? path.substr(0, pos) : path,
					target = route[part],
					rest = path.substr(pos + 1);
				
				if(!target)
				{
					params.push(dCode(part));
					target = route['*'];
				}
				
				return resolve(target, rest, params); //move one level deeper
			}
		}

		//plugin wrap
		O_O.plugin = function(name, plugin)
		{
			if(!plugin)
				return self.plugin[name];

			O_O.plugin[name] = plugin;
		}
		
		changeState = O_O.state.change;
	}

	//listen to changes in the history
	
	
	DOM.ready(function()
	{
		var hash = location.hash.substr(1);
		
		if(ready) //! this doesn't seem to fire (as the script of the app hasn't been fully executed on DOM ready)
		{
			ready();			
			initState(hash); //resolve the provided state
		}

		else //a ready function is not available
			O_O.ready = function(func) //so execute it as soon as it's available
			{
				func();
				initState(hash); //resolve the provided state
			}
	});
	
	function initState(hash)
	{
		changeState(hash); //resolve the provided state
		
		window.addEventListener('popstate', function()
		{
			changeState(location.hash.substr(1));
		});
	}
})(window, document);