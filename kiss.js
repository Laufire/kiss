//? treating displays as clickables
//? pod->box : list->?
//? box.reset / using null or ''
//? remove O_O.object
//? box.data (for live data)
//? Could $.html and $.text be cleaned?
//? pods from arrays (automatic data bindings without an item constructor)
//? localStorage as a data source for O_O.values
//? data stores, as interfaces to existing data objects like localStorage
//? Renaming list.update to list.save.

/*!
	KISS		-	a stupid js lib, that enables the easy development of structured and data driven Applications.
	Version		-	0.0.9
	Liscence	-	NO2 Liscence
	Dependencies	-	microDOM-v0.0.5
	
	sponsor			-	laufire technologies
	
	inspiration		-	knockout, angular, backbone, todoMVC
	tools			-	Notepad++
	sites			-	stakeoverflow, google
*/

(function(window, document, DOM) {

	"use strict";

	var changeState,
		ready, // stores the ready function
	
	O_O = window.O_O = new function() { // the library

		var O_O = this,

			/* Defaults */
			keyAttr = 'id', // the keyAttr that marks the element to be KISSed (the default is 'id')
			
			/* Helpers */
			$ = DOM.$,

			getKeys = Object.keys,
			dCode = decodeURIComponent;

		O_O.VERSION = '0.0.9';

		O_O.keyAttr = function(attr) { // change the keyAttr to be KISSed
		
			keyAttr = attr;
		}

		O_O.ready = function(func) { /*multiple ready functions are not implemented, as it could make the code complex*/
			
			ready = func;
		}

		/* Utility Functions */
		function emptyFunction() {
		
			return function(){}
		}
		
		function remove(arr, val) {
		
			var i = arr.indexOf(val);

			if(i > -1)
				return arr.splice(i, 1);
		}

		function enumerate(obj, func) {
		
			var key,
				keys = getKeys(obj),
				i = 0, l = keys.length;

			for(; i < l;)
				func(key = keys[i++], obj[key]);
		}

		function extend(target) {

			var source, keys,
				i = 1, l = arguments.length;

			for(; i < l;) {
			
				source = arguments[i++];
				keys = getKeys(source);

				var key, prop,
					i1 = 0, l1 = keys.length;

				for(; i1 < l1;) {
				
					key = keys[i1++];
					prop = source[key];

					if(prop !== undefined)
						target[key] = prop;
				}
			}

			return target;
		}
		/* //? for future use
		function clone(source, depth) {

			var target = {},
				key, prop,
				keys = getKeys(source),
				i = 0, l = keys.length;
			
			if(!depth)
				depth = 1;
			
			for(; i < l;) {
			
				key = keys[i++];
				prop = source[key];

				if(prop !== undefined) {
				
					if(typeof prop == 'object' && depth)
						prop = clone(prop, depth - 1);
				
					target[key] = prop;
				}
			}

			return target;
		}
		*/
		function getFreeKey(obj) { // returns a 'free' key name (with alpha-numeric) characters for the given object;

			var key = '';

			do {

				key += (0 + (Math.round(Math.random() * 25))).toString(36);

			}while(obj[key] !== undefined);

			return key;
		}

		function get$el(key, parent) {

			if(typeof key != 'object')
				return $('[' + keyAttr + '=' + key + ']', parent);

			return $(key, parent);
		}

		function getVal(value) {

			if(typeof value == 'function')
				return value();

			return value;
		}

		function load(target, source, props) {

			var prop,
				i = 0, l = props.length;

			for(; i < l; prop = props[i++], target[prop] = source[prop]);

			return target;
		}

		function getProp(obj, prop) {

			prop = obj[prop];

			if(typeof prop == 'function')
				return prop ();

			return prop;
		}

		function setProp(obj, prop, value) {

			var _prop = obj[prop];

			if(typeof _prop == 'function')
				return _prop(value);

			obj[prop] = value;
			
			return value;
		}

		// public
		/* Classes */
		O_O.class = { 

			/* Base classes */
			
			host: function() { // a base class to implement observables

				var plugs = [],

				wrap = this.wrap = function(val, source) { // set the value and fire the event
					
					for(var i = 0, l = plugs.length; i < l;)
						plugs[i++](val, source);
				};

				wrap.plug = function(func) { // plugs a function to this host
					
					plugs.push(func);

					return function() { // this function can be stored and called to unplug fron the host
					
						wrap.unplug(func);
					}
				}

				wrap.unplug = function(func) { // unplug a plugged function
				
					remove(plugs, func);
				}
			}

			/* UI classes */
			
			, box: function box(data/*consists of $data and child element data*/) { // helps handling trees
				
				var self = this,
					_$, $el, elType, cleanUp, trans,

					events = {},
					plugs = {prop: {}, attr: {}, class: {}}, // stores the 'unplug' functions from the hosts

					children = getKeys(data);

				remove(children, '$'); // remove the $ from the children
				
				load(self, data, children); // load the children on to the box (to enable 'parent.child' access of un-kissable properties)

				//! overload the provided data.$, to enable 'self' reference inside the object's constructor
				_$ = self.$ = function(data) { // helps to get and set values and events; and to plug observables

					enumerate(data, function(key, val) {

						if(typeof val == 'object') { // the prop should be enumerated
							
							enumerate(val, function(k) {

								_$[key](k, val[k])
							});
						}
						else if(_$[key])
							_$[key](val)
					});

					return _$;
				}

				_$.set = function(data) { // sets the data of the children
					
					var keys = getKeys(data),
						i = 0, l = keys.length;

					for(; i < l;) {

						var key = keys[i++],
							val = data[key],
							child = self[key];

						if(child) {
						
							if(child.$) // the child is a kissable
								typeof val != 'object' ? child.$.val(val) : child.$.set(val);

							else if(typeof child != 'function') // the child is a property thatsn't a pluggable
								child = val;
								
							else // the child is a O_O.value
								child(val);
						}
					}

					return _$;
				}

				_$.at = function(elm/*keyAttr, a DOM.$.el or a DOM element*/, parent) { // sets the node for the box (sets the el for the element and loads it with existing html, attrs etc)
					
					if(!parent) {
						
						$el = get$el(elm, document);
					}
					else {

						self.$.parent = parent;
						$el = elm.el ? elm : get$el(elm, parent.$.el); // get the $el of the box
					}

					_$.$el = $el; // microDOM's $ object; use this to set one-time values
					_$.el = $el.el; // the DOM element
					_$.id = $el.attr(keyAttr); // give the element an id
					elType = getElType($el.el); // the type of the element (to be used in .val and .default);
					
					init();
					loadChildren();
					
					data.$ = _$; // load the $ to the passed data object, so it could be referenced through 'self' (a copy of 'this' inside the passed object)

					return _$;
				}
				
				_$.clear = function() { // destructor, that clears all the children and unplugs the existing plugs

					for(var i = 0; i < children.length;) // remove all children (boxes and pods)
						_$.remove(children[i++]);

					enumerate(plugs, function(key, branch) { // clear all plugs

						enumerate(branch, function(key, unplug) {
						
							unplug(); // unplug the plug
						});
					});
					
					if(cleanUp)
						cleanUp(self);

					$el.el.remove();
				}
				
				_$.append = function(childName, tagName, boxProps) { // append a child
					
					self.$.$el.append(tagName).attr('id', childName);
					
					var box = self[childName] = O_O.box(boxProps);
					
					return box.$.at(childName, self);
				}
				
				_$.remove = function(childName) { // remove a child

					var $child = self[childName].$;

					if($child) {

						$child.clear();
						delete self[childName];
						remove(children, childName);
					}
				}

				_$.val = function(newVal) { // helps with form serialization, returns the value when data is collected custom controls may use this method to return a custom val
					
					if(trans)
						return trans(newVal, self); // add a custom value function; could both set and return values
					
					var prop;

					if(elType == 3) // the element is an editable control (input, textarea, select)
						prop = 'value';

					else if(elType == 2) // the element is a checkable //? radio
						prop = 'checked';

					if(newVal !== undefined) {

						if(prop)
							$el.prop(prop, newVal);

						else
							$el.text(newVal);

						return _$;
					}
					else {

						if(prop)
							return _$.prop(prop);

						else if(elType === 0) { // the element is an HTML element
							
							var length = children.length;
							
							if(!length) // the element has no children
								return _$.text(); // so return its text
								
							var ret = {},
								i = 0;
								
							for(; i < length;) { // the element has children so get the nested data

								var childName = children[i++],
									child = self[childName],
									val;

								if(child && child.$) {
								
									val = child.$.val()
									
									if(val !== undefined) // to skip buttons and the like
										ret[childName] = val;
										
								}
							}

							return ret;
						}
					}
				}

				_$.html = function(newVal) { // plug / unplug an observable or get / set some value to the node's html; prefer $.text, as it's fater and safer

					if(!arguments.length)
						return $el.html()

					$elRouter('prop', 'innerHTML', newVal);
				}
				
				_$.text = function(newVal) { // plug / unplug a host to the node's text
					
					if(!arguments.length)
						return $el.text()

					$elRouter('prop', 'textContent', newVal);
				}

				_$.prop = function(prop, newVal) { // plug / unplug a host to a particular (js) property of the DOMElement
					
					return $elRouter('prop', prop, newVal);
				}

				_$.attr = function(attr, newVal) { // plug / unplug a host to a particular attribute of the node
					
					return $elRouter('attr', attr, newVal);
				}

				_$.class = function(_class, newVal) { // plug / unplug a host to a classList of the node
					
					return $elRouter('class', _class, newVal);
				}

				_$.event = function(name, handler) { // add / remove an event listener; an event could have only one listener (this is to maintain simplicity in the design of apps)
					
					var el, eName,
						pos = name.indexOf(' ');

					if(pos > -1) {
	
						el = $el.$(name.substr(pos + 1));
						eName = name.substr(0, pos);
					}
					else {

						el = $el;
						eName = name;
					}

					if(handler) { // allows to remove the existing event handler by not passing a handler
						
						if(events[name])// the event already has a handler
							el.off(eName, events[name]); // remove the handler; having a single handler per event is by design, this is to maintain simplicity and structure. 'A button could turn on only a single light'.
					
						el.on(eName, events[name] = function(e) {
						
							//! 'this' context is lost, that could be got through the e.target
							handler(e, self);
						});
					}
					else {
						
						return events[name];
					}

					return _$;
				}

				/* Helpers */
				function init() { // sets the default values (when hosts are directly assigned they are plugged)

					var $data = data.$;
					
					if($data) {

						var init = $data.init,
							def = $data.default; // default is used to bind a function to the default event (varies by element type), and to set the event that triggers the bound O_O.value to change
							
						cleanUp = $data.clear; // store the clear function for later use
						trans = $data.trans; // store the clear function for later use
						
						if(def !== undefined) {
						
							var evt = def.event;

							if(evt)
								def = def.value;
								
							else
								evt = 'change'

							if(elType > 1) { // the element is an editable control (input, textarea, select) or a check box

								var prop = elType === 2 ? 'checked' : 'value';

								if(def.plug) {
								
									def.plug(function(val) {
									
										$el.prop(prop, val); // set the property
									});

									$el.on(evt, function(e) { // this plug circumvents the one-event per event type
									
										def(e.target[prop]);
									});

									$el.prop(prop, def()); // set the prop with initial value
								}

								else {
								
									$el.prop(prop, getVal(def)); // set the value
								}
							}

							else if(elType === 1) { // the element is a button (only a function could be the default value for buttons (as event handlers); other elements renderrs the return values as their content though
								
								_$.event('click', def);
							}
							else { // the element is a display; set its text
							
								_$.text(def);
							}
						}
						
						_$($data); // load $data on to the element
						
						if(init) {
							
							init(self);
						}
					}
				}

				//? could this be exposed as $.type?
				function getElType(el) { // returns the type of an element 0: display, 1: button, 2: toggle, 3: editable

					if(el.required !== undefined) {

						var type = el.type;

						if(type == 'checkbox' || type == 'radio')
							return 2;
						
						else if(type == 'submit')
							return 1;
						
						else
							return 3; // the element is an editable
					}
					else if($el.el.formAction !== undefined) // the element is a button
						return 1;
					

					return 0; // the element is a display
				}

				function $elRouter(method, prop, newVal) { // sets attr/prop/etc via $

					if(newVal === undefined) { //! arguments.length won't work here as the interface functions pass their undefined variables directly to this function
						
						return $el[method](prop);
					}

					if(plugs[method][prop]) { // if there already is a plug

						plugs[method][prop](); // unplug the existing plug
						delete plugs[method][prop];
					}

					if(newVal.plug) {

						var func = function(val) { // a function to change the value
						
							$el[method](prop, val);
						}

						plugs[method][prop] = newVal.plug(func); // plug into the value and get the unplug function

						func(newVal()); // run the function with initial value
					}

					else {
					
						return $el[method](prop, getVal(newVal)); // set the value
					}

					return _$;
				}

				function loadChildren() {

					for(var i = 0, l = children.length; i < l;) // load child objects with matching elements
						loadChild(children[i++]);
				}
				
				function loadChild(childName) {

					var child, child$el;

					child$el = get$el(childName, $el.el);

					if(child$el.el) { // tags without matching objects are left intact; so to play nice with other libs

						child = self[childName];

						if(typeof child == 'object') {
						
							//! Any plugin that needs to be loaded within a box should be constructed using a 'named' function*, else it'll be treated as an argument toa box constructor, this is simply because, I don't know how to check whether the object passed was an instanceOf a class3
							if(child.constructor.name === '' || child.constructor.name == 'Object') // a plain object containing self attrs and children
								self[childName] = O_O.box(child); // build a box using the given 'data' and replace the data with it
						}
						else {
							
							self[childName] = O_O.box({$:{default: child}}); // create a box with the assigned object as its default value
						}

						self[childName].$.at(child$el, self); // plugins may have a plugin.$.at function to merge themselves with the tree.
					}
				}
			}

			, pod: function pod(options) { // helps to manage a collection of identical objects

				var freeId = 0, itemNode,
				
					// options
					source = options.source,
					idProp = '_id',
					data = options.data,
					ItemConstructor = options.item,
					box = O_O.box({$: options.$}),
					mode = options.mode || 'append', // mode: append || prepend
					
					// public
					self = this,
					items = self.items = {}, // holds all the items
					order = self.order = [], // holds the list of ids in the order of addition; use this array to iterate over the items in the pod
					event = self.event = O_O.host(); // could be listened for changes to the pod

					options = undefined; // cleaning the options var
				
				var _$ = self.$ = extend({}, box.$); // add the pre-$.at box.$ properties to self.$
				
				_$.at = function(elm, parent) { // sets the node for the pod

					var box$ = box.$;
					
					box$.at(elm, parent);
					
					extend(self.$, {
					
						$el: box$.$el,
						el: box$.el,
						id: box$.id
					}); // add the remaining box.$ properties to self.$
					
					extractItemNode();

					if(data) {
						
						self.reset(data);
						data = undefined;
					}
						
					else if(source)
						self.source(source);
				}
				
				self.item = function(item, html) { // changes the item constructor				
					
					if(item)
						ItemConstructor = item;
					
					if(html) {
						
						box.$.html(html);
						extractItemNode();
					}
					
					if(source) { // apply the new constructor to all the existing items					
						
						var _order = order,
							data = source.items,
							i = 0, l = order.length;
						
						// clean the item cache, it will be repopulated the items are added again
						order = self.order = [];
						items = self.items = {};
						
						for(; i < l;)
							addItem(data[_order[i++]]);
					}
				}
				
				self.add = function(data) { // adds an item

					var item = addItem(data);
					
					event({
					
						type: 'add',
						item: item
					});
				}
				
				self.remove = function(id) { // removes an item
				
					id += ''; // ensure type safety

					var item = items[id];
					
					item.$.clear();
					delete items[id];
					remove(order, id);
					
					event({
					
						type: 'remove',
						item: item
					});
				}

				self.source = function(_source) { // sets the data source for the pod (a source could be a O_O.list or some other plugin that implements the same interface)

					source = _source;
					idProp = _source.idProp;
					
					self.reset();
					
					// add the existing items from the source
					var _order = source.order,
						sItems = source.items,
						i = 0, l = _order.length;
					
					for(; i < l;)
						self.add(sItems[_order[i++]]);
					
					source.event.plug(listen); // listen to the changes to the source, for reflecting them
				}
				
				self.reset = function(newItems) { // clean the existing and add the new items (if available)

					while(order.length) // remove the existing items in the pod
						self.remove(order[0]);
					
					freeId = 0;
					
					if(newItems) // add the given items
						for(var i = 0, l = newItems.length; i < l;)
							self.add(newItems[i++]);
				}
				
				self.refresh = function() { // reflect the order changes in the source

					var data, id, sId, item$,
						itemsBuffer = {},
						sOrder = source.order,
						sItems = source.items,
						i = 0, l = sOrder.length;
				
					for(; i < l; i++) {

						sId = sOrder[i];
						id = order[i];
						
						itemsBuffer[id] = items[sId];
						data = sItems[sId];
						
						item$ = items[id].$;
						item$.id = order[i] = data[idProp];
						item$.set(data);
					}
					
					self.items = items = itemsBuffer;
					self.order = order;
				}
				
				/* Helpers */
				
				function addItem(data) { // used by self.item and self.add to construct and add an item to the pod
				
					var item,
						node = itemNode.cloneNode(true), // deep clone the node
						id = data[idProp];

					id = id !== undefined ? id + '' : getFreeKey(items); // convert the id to string to maintain type safety
					order.push(id);
					node.setAttribute(keyAttr, id); // set the id as the key attribute.
					
					//! passing the itemData to the constructor function allows it to act as an 'init' function and would help in handling diverse objects as a group
					item = items[id] = O_O.box(new ItemConstructor(data, id)); // make a new box and register it to the items array
					
					item.$
						.at(node, self)
						.set(data);
					
					box.$.$el[mode](node); // add it to the pod
					
					return item;
				}
				
				function extractItemNode() {

					itemNode = box.$.prop('firstElementChild'); // use the first child element as the template for items
					box.$.html(''); // empty the pod's box
				}
				
				function listen(event) { // listen to the events from the source and reflect them

					var data = event.data,
						id = data[idProp] + '',
						type = event.type;
					
					if(type == 'add')
						self.add(data);
					
					else if(type == 'change')
						items[id].$.set(event.changes);
						
					else // remove the item
						self.remove(id);
				}
			}

			/* Data Classes */
			
			, value: function(val) { // a host (observable) that stores a simple value

				var self = this;

				self.val = function(newVal) { // sets or returns the value
					
					if(arguments.length) {

						if(newVal === val) // this equality check is to break circular references (when the value is bound to a UI control) and false changes (the value is reset to the same value)
							return;

						self.val.prev = val;
						val = newVal;
						host(newVal, self.val); // fires the change; self.val() could be called to get the prevVal
					}

					return val;
				}

				var host = O_O.host();

				self.val.plug = host.plug;
				self.val.unplug = host.unplug;
			}

			, object: function(store) { // helps with the handling dynamic objects with observable properties; could simplify the process handling complex data

				this.wrap = function(newData) {

					if(newData) {

						enumerate(newData, function(key, val) {
						
							setProp(store, key, val);
						});
					}
					else {

						var ret = {};

						enumerate(store, function(prop) {
						
							ret[prop] = getProp(store, prop);
						});

						return ret;
					}
				}

				extend(this.wrap, store);
			}

			, list: function(options) { // helps with handling observable lists (often used as the data source for O_O.pods)

				var self = this,
					items = self.items = {},
					order = self.order = [], // holds the list of ids in the order of addition, is used by .pod-s to refresh data.
					event = self.event = O_O.host(),
					idProp = self.idProp = options.idProp || '_id';

				self.length = O_O.value(0);
				
				self.add = function(data) { // add a new item

					if(data[idProp] === undefined)
						data[idProp] = getFreeKey(items); // convert the id to string to maintain type safety
					
					var id = data[idProp] + '';
					
					order.push(id);
					items[id] = data;
					
					self.length(order.length);

					event({

						type: 'add',
						data: data

					}, self);
				}
				
				self.change = function(id, changes) { // change an existing item
					
					id += ''; // ensure type safety
					
					var data = items[id];
					
					extend(data, changes);
					
					event({

						type: 'change',
						data: data,
						changes: changes

					}, self);
				}
				
				self.remove = function(id) { // remove an existing item
					
					id += ''; // ensure type safety
					
					var data = items[id];
					
					if(!data)
						return;
					
					delete items[id];
					remove(order, id);
					
					self.length(order.length);
					
					event({

						type: 'remove',
						data: data
						
					}, self);
					
					return self;
				}
				
				self.update = function(data) {
				
					var id = data[idProp] + '';
					
					if(id && items[id])
						self.change(id, data);
						
					else
						self.add(data);
				}

				self.reset = function(newItems) { // clean the existing and add the new items (if available)

					while(order.length) // remove the existing items in the pod
						self.remove(order[0]);
					
					if(newItems) // add the given items
						for(var i = 0, l = newItems.length; i < l;)
							self.add(newItems[i++]);
				}
				
				if(options.data)
					self.reset(options.data);
				
				options = undefined; // clear the variable
			}
			
			/* Control classes */
			
			, watch: function() { // watches multiple observables for changes, the watched could dynamically be added or removed
			
				//? check: watches could be closely related to lists, spread sheet totaling (with a watch is not necessary as it could be done) with a .listen on the .list.event

				var self = this,

					action = emptyFunction(),

					plug = function(val, source) { // the action to take when one of the watches change

						action(val, source);
					},

					plugs = [];

				self.watch = function() {

					var arg,
						i = 0, l = arguments.length;

					for(; i < l;) {

						arg = arguments[i++];

						if(plugs.indexOf(arg) == -1) { // don't watch the val if it's being watched already
						
							plugs.push(arg);
							arg.plug(plug);
						}
					}

					return self;
				}

				self.unwatch = function() {

					for(var i = 0, l = arguments.length; i < l;) {

						plug = remove(plugs, arguments[i++]);

						if(plug)
							plugs.unplug(plug);
					}

					return self;
				}

				self.clear = function() {

					for(var i = 0, l = plugs.length; i < l;)
						plugs[i++].unplug(plug);

					plugs = [];

					return self;
				}

				self.action = function(newAct) {

					action = newAct;

					return self
				}
			}
		}

		/* Decorators */ // simplifies the creation of objects and makes the code readable, plugins could skip this for improved performance
		
		/* UI wrappers */
		
		O_O.box = function(data) { // an element that could have children

			return new O_O.class.box(data || {});
		}

		O_O.pod = function(data) { // an element that acts as a collection

			return new O_O.class.pod(data || {});
		}

		/* Data wrappers */
		
		O_O.host = function() {

			return new O_O.class.host().wrap;
		}

		O_O.value = function(val) {

			return new O_O.class.value(val).val;
		}

		O_O.object = function(data) {

			return new O_O.class.object(data).wrap;
		}

		O_O.list = function(options) {

			return new O_O.class.list(options || {});
		}

		/* Control wrappers */
		
		O_O.listen = function(val, func) {

			return {

				stop: val.plug(func)
			}
		}

		O_O.watch = function() {

			var _watch = new O_O.class.watch,
				i = 0, l = arguments.length;

			for(; i < l;)
				_watch.watch(arguments[i++]);

			return _watch;
		}

		/* Factories */
		
		O_O.trans = function(transform) { // generates a wrapper a that transforms values supplied by observables

			return function(host, param) {

				var wrap = function(){ // this function wraps the observable and alter the value provided by it
				
					return transform(host(), host, param)
				};

				wrap.plug = function(outFunc) {

					return host.plug(function(val, host) {

						outFunc(transform(val, host, param));
					});
				}

				return wrap;
			}
		}

		/* Monoliths */
		
		O_O.state = new function() {

			var self = this;
			
			//! use 'change' to change the state and set the history
			self.change = O_O.value();
			
			self.routes = {}; // to be overridden by the user provided routes

			//!  use 'set' if the state has to be changed without affecting the history
			self.set = function(hash) { // processes the hash, executes the related function and changes the hash on sucessful execution

				if(!hash) // firefox sets an 'undefined' has when there's no hash
					hash = ''; // the default hash
					
				if(resolve(self.routes, hash)) // the state is set if the route is resolved successfully (a non-truthy value is returned)
					return;
			}

			self.change.plug(function(hash) { // listens to the hash changes and sets the route

				self.set(hash);
				window.location.hash = hash;
			});
			
			/*/ route resolution
			
				state.routes = {
				
					a: {
					
						'*' : {
						
							b: {
							
								'*': function(finalParam, otherCollectedParamsArray) {
								
									// 
								}
							}
						}
					}
				}
				
				state.change('a/param1/b/param/2') resolves to a.*.b('param/2', [param1])
			 */ 
			function resolve(route, path, params) { // resolves the route

				if(!route)
					return 1; // notify failure if the route is not resolved
				
				if(!params)
					params = [];
				
				if(typeof route == 'function')
					return route(dCode(path), params);
				
				var pos = path.indexOf('/'),
					part = pos > 0 ? path.substr(0, pos) : path,
					target = route[part],
					rest = path.substr(pos + 1);
				
				if(!target) {

					params.push(dCode(part));
					target = route['*'];
				}
				
				return resolve(target, rest, params); // move one level deeper
			}
		}

		O_O.plugin = function(name, plugin) { // a wrapper for plugins

			if(plugin === undefined)
				return O_O.plugin[name];

			O_O.plugin[name] = plugin;
		}
		
		changeState = O_O.state.change;
	}

	DOM.ready(function() {

		var hash = location.hash.substr(1);
		
		if(ready) { //! this doesn't seem to fire (as the script of the app hasn't been fully executed on DOM ready)

			ready();
			initState(hash); // resolve the provided state
		}

		else // a ready function is not available
			O_O.ready = function(func) { // so execute it as soon as it's available

				func();
				initState(hash); // resolve the provided state
			}
	});
	
	/* Helpers */
	
	function initState(hash) { // listen to changes in history

		changeState(hash); // resolve the provided state
		
		window.addEventListener('popstate', function() {

			changeState(location.hash.substr(1));
		});
	}
	
})(window, document, window.DOM);