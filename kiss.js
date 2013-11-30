//? could the $ be skipped by using hasOwn property

define(function()
{
	"use strict";

	return new function()
	{
		var O_O = this;
		var keyAttr = 'id'; //the default keyAttr is id
		var keySelector = '[id]'; //? the selector could be improved to find just the first descendants (not the child) with the keyAttr

		//public
		this.keyAttr = function(key) //change the keyAttr to be KISSed
		{
			keyAttr = key;
			keySelector = ['[', keyAttr, ']'].join('');
		}

		this.events = new function()
		{
			var cache = {};

			//thanks to: bloody-jquery-plugins / pubsub.js

			this.publish = function(/* String */topic, /* Array? */args){
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
				//        |                $.publish("/some/topic", ["a","b","c"]);
				cache[topic] && $.each(cache[topic], function(){
						this.apply($, args || []);
				});
			};

			this.subscribe = function(/* String */topic, /* Function */callback){
				// summary:
				//                Register a callback on a named topic.
				// topic: String
				//                The channel to subscribe to
				// callback: Function
				//                The handler event. Anytime something is $.publish'ed on a
				//                subscribed channel, the callback will be called with the
				//                published array as ordered arguments.
				//
				// returns: Array
				//                A handle which can be used to unsubscribe this particular subscription.
				//
				// example:
				//        |        $.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
				//
				if(!cache[topic]){
						cache[topic] = [];
				}
				cache[topic].push(callback);
				return [topic, callback]; // Array
			};

			this.unsubscribe = function(/* Array */handle){
				// summary:
				//                Disconnect a subscribed function for a topic.
				// handle: Array
				//                The return value from a $.subscribe call.
				// example:
				//        |        var handle = $.subscribe("/something", function(){});
				//        |        $.unsubscribe(handle);

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

		//UI classes
		this.element = function(data)
		{
			var self = this;
			var initValues = {};

			var enumFuncs = {

				attrs: {store: {}, method: 'attr'}, //stores attr specific functions that are tied
				props: {store: {}, method: 'prop'}, //stores prop specific functions that are tied
				classes: {store: {}, method: 'toggleClass'} //stores class specific functions that are tied
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
					if(this.default.untie)
						this.default.untie();

					var tagName = self.$.node.context.tagName;
					var type = self.$.node.context.type;

					switch(type)
					{
						case 'text':
						case 'select-one':
						case 'select-multiple':

							self.$.node.val(getValue.apply(null, [value])); //get the current value

							if(value.tie) //the value is a tieable
							{
								value.tie(this.default, function(value){self.$.node.val(value)}); //subscribe to future changes

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

							if(value.tie) //the value is a tieable
							{
								value.tie(this.default, function(value){self.$.node.prop('checked', value)}); //subscribe to future changes

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
					if(this.html.untie)
						this.html.untie();

					if(value.tie) //the value is a tieable
					{
						changeHTML(value()); //get the current value
						this.html.tie = value.tie(this.html, changeHTML);
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
				var store = enumFuncs[type].store;
				var method = enumFuncs[type].method;

				$.each(keys, function(key, value)
				{
					if(store[key]) //the attr already has a value, clear it
					{
						if(store[key].untie)
							store[key].untie();

						delete store[key];
					}

					if(value.tie) //the value is a tieable
					{
						self.$.node[method](key, value()); //get the current value

						store[key] = function(value) //create a function to change the specific value
						{
							if(value !== self.$.node[method](key))
								self.$.node[method](key, value);
						}

						value.tie(store[key], store[key]);
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
		this.value = function(initialValue) // a tieable value
		{
			var value = initialValue;
			var changeEvent = O_O.events.getSlot() + ':change';

			function retFunc(newValue)
			{
				if(!arguments.length)
					return value;

				if(value !== newValue)
				{
					value = newValue;
					O_O.events.publish(changeEvent, [value]);
				}

				return this;
			}

			retFunc.tie = function(subscriber, action)
			{
				if(subscriber.untie)
					subscriber.untie(); //remove any previous ties

				var subscription = O_O.events.subscribe(changeEvent, function(value) //subscribe to changes
				{
					action.apply(subscriber, [value]); //the action is executed in the targets context
				});

				subscriber.untie = function() //set an untie function so the event could be unsubscribed later
				{
					O_O.events.unsubscribe(subscription); //pass the handle to the subscription to the unsubscribe function
				}

				return subscriber;
			}

			return retFunc;
		}

		this.function = function(func) //a tieable function
		{
			return function()
			{
				var result;
				var changeEvent = O_O.events.getSlot() + ':change';
				var vars = Array.prototype.slice.call(arguments); //the vars that might need watching
				var values = Array.prototype.slice.call(arguments); //the values for the function

				function retFunc() //call this function with arguments to cut the old ties and make new ones
				{
					var prev = result;

					if(arguments.length)
					{
						untieParams();
						vars = Array.prototype.slice.call(arguments); //track new vars
						tieToParams();
					}

					result = func.apply(null, values);

					if(result !== prev)
						O_O.events.publish(changeEvent, [result]);

					return result;
				}

				retFunc.tie = function(subscriber, action) //the second and third parameters are used to cut the default-two way tie
				{
					if(subscriber.untie)
						subscriber.untie(); //remove any previous ties

					var subscription = O_O.events.subscribe(changeEvent, function(value) //subscribe to changes
					{
						action.apply(subscriber, [value]); //the action is executed in the targets context
					});

					subscriber.untie = function() //set an untie function so the event could be unsubscribed later
					{
						O_O.events.unsubscribe(subscription); //pass the handle to the subscription to the unsubscribe function
					}
				}

				function tieToParams()
				{
					$.each(vars, function(index, param)
					{
						if(param.tie)
						{
							values[index] = param(); //get the current value of the tied var

							vars[index] = param.tie({}, function(value) //replace the tieable with a dummy object to hold the untie function
							{
								values[index] = value;
								retFunc();
							});
						}
					});
				}

				tieToParams(); //tie the params that are passed with the constructor

				function untieParams()
				{
					$.each(vars, function(index, param)
					{
						if(param.untie)
							param.untie();
					});
				}

				return retFunc;
			}
		}
	}
});