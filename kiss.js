//? could the $ be skipped by using hasOwn property

define(function()
{
	"use strict";

	return new function()
	{
		//privates
		var O_O = this;
		var keyAttr = 'id'; //the default keyAttr is id

		//helpers
		var get$el = function(key, parent)
		{
			return $(parent || document).find(['[', keyAttr, '="', key, '"]:first'].join(''));
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
		}

		this.connections = new function() //thanks to: bloody-jquery-plugins / pubsub.js
		{
			var store = {}; //stores the connections

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
				store[topic] && $.each(store[topic], function(){
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
				if(!store[topic]){
						store[topic] = [];
				}
				store[topic].push(callback);
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
				store[t] && $.each(store[t], function(idx){
						if(this == handle[1]){
							store[t].splice(idx, 1);
							if(!store[t].length) delete store[t];
						}
				});
			};

			this.get = function() //gets a new connection
			{
				var rnd = Math.random().toString(36).substring(2, 12);

				while(store[rnd]){rnd = Math.random().toString(36).substring(2, 12);} //gets a key of 10 letters that's not in the store

				return rnd;
			}
		}

		//base classes
		this.classes = new function(){

			//UI classes
			this.elementBase = function(){ //the base class for element, collection etc

				this.default = function(value) //varies on the type of element
				{
					if(this.default.unplug)
						this.default.unplug();

					switch(this.$el[0].type)
					{
						case 'text':
						case 'select-one':
						case 'select-multiple':

							defaultFunction.apply(this, [value, this.$el.val.bind(this.$el)]); 

						break;

						case 'checkbox':

							defaultFunction.apply(this, [value, this.$el.prop.bind(this.$el, 'checked')]);
							
						break;

						default: //the tag is not a control
							this.html(value);
					}
				}
				
				this.html = function()
				{
					if(!arguments.length)
						return this.$el.html();

					if(arguments[0] && arguments[0].plug) //the value is a pluggable
						arguments[0].plug(this, changeHTML);

					else
					{
						if(changeHTML.unplug)
							changeHTML.unplug();

						this.$el.html(getValue.apply(this, [arguments[0]]));
					}
				}

				this.attrs = function(changes)
				{
					enumProps.apply(this, ['attr', changes, this.store['attrs']]);
				}

				this.props = function(changes)
				{
					enumProps.apply(this, ['prop', changes, this.store['props']]);
				}

				this.classes = function(changes) //turns on/off the given class names based on their values
				{
					enumProps.apply(this, ['toggleClass', changes, this.store['classes']]);
				}

				this.events = function(events)
				{
					for(var eventName in events)
					{
						if(this.store['events'][eventName]) //the event already has a handler
							this.$el.off(eventName, this.store['events'][eventName]); //remove the handler; having a single handler per event by desugn, is to maintain simplicity and structure. 'A button could turn on only a single light'.

						this.store['events'][eventName] = $.proxy(events[eventName], this);
						this.$el.on(eventName, this.store['events'][eventName]);
					}
				}

				var changeHTML = function(value)
				{
					this.$el.html(value);
				}

				var enumProps = function(method, changes, store) //loads the given keys on to the attr/prop/class of the given node
				{
					for(var key in changes)
					{
						if(changes[key].plug) //the value is a pluggable
						{
							/*store[key] = function(value) //create a function to change the specific value
							{
								//if(value !== this.$el[method](key)) //? this might cause reposing of a two way binding; could this check be removed safely
								this.$el[method](key, value);
							}*/
							
							store[key] = this.$el[method].bind(this, key, value);

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

							this.$el[method](key, getValue.apply(null, [changes[key]])); //get the current value into the fitting jQuery method
						}
					}
				}
				
				var defaultFunction = function(value, method) //afactory function that handles the default assignings
				{
					if(value && value.plug) //the value is a pluggable
					{
						value.plug(this.default, function(value){method(value)}); //subscribe to future changes

						this.events({
							change: function() //enable two-way binding
							{
								value(method());
							}
						});
					}
					else
						method(getValue.apply(null, [value])); //get the current value
				}
			}

			//helpers //?try to move these into their classes
			var getValue = function(value)
			{
				if(typeof value == 'function') //the value is a function
					return value.apply(this);

				else
					return value; //the value is just a value
			}

			this.element = function(data){

				this.store = {

					attrs: {}, //stores attr specific functions that are plugged
					props: {}, //stores prop specific functions that are plugged
					classes: {}, //stores class specific functions that are plugged
					events: {} //stores event specific handlers
				}

				this.el = function() //sets the $el for the element and load it with existing html, attrs etc
				{
					if(!arguments.length)
						return this.$el;

					this.$el = get$el.apply(null, arguments);

					for(var i in data)
						if(typeof this[i] == 'function')
							this[i].apply(this, [data[i]]);

					if(data && data.init)
						data.init.apply(this);

					data = undefined;
				}
				
				this.get = function(method) //gets the value of a given 'method'
				{
					return this[method]();
				}
				
				this.set = function(method, change)  //sets the value of a given 'method'
				{
					this[method](change);
				}
				
				this.setMultiple = function(changes) //set multiple values at once
				{
					for(var i in changes)
						this[i](changes[i]);
				}
			}

			this.element.prototype = new this.elementBase;

			//Data Classes
			this.host = function() //a base class for other hosts like value, trans, function etc
			{
				this.plug = function(context, action)
				{
					if(action.unplug)
						action.unplug(); //remove any previous plugs

					var plug = O_O.connections.plug(this.connection, function(value) //plug to the connection
					{
						action.apply(context, [value]); //the action is executed
					});

					action.unplug = function() //set an unplug function so the event could be unsubscribed later
					{
						O_O.connections.unplug(plug); //pass the handle to the connection to the unsubscribe function
						delete action.unplug;
					}

					action.apply(context, [this.access()]); //? this might cause troubles with two way bindings
				}
			}

			this.value = function(val) // a host that stores a simple value
			{
				this.value = arguments[0];
				this.connection = O_O.connections.get();

				this.access = function(newValue)
				{
					if(!arguments.length)
						return this.value;

					if(this.value !== newValue)
					{
						this.value = newValue;
						O_O.connections.trigger(this.connection, [this.value]);
					}

					return this;
				}
			}

			this.value.prototype = new this.host;

			this.trans = function(val, getter, setter) //a host that could transform its stored value using getters and setters
			{
				var res;

				this.connection = O_O.connections.get();

				this.access = function(newValue) //a 'transformable' variable with a getter and a setter
				{
					if(!arguments.length)
						if(getter)
							return getter.apply(this, [val]);
						else
							return val;

					if(setter)
						res = setter.apply(this, [newValue]);
					else
						res = newValue;

					if(val !== res)
					{
						val = res;
						O_O.connections.trigger(this.connection, [this.access()]);
					}

					return this;
				}
			}

			this.trans.prototype = new this.host;
		}

		//Decorated Classes
		//UI classes
		this.element = function() //an element that could have nested elements
		{
			var _Element; //the underlying O_O.classes.element		

			if(!arguments.length)
				_Element = new O_O.classes.element;
			else
				_Element = new O_O.classes.element(stripProp(arguments[0], '$'));
			
			var self = function()
			{
				if(!arguments.length)
					return self;
				
				if(arguments.length > 1)
				{
					_Element.set(arguments[0], arguments[1]);
					return self;
				}
					
				if(typeof arguments[0] == 'object')
				{
					_Element.setMultiple(arguments[0]);
					return self;
				}
				
				return _Element.get.apply(_Element, arguments);
			}
			
			$.extend(self, arguments[0]); //store the rest as the object's children

			for(var childName in self) //load child objects with matching elements
			{
				if(!get$el(childName, self('el')).length)
					continue;  //tags without matching objects are left intact; so to play nice with other libs

				if(self[childName].constructor === Object) //convert object literals to O_O.element; object literals are used to maintain simplicity //? try to expand this for bjects created with ananymous functions
					self[childName] = O_O.element(self[childName]);
					
				else
					self[childName] = O_O.element({$:{default: self[childName]}}); //create an element with the assigned object as its default property

				self[childName]('el', childName, self('el'));
			}

			return self;
		}

		//Data classes
		this.value = function() // a pluggable value
		{
			var host;

			if(arguments.length > 1)
				host = new O_O.classes.trans(arguments[0], arguments[1], arguments[2]);

			else
				host = new O_O.classes.value(arguments[0]);

			var retFunc = function()
			{
				return host.access.apply(host, arguments);
			}

			retFunc.plug = host.plug.bind(host);

			retFunc(arguments[0]);

			return retFunc;
		}

		//UI classes
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
		this.function = function(func) //a pluggable function
		{
			return function()
			{
				var result;
				var changeEvent = O_O.connections.get() + ':change';
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