(function(window)
{
	"use strict";
	
	var O_O = new function()
	{
		//privates
		var keyAttr = 'id'; //the default keyAttr is id
		
		//init		
		var hider;
		this.hide = function()
		{
			var frag = document.createDocumentFragment();
			
			hider = document.createElement('style');
			hider.setAttribute('type', 'text/css');
			hider.innerHTML = 'body{display:none}';
			
			document.head.insertBefore(hider, document.querySelector('script'));
		}
		
		//*Loading with requirejs slows the hiding
		this.hide();
		
		this.show = function()
		{
			hider.parentNode.removeChild(hider);
		}

		//helpers
		var slice = Array.prototype.slice;
		
		var extract = function(obj, prop)
		{
			var ret;

			if(obj && obj[prop])
			{
				ret = obj[prop];

				delete obj[prop];
			}

			return ret;
		}
		
		var get$el = function(key, parent)
		{
			return $(parent || document).find(['[', keyAttr, '="', key, '"]:first'].join(''));
		}
		
		var getValue = function(value)
		{
			if(typeof value == 'function') //the value is a function
				return value.apply(this);

			else
				return value; //the value is just a value
		}
		
		var getFreeKey = function(obj) //gets a new connection
		{
			var key = '';
			
			do{
				
				key += (10 + (Math.round(Math.random() * 25))).toString(36);
			
			}while(obj[key]);

			return key;
		}
		
		//public
		this.keyAttr = function(key) //change the keyAttr to be KISSed
		{
			keyAttr = key;
		}

		this.classes = new function()/*base classes that could be extended by plugins*/
		{	
			this.pluggable = function() //a base class for other hosts like value, trans, function etc
			{
				/*the pluggable must implement
					a .plugs object to store the hooks
				*/
				
				this.plug = function()
				{
					var key = getFreeKey(this.plugs);
					this.plugs[key] = [arguments[0], arguments[1]];
					arguments[0]('hold', this.wrapper, arguments[1], key);
					return this.val();
				}
				
				this.unplug = function()
				{
					delete this.plugs[arguments[0]];
				}
				
				this.fire = function()
				{
					for(var key in this.plugs)
						this.plugs[key][0]('set', this.plugs[key][1], arguments[0]);
				}
			}
			
			this.guest = function()
			{
				/*the guest must implement
					a .set method to recieve the shouts
					a .holds object to store the hooks
				*/
				this.hold = function()
				{
					this.holds[arguments[1].join('/')] = [arguments[0], arguments[2]];
				}
				
				this.unhold = function()
				{
					//
				}
			}

			//UI classes
			this.element = function(data/*saved untill the element is set*/)
			{			
				var self = this;
				var $el;
				var events = {};
				
				this.holds = {}; /*stores the hosts like {propToChange: [wrapper function of the pluggable, id key provided by yhe pluggable]*/
				
				this.set = function() /*handles the trigger calls. !Not to be handled directly!*/
				{
					var args = arguments[0].concat(arguments[1]);
					$el[args.shift()].apply($el, args);
				}
				
				this.el = function() /*sets the $el for the element and load it with existing html, attrs etc*/
				{
					if(!arguments.length)
						return $el;

					$el = get$el.apply(null, arguments);
					
					this.self(data);
					data = undefined;
					
					loadChildren(this.wrapper, $el);
					
					return this.wrapper;
				}
				
				this.self = function() /*sets multiple attributes like html, attr at once*/
				{
					for(var i in arguments[0])
					{
						if(typeof arguments[0][i] == 'object') //the prop ia an enumerable
							for(var k in arguments[0][i])
								this[i](k, arguments[0][i][k])
						else
							this[i](arguments[0][i])
					}
					
					return this.wrapper;
				}
				/*
				this.default = function() //varies on the type of element
				{
					if(this.default.unplug)
						this.default.unplug();

					switch(this.$el[0].type)
					{
						case 'text':
						case 'select-one':
						case 'select-multiple':

							defaultFactory.apply(this, [arguments[0], ['val']]); 

						break;

						case 'checkbox':

							defaultFunction.apply(this, [arguments[0], ['prop', 'checked']);
							
						break;

						default: //the tag is not a control
							this.html(arguments[0]);
					}
				}
				*/
				this.html = function()
				{
					return $factory.apply(this, [['html'], slice.call(arguments)]);					
				}
				
				this.val = function()
				{
					return $factory.apply(this, [['val'], slice.call(arguments)]);					
				}
				
				this.prop = function()
				{
					return $factory.apply(this, [['prop', arguments[0]], slice.call(arguments, 1)]);
				}
				
				this.attr = function()
				{
					return $factory.apply(this, [['attr', arguments[0]], slice.call(arguments, 1)]);
				}
				
				this.class = function()
				{
					if(arguments.length == 1)
						return this.$el.hasClass(arguments[0]);
					else
						return $factory.apply(this, [['toggleClass', arguments[0]], slice.call(arguments, 1)]);
				}
				
				this.event = function()
				{
					var key = 'event/' + arguments[0];
					
					if(events[key]) //the event already has a handler
						$el.off(arguments[0], events[key]); //remove the handler; having a single handler per event by desugn, is to maintain simplicity and structure. 'A button could turn on only a single light'.

					events[key] = $.proxy(arguments[1], this);
					$el.on(arguments[0], events[key]);
					
					return this.wrapper
				}
				
				this.wrapper = function()
				{
					if(arguments.length > 1)
					{
						var args = slice.call(arguments);
						return self[args.shift()].apply(self, args);
					}
					
					if(arguments.length == 1)
					{
						if(typeof arguments[0] == 'string')
							return self[arguments[0]]();
							
						else
							return self.wrapper(arguments[0]); //load an object to set multiple properties
					}
					
					return self.wrapper;
				}
				
				//helpers
				var $factory = function() //sets various props through jQuery
				{
					if(!arguments[1].length)
						return $el[arguments[0].shift()].apply($el, arguments[0]);
					
					var key = arguments[0].join('/');
					
					if(this.holds[key]) //unplugs the existing plug
					{
						this.holds[key][0]('unplug', this.holds[key][1]);
						delete this.holds[key];
					}
					
					if(typeof arguments[1][0] == 'function') //calls the function; will be plugged to it if it were a plug
					{
						$el[arguments[0][0]].apply($el, [
							arguments[0].slice(1).concat(
								[arguments[1][0](this.wrapper, arguments[0])]
							)]
						);
						/*attr and class are not working with functions
						console.log(arguments[0][0]);
						console.log(arguments[0].slice(1).concat(
								[arguments[1][0](this.wrapper, arguments[0])]
							));*/
					}
					
					else
						$el[arguments[0].shift()].apply($el, arguments[0].concat(arguments[1]));
						
					return this.wrapper;
				}
				
				var defaultFactory = function(value, method) //afactory function that handles the default assignings
				{
					value(this.default, function(value){method(value)}); //subscribe to future changes

					this.events({
						change: function() //enable two-way binding
						{
							value(method());
						}
					});
				}
				
				var loadChildren = function(obj, $el)
				{
					for(var childName in obj) //load child objects with matching elements
					{
						if(!get$el(childName, $el).length)
							continue;  //tags without matching objects are left intact; so to play nice with other libs

						//console.log(childName);
						
						if(typeof obj[childName] == 'object') //a plain object containing self attrs and children
						{
							obj[childName] = O_O.element(obj[childName]);
							obj[childName]('el', childName, $el);
						}
						else if(obj[childName] == 'function') //a pluggable value
						{
							obj[childName] = O_O.element({$:{default: obj[childName]}}); //create an element with the assigned object as its default property
							obj[childName]('el', childName, $el);
						}					
						else
							obj[childName]('el', childName, $el); //some other object
						
					}
				}
			}
			
			this.element.prototype = new this.guest;
			
			//Data Classes
			this.value = function(val) // a pluggable that lists a simple value
			{
				var self = this;
				
				this.plugs = {};
				
				this.val = function()
				{					
					if(!arguments.length)
						return val;
					
					else
					{
						if(arguments[0] === val)
							return;
						
						this.fire([arguments[0], val]); //send both the new and the old values
						val = arguments[0];
					}
				}
				
				this.wrapper = function()
				{
					if(arguments.length > 1)
						return self.plug.apply(self, arguments);
					
					else if(arguments.length == 1)
						return self.val(arguments[0]);
						
					return self.val();
				}
			}

			this.value.prototype = new this.pluggable;
			
			this.trans = function(val, getter, setter) //a pluggable that could transform its listd value using getters and setters
			{
				
			}

			this.trans.prototype = new this.pluggable;
			
			this.watch = function()
			{
				//
			}
		}

		//Decorators
		//UI element wrappers
		this.element = function() //an element that could have nested elements
		{
			var _element = new O_O.classes.element(extract(arguments[0], '$') || {});
			
			$.extend(_element.wrapper, arguments[0]);
			
			return _element.wrapper;
		}

		//Data wrappers
		this.value = function() // a pluggable value
		{
			return new O_O.classes.value(arguments[0]).wrapper;
		}
	}
	
	window.O_O = O_O;
	
})(window);