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

			//? thanks to: bloody-jquery-plugins / pubsub.js

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
			var initValues = {};
			var attrFuncs = {}; //stores attr specific functions that are tied
			var propFuncs = {}; //stores prop specific functions that are tied
				
			if(data)
			{
				if(data.$)
				{
					initValues = data.$;
					data.$ = undefined;
				}
				
				$.extend(this, data);
			}
			
			var self = this;
			
			var attrsAndProps = function(type, keys)
			{
				var store = (type == 'attr' ? attrFuncs : propFuncs);

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
						self.$.node[type](key, value());

						store[key] = function(value) //create a function to change the specific value
						{
							self.$.node[type](key, value);
						}

						value.tie(store[key], store[key]);
					}
					else
					{
						if(typeof value == 'function') //the value is a function
							self.$.node[type](key, value.apply(this.$node));

						else
							self.$.node[type](key, value); //the value is just a value
					}
				});
			}

			var changeHTML = function(html)
			{
				self.$.node.html(html);
				loadChildren();
			}
			
			this.$ = new function()
			{
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
						if(typeof value == 'function') //the value is a function
							changeHTML(value.apply(this));

						else
							changeHTML(value); //the value is just a value
					}
				}
				
				this.attrs = function(keys)
				{
					attrsAndProps('attr', keys);
				}

				this.props = function(keys)
				{
					attrsAndProps('prop', keys);
				}
				
				this.events = function(events)
				{
					$.each(events, function(event, handler)
					{
						//? if the event already has a handler 'off' it.
						self.$.node.on(event, handler);
					});
				}
			}
			
			this.load = function($node) //loads the object
			{
				this.$.node = $node;
					
				if(initValues.default)
					setDefaultValue();
				
				//populate the node with initial $ values
				if(initValues.html)
					this.$.html(initValues.html);

				if(initValues.attrs)
					this.$.attrs(initValues.attrs);

				if(initValues.props)
					this.$.props(initValues.props);
					
				if(initValues.events)
					this.$.events(initValues.events);
				
				if(!initValues.html)
					loadChildren();
				
				if(initValues.init) //a function to execute as the init function
					initValues.apply(self);
				
				initValues = undefined;
			}
			
			var loadChildren = function() //load the children with matching objects
			{
				var nodes = self.$.node.find(keySelector); //selects all nodes with the keyAttr

				if(!nodes.length)
					return;

				nodes.each(function(index, child)
				{
					var $child = $(child);
					var childAttr = $child.attr(keyAttr);
					var child = self[childAttr];

					if($child.parents(keySelector)[0] != self.$.node[0]) //this node has a parent with a keyAttr
						return;

					if(child) //the tag has a matching object
					{
						if(!child.load) //the object doesn't load child elements so wrap it with an element
						{
							if(self[childAttr].tie) //the object is a tiable
								self[childAttr] = new O_O.element({$:{default:child}}); //tie the html to the object
							else
								self[childAttr] = new O_O.element(child); //convert plain objects to O_O.element; plain objects are used to maintain simplicity
						}

						self[childAttr].load($child); //load the node to the object

					} //tags without matching objects are left intact; so to play nice with other libs
				});
			}
			
			var setDefaultValue = function()
			{
				var defaultValue = initValues.default;
				
				var tagName = self.$.node.context.tagName;
				
				//?use switch instead
				//? is there a way to find whwther the given element is a control
				if(tagName === 'INPUT' || tagName === 'SELECT')
				{
					var type = self.$.node.context.type;
					
					//check for other input types like radio, multi-select etc
					if(type === 'text' || type === 'select-one')
					{
						self.$.props({value: defaultValue});
						
						if(defaultValue.tie) //the reference is to a tiable
							self.$.events({
								change: function(e) //tie the change event with the tiable
								{
									defaultValue(self.$.node.val());
								}
							})
					}
					else if(type === 'checkbox')
					{
						self.$.props({checked: defaultValue});
						
						if(defaultValue.tie) //the reference is to a tiable
							self.$.events({
								change: function(e) //tie the change event with the tiable
								{
									defaultValue(self.$.node.prop('checked'));
								}
							})
					}
				}
				else
					initValues.html = initValues.default;
			}
		}

		this.collection = function(data)
		{
			$.extend(this, data);

			this.load = function($node)
			{
				var self = this;

				this.$node = $node;

				this.itemTemplate = this.$node.children().first()[0].outerHTML;

				this.$node.html('');

				$.each(this.data, function(index, item)
				{
					self.$node.append(parseTemplate(self.itemTemplate, item));
				});
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

							vars[index] = param.tie({}, function(value) //replace the tiable with a dummy object to hold the untie function
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