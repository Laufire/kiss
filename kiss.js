/*!
KISS rw0.0.1

NO2 Liscence
*/
(function(window)
{
	"use strict";

	var O_O = new function()
	{
		//helpers
		//var $ = DOM.$

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

		function extend(target)
		{
			slice.call(arguments, 1).forEach(function(source)
			{
				for(var key in source)
					if(source[key] !== undefined)
						target[key] = source[key];
			});

			return target
		}

		function extract(obj, prop)
		{
			var ret;

			if(obj && obj[prop])
			{
				ret = obj[prop];

				delete obj[prop];
			}

			return ret;
		}

		function get$el(key/*, parent*/)
		{
			if(arguments.length > 1)
				return DOM.$('[' + keyAttr + '="' + key + '"]', arguments[1]);

			return DOM.$('[' + keyAttr + '="' + key + '"]');
		}

		function get(obj, key)
		{
			if(typeof obj[key] == 'function') //the key is a function
				return key();
			
			return obj[key];
		}
		
		function set(obj, key, value)
		{
			if(typeof obj[key] == 'function') //the key is a function
				return obj[key](value);
			
			return obj[key] = value;
		}

		function getEmptyKey(obj) //returns a 'empty' key name for the given object; keys might be overwritten if they have a falsy value
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
					var key = getEmptyKey(this.plugs);
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

				self.holds = {}; /*stores the hosts like {propToChange: [wrapper function of the pluggable, id key provided by yhe pluggable]*/

				self.set = function() /*handles the trigger calls. !Not to be handled directly!*/
				{
					var args = arguments[0].concat(arguments[1]);
					$el[args.shift()].apply($el, args);
				}

				self.el = function() /*sets the el for the element and load it with existing html, attrs etc*/
				{
					if(!arguments.length)
						return $el;

					$el = get$el.apply(null, arguments);

					self.$(data);
					data = undefined;

					loadChildren(self.wrapper, $el.el);

					return self.wrapper;
				}

				self.value = function(newVal)
				{
					if($el.el instanceof HTMLInputElement) //?textarea
					{
						var prop;

						if($el.el.type == 'checkbox') //?radio
							prop = 'checked';
						else
							prop = 'value';

						if(newVal)
						{
							self.prop(prop, newVal);

							if(typeof newVal == 'function')
								self.event('change', function(e)
								{
									newVal(e.currentTarget.value);
								});
						}
						else
							return self.prop(prop);
					}

					else if($el.el instanceof HTMLButtonElement)
					{
						if(!newVal)
							return;

						self.event('click', newVal);
					}

					else
					{
						if(newVal)
							self.html(newVal);

						else
						{
							var ret = {};

							for(var key in self.wrapper)
							{
								var val = self.wrapper[key]();

								if(typeof val != 'undefined')
									ret[key] = val;
							}

							return ret;
						}
					}

					return self.wrapper;
				}

				self.$ = function(data) /*sets multiple attributes like html, attr at once*/
				{
					for(var i in arguments[0])
					{
						if(typeof arguments[0][i] == 'object') //the prop is an enumerable
							for(var k in arguments[0][i])
								self[i](k, arguments[0][i][k])
						else
							self[i](arguments[0][i])
					}

					return self.wrapper;
				}

				self.html = function()
				{
					return $factory(['html'], slice.call(arguments));
				}

				self.val = function()
				{
					return $factory(['prop', 'value'], slice.call(arguments));
				}

				self.prop = function()
				{
					return $factory(['prop', arguments[0]], slice.call(arguments, 1));
				}

				self.attr = function()
				{
					return $factory(['attr', arguments[0]], slice.call(arguments, 1));
				}

				self.class = function()
				{
					return $factory(['class', arguments[0]], slice.call(arguments, 1));
				}

				self.event = function()
				{
					var key = 'event/' + arguments[0];

					if(events[key]) //the event already has a handler
						$el.off(arguments[0], events[key]); //remove the handler; having a single handler per event by desugn, is to maintain simplicity and structure. 'A button could turn on only a single light'.

					$el.on(arguments[0], events[key] = arguments[1].bind(self));

					return self.wrapper
				}

				self.wrapper = function()
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
							return digest(arguments[0]);
					}

					return self.value();
				}

				//helpers
				function digest(data) /*settin properties for sel and children !This might alter the passed data object!*/
				{
					if(data.$)
						self.$(extract(data, '$'));

					for(var key in data)
						if(self.wrapper[key].plug)
							self.wrapper[key](data[key]);
						else
							self.wrapper[key]('value', data[key]);
				}

				function $factory() //sets attr/prop/etc via $
				{
					if(!arguments[1].length)
						return $el[arguments[0].shift()].apply($el, arguments[0]);

					var key = arguments[0].join('/');

					if(self.holds[key]) //unplugs the existing plug
					{
						self.holds[key][0]('unplug', self.holds[key][1]);
						delete self.holds[key];
					}

					if(typeof arguments[1][0] == 'function') //calls the function; will be plugged to it if it were a plug
					{
						$el[arguments[0][0]].apply($el,
							arguments[0].slice(1).concat(
								[arguments[1][0](self.wrapper, arguments[0])]
							)
						);
					}

					else
						$el[arguments[0].shift()].apply($el, arguments[0].concat(arguments[1]));

					return self.wrapper;
				}

				var loadChildren = function(obj, el)
				{
					for(var childName in obj) //load child objects with matching elements
					{
						if(!get$el(childName, el).el)
							continue;  //tags without matching objects are left intact; so to play nice with other libs

						//console.log(childName);

						if(typeof obj[childName] == 'object') //a plain object containing self attrs and children
						{
							obj[childName] = O_O.element(obj[childName]);
						}
						//else if(typeof obj[childName] == 'function') //a pluggable value
						else
						{
							obj[childName] = O_O.element({$:{value: obj[childName]}}); //create an element with the assigned object as its default value
						}
						
						obj[childName]('el', childName, el);

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

			this.object = function(data)
			{
				this.wrapper = function(newData)
				{
					if(newData)
					{
						for(var key in newData)
							set(data, key, newData[key]);
					}
					else
					{
						var ret = {};

						for(var i in data)
							get(data, key);

						return ret;
					}
				}

				extend(this.wrapper, data);
			}

			this.watch = function()
			{
				//
			}
		}

		//Decorators
		//UI element wrappers
		this.element = function(data) //an element that could have nested elements
		{
			var _element = new O_O.classes.element(extract(data, '$'));
			//var _element = new O_O.classes.element(data && data.$ ? extract(data, '$') : {});

			extend(_element.wrapper, data);

			return _element.wrapper;
		}

		//Data wrappers
		this.value = function() // a pluggable value
		{
			return new O_O.classes.value(arguments[0]).wrapper;
		}

		this.object = function(data)
		{
			return new O_O.classes.object(data).wrapper;
		}
	}

	window.O_O = O_O;

})(window);