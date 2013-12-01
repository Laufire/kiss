//? could the $ be skipped by using hasOwn property

define(function()
{
	"use strict";

	return new function()
	{
		//privates
		var O_O = this;
		var keyAttr = 'id'; //the default keyAttr is id
		var keySelector = '[id]'; //? the selector could be improved to find just the first descendants (not the child) with the keyAttr
		
		//helpers
		var get$el = function(name, parent)
		{
			return $(parent || document).find(['[', keyAttr, '="', name, '"]:first'].join(''));
		}
		
		var stripProp = function(obj, prop)
		{
			var ret;
			
			if(obj && obj[prop])
			{
				ret = obj[prop];
				
				delete obj[prop];
			}
			
			return ret;
		}

		//public
		this.keyAttr = function(key) //change the keyAttr to be KISSed
		{
			keyAttr = key;
			keySelector = ['[', keyAttr, ']'].join('');
		}

		this.connections = new function() //thanks to: bloody-jquery-plugins / pubsub.js
		{
			var cache = {};		

			this.trigger = function(/* String */topic, /* Array? */args){
				// summary:
				//                Publish some data on a named topic.
				// topic: String
				//                The channel to publish on
				// args: Array?
				//                The data to publish. Each array item is converted into an ordered
				//                arguments on the subscribed functions.
				//
				// example:
				//                Publish stuff on '/some/topic'. Anything subscribed will be called
				//                with a function signature like: function(a,b,c){ ... }
				//
				//        |                $.trigger("/some/topic", ["a","b","c"]);
				cache[topic] && $.each(cache[topic], function(){
						this.apply($, args || []);
				});
			};

			this.plug = function(/* String */topic, /* Function */callback){
				// summary:
				//                Register a callback on a named topic.
				// topic: String
				//                The channel to subscribe to
				// callback: Function
				//                The handler event. Anytime something is $.trigger'ed on a
				//                subscribed channel, the callback will be called with the
				//                published array as ordered arguments.
				//
				// returns: Array
				//                A handle which can be used to unsubscribe this particular connection.
				//
				// example:
				//        |        O_O.plug("/some/topic", function(a, b, c){ /* handle data */ });
				//
				if(!cache[topic]){
						cache[topic] = [];
				}
				cache[topic].push(callback);
				return [topic, callback]; // Array
			};

			this.unplug = function(/* Array */handle){
				// summary:
				//                Disconnect a subscribed function for a topic.
				// handle: Array
				//                The return value from a $.plug call.
				// example:
				//        |        var handle = $.plug("/something", function(){});
				//        |        O_O.unplug(handle);

				var t = handle[0];
				cache[t] && $.each(cache[t], function(idx){
						if(this == handle[1]){
							cache[t].splice(idx, 1);
							if(!cache[t].length) delete cache[t];
						}
				});
			};

			this.getSlot = function() //gets a free id to host the events
			{
				var rnd = Math.random().toString(36).substring(2, 12);

				while(cache[rnd]){rnd = Math.random().toString(36).substring(2, 12);} //gets a key of 10 letters that's not in the cache

				return rnd;
			}
		}

		//base classes
		this.classes = new function(){
		
			//classes
			this.element = function(data){
			
				//privates
				var $el;
				
				var store = {

					attrs: {}, //stores attr specific functions that are plugged
					props: {}, //stores prop specific functions that are plugged
					classes: {}, //stores class specific functions that are plugged
					events: {} //stores event specific handlers
				}				
				
				//publics
				this.el = function() //sets the $el for the element and load it with existing html, attrs etc
				{
					if(!arguments.length)
						return $el;
					
					$el = get$el.apply(null, arguments);
					
					for(var i in data)
						if(typeof this[i] == 'function')
							this[i].apply(this, [data[i]]);
					
					if(data && data.init)
						data.init.apply(this);
					
					data = undefined;
				}
				
				this.html = function()
				{
					if(!arguments.length)
						return $el.html();
					
					if(arguments[0].plug) //the value is a pluggable
						arguments[0].plug(this, function(value)
						{
							$el.html(value);
						});
					
					else
					{
						if(this.html.unplug)
							this.html.unplug();
						
						$el.html(getValue.apply(this, [arguments[0]]));
					}
					
					return this;
				}
				
				this.attrs = function(keys)
				{
					enumProps.apply(this, ['attr', keys, store['attrs']]);
				}

				this.props = function(keys)
				{
					enumProps.apply(this, ['prop', keys, store['props']]);
				}

				this.classes = function(keys)
				{
					enumProps.apply(this, ['toggleClass', keys, store['classes']]);
				}

				this.events = function(events)
				{
					for(var eventName in events)
					{
						if(store['events'][eventName]) //the event already has a handler
							$el.off(eventName, store['events'][eventName]); //remove the handler
						
						store['events'][eventName] = $.proxy(events[eventName], this);
						$el.on(eventName, store['events'][eventName]);
					}
				}
			}
			
			//helpers
			var getValue = function(value)
			{
				if(typeof value == 'function') //the value is a function
					return value.apply(this);

				else
					return value; //the value is just a value
			}
			
			var enumProps = function(method, changes, store) //loads the given keys on to the attr/prop/class of the given node
			{
				var $el = this.el();
				
				for(var key in changes)
				{
					if(changes[key].plug) //the value is a pluggable
					{
						store[key] = function(value) //create a function to change the specific value
						{
							//if(value !== $el[method](key)) //? this might cause reposing of a two way binding; could this check be removed safely
							$el[method](key, value);
						}

						changes[key].plug(this, store[key]);
					}
					else
					{
						if(store[key]) //the attr already has a value, clear it
						{
							if(store[key].unplug)
								store[key].unplug();

							delete store[key];
						}
							
						$el[method](key, getValue.apply(null, [changes[key]])); //get the current value into the fitting jQuery method
					}
				}
			}			
		}
		
		this.element = function()
		{
			var _Element; //the underlying O_O.classes.element
			
			var self = function(param1, param2)
			{
				if(!arguments.length)
					return self;
					
				else
					if(arguments.length == 1)
						if(typeof param1 == 'object') //set multiple values at once
						{
							for(var i in param1)
								_Element[i](param1[i]);
						}
						else
							return _Element[param1](); //return the value of a given 'method'
					else
						_Element[param1](param2); //set the 'value' of the given 'method'
				
				
				return self;
			}
			
			if(!arguments.length)
				_Element = new O_O.classes.element;
			else
			{
				 _Element = stripProp(arguments[0], '$');
					
				$.extend(self, arguments[0]);
					
				_Element = new O_O.classes.element(_Element);
			}
			
			for(var childName in self)
			{
				if(!get$el(childName, self('el')).length)
					continue;  //tags without matching objects are left intact; so to play nice with other libs
				
				console.log(childName) //? this is to check the parsed children; leave this until KISS is completed
				var childObject = self[childName];

				//if(childObject && childObject.$) //? could be needed for collections etc
				if(childObject.constructor === Object) //convert plain objects to O_O.element; plain objects are used to maintain simplicity
					childObject = O_O.element(childObject);
				
				childObject('el', childName, self('el'));
			}
			
			return self;
		}
		
		this.value = function() // a pluggable value
		{
			var value = arguments[0];
			var changeEvent = O_O.connections.getSlot() + ':change';

			function retFunc(newValue)
			{
				if(!arguments.length)
					return value;

				if(value !== newValue)
				{
					value = newValue;
					O_O.connections.trigger(changeEvent, [value]);
				}

				return this;
			}

			retFunc.plug = function(context, action)
			{
				if(action.unplug)
					action.unplug(); //remove any previous plugs

				var connection = O_O.connections.plug(changeEvent, function(value) //subscribe to changes
				{
					action.apply(context, [value]); //the action is executed in the targets context
				});

				action.unplug = function() //set an unplug function so the event could be unsubscribed later
				{
					O_O.connections.unplug(connection); //pass the handle to the connection to the unsubscribe function
					delete action.unplug;
				}
				
				action.apply(context, [value]); //? this might cause troubles with two way bindings
			}

			return retFunc;
		}
		
		//UI classes
		this.el = function(data)
		{
			var self = this;
			var initValues = {};

			var store = {

				attrs: {store: {}, method: 'attr'}, //stores attr specific functions that are plugged
				props: {store: {}, method: 'prop'}, //stores prop specific functions that are plugged
				classes: {store: {}, method: 'toggleClass'} //stores class specific functions that are plugged
			}

			if(data)
			{
				if(typeof data == 'object') //? a better way to check;
				{
					if(data.$)
					{
						initValues = data.$;
						data.$ = undefined;
					}

					$.extend(this, data);
				}
				else
					initValues.default = data;
			}

			this.$ = new function()
			{
				this.default = function(value) //varies on the type of element
				{
					if(this.default.unplug)
						this.default.unplug();

					var tagName = self.$.node.context.tagName;
					var type = self.$.node.context.type;

					switch(type)
					{
						case 'text':
						case 'select-one':
						case 'select-multiple':

							self.$.node.val(getValue.apply(null, [value])); //get the current value

							if(value.plug) //the value is a pluggable
							{
								value.plug(this.default, function(value){self.$.node.val(value)}); //subscribe to future changes

								self.$.events({
									change: function() //enable two-way binding
									{
										value(self.$.node.val());
									}
								});
							}

						break;

						case 'checkbox':

							self.$.node.prop('checked', getValue.apply(null, [value])); //get the current value

							if(value.plug) //the value is a pluggable
							{
								value.plug(this.default, function(value){self.$.node.prop('checked', value)}); //subscribe to future changes

								self.$.events({
									change: function() //enable two-way binding
									{
										value(self.$.node.prop('checked'));
									}
								});
							}
						break;

						default: //the tag is not a control
							this.html(value);
					}
				}

				this.html = function(value)
				{
					if(this.html.unplug)
						this.html.unplug();

					if(value.plug) //the value is a pluggable
					{
						changeHTML(value()); //get the current value
						value.plug(this.html, changeHTML);
					}
					else
					{
						changeHTML(getValue.apply(this, [value]));
					}
				}

				this.attrs = function(keys)
				{
					enumProps('attrs', keys);
				}

				this.props = function(keys)
				{
					enumProps('props', keys);
				}

				this.classes = function(keys)
				{
					enumProps('classes', keys);
				}

				this.events = function(events)
				{
					$.each(events, function(event, handler)
					{
						//? if the event already has a handler 'off' it.
						self.$.node.on(event, handler);
					});
				}

				this.load = function($node) //loads the object on to the given $node
				{
					this.node = $node;

					$.each(initValues, function(key, value)
					{
						if(typeof self.$[key] == 'function')
							self.$[key](value)
					});

					if(!initValues.html)
						loadChildren();

					if(initValues.init) //a function to execute as the init function
						initValues.apply(self);

					initValues = undefined;
				}
			}

			//privates
			var getValue = function(value)
			{
				if(typeof value == 'function') //the value is a function
					return value.apply(this);

				else
					return value; //the value is just a value
			}

			var loadChildren = function() //load the children with matching objects
			{
				var nodes = self.$.node.find(keySelector); //selects all nodes with the keyAttr

				nodes.each(function(index, childNode)
				{
					var $child = $(childNode);
					var childKey = $child.attr(keyAttr);
					var childObject = self[childKey];

					if($child.parents(keySelector)[0] != self.$.node[0]) //this node has a parent with a keyAttr
						return;

					if(childObject) //the tag has a matching object
					{
						console.log(childKey) //? this is to check the parsed children; leave this until KISS is completed

						if(childObject.$)
						{
							if(!childObject.$.load) //the object is a plain object
								self[childKey] = new O_O.element(childObject); //convert plain objects to O_O.element; plain objects are used to maintain simplicity
						}
						else
							self[childKey] = new O_O.element(childObject); //pass the object 'as is' to the element

						self[childKey].$.load($child); //load the node to the object

					} //tags without matching objects are left intact; so to play nice with other libs
				});
			}

			var enumProps = function(type, keys) //loads the given keys on to the attr/prop/class of the given node
			{
				var store = store[type].store;
				var method = store[type].method;

				$.each(keys, function(key, value)
				{
					if(store[key]) //the attr already has a value, clear it
					{
						if(store[key].unplug)
							store[key].unplug();

						delete store[key];
					}

					if(value.plug) //the value is a pluggable
					{
						self.$.node[method](key, value()); //get the current value

						store[key] = function(value) //create a function to change the specific value
						{
							if(value !== self.$.node[method](key))
								self.$.node[method](key, value);
						}

						value.plug(store[key], store[key]);
					}
					else
					{
						self.$.node[method](key, getValue.apply(null, [value])); //get the current value into the fitting jQuery method
					}
				});
			}

			var changeHTML = function(html)
			{
				console.log(html);
				self.$.node.html(html);
				loadChildren();
			}
		}

		this.collection = function(initial)
		{
			this.$ = new function()
			{
				this.data = initial.data;

				this.load = function($node)
				{
					this.$node = $node;

					this.itemTemplate = this.$node.children().first()[0].outerHTML;

					this.$node.html('');

					$.each(this.data, function(index, item)
					{
						self.$node.append(parseTemplate(self.itemTemplate, item));
					});
				}

				var self = this;
			}

			var parseTemplate = function(html, object)
			{
				var fragment = $(html);

				var nodes = fragment.find(keySelector);

				nodes.each(function(index, item) //populate the template with data
				{
					var node = $(item);
					var key = node.attr(keyAttr);

					node.html(object[key]);
				});

				return fragment;
			}
		}

		//Data classes
		this.val = function(initialValue) // a pluggable value
		{
			var value = initialValue;
			var changeEvent = O_O.connections.getSlot() + ':change';

			function retFunc(newValue)
			{
				if(!arguments.length)
					return value;

				if(value !== newValue)
				{
					value = newValue;
					O_O.connections.trigger(changeEvent, [value]);
				}

				return this;
			}

			retFunc.plug = function(context, action)
			{
				if(action.unplug)
					action.unplug(); //remove any previous plugs

				var connection = O_O.connections.plug(changeEvent, function(value) //subscribe to changes
				{
					action.apply(context, [value]); //the action is executed in the targets context
				});

				action.unplug = function() //set an unplug function so the event could be unsubscribed later
				{
					O_O.connections.unplug(connection); //pass the handle to the connection to the unsubscribe function
				}

				return context;
			}

			return retFunc;
		}

		this.function = function(func) //a pluggable function
		{
			return function()
			{
				var result;
				var changeEvent = O_O.connections.getSlot() + ':change';
				var vars = Array.prototype.slice.call(arguments); //the vars that might need watching
				var values = Array.prototype.slice.call(arguments); //the values for the function

				function retFunc() //call this function with arguments to cut the old plugs and make new ones
				{
					var prev = result;

					if(arguments.length)
					{
						unplugParams();
						vars = Array.prototype.slice.call(arguments); //track new vars
						plugToParams();
					}

					result = func.apply(null, values);

					if(result !== prev)
						O_O.connections.trigger(changeEvent, [result]);

					return result;
				}

				retFunc.plug = function(context, action) //the second and third parameters are used to cut the default-two way plug
				{
					if(action.unplug)
						action.unplug(); //remove any previous plugs

					var connection = O_O.connections.plug(changeEvent, function(value) //subscribe to changes
					{
						action.apply(context, [value]); //the action is executed in the targets context
					});

					action.unplug = function() //set an unplug function so the event could be unsubscribed later
					{
						O_O.connections.unplug(connection); //pass the handle to the connection to the unsubscribe function
					}
				}

				function plugToParams()
				{
					$.each(vars, function(index, param)
					{
						if(param.plug)
						{
							values[index] = param(); //get the current value of the plug

							vars[index] = param.plug({}, function(value) //replace the pluggable with a dummy object to hold the unplugge function
							{
								values[index] = value;
								retFunc();
							});
						}
					});
				}

				plugToParams(); //plug to the params that are passed with the constructor

				function unpluggeParams()
				{
					$.each(vars, function(index, param)
					{
						if(param.unplug)
							param.unplug();
					});
				}

				return retFunc;
			}
		}
	}
});