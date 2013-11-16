define('kiss', ['jquery'], function($)
{
	"use strict";
	
	return new function()
	{
		var O_O = this;
		var keyAttr = 'id'; //the default keyAttr is id
		var keySelector = '[id]'; //? the selector could be improved to find just the first descendants (not the child) with the keyAttr
		var eventMediator = $({});
		
		//public
		this.keyAttr = function(key) //change the keyAttr to be KISSed
		{
			keyAttr = key;
			keySelector = ['[', keyAttr, ']'].join('');
		}		
		
		//UI classes
		this.nested = function(data)
		{
			var self = this; //? use this for two way bindings
			
			var store;
			
			if(data)
			{
				store = {$html: data.$html};
				data.$html = undefined;
				$.extend(this, data);
			}			
			
			this.load = function($node) //loads the object
			{
				this.$node = $node;
				
				//digestHTML();
				if(store.$html)
					this.$html(store.$html);
				
				loadChildren();				
			}
			
			this.$html = function(binding)
			{
				if(binding.subscribe)
					binding.subscribe(this.$node, this.$node.html);
				
				else if(typeof binding == "function")
				{
					console.log(this.$node);
					binding.apply(this.$node);
				}
				
				else
					this.$node.html(binding); //the binding is just a vak
				
			}		
			
			var digestHTML = function() //populate the node with $ values
			{
				var $node = self.$node;
				
				if(self.$attr)
				{
					$.each(self.$attr, function(name, value)
					{
						if(name.subscribe)
						{
							name.subscribe($.proxy($node.attr, $node), self.$attr, name); //cut the default two way binding
						}
						
						$node.attr(name, value);
					})
				}
					
				if(self.$html)
				{
					if(self.$html.subscribe)
					{
						self.$html.subscribe($.proxy($node.html, $node), self, '$html'); //cut the default two way binding
					}
					
					else
						$node.html(self.$html);
				}
			}
			
			var loadChildren = function() //load the children with matching objects
			{
				var nodes = self.$node.find(keySelector); //selects all nodes with the keyAttr
				
				if(!nodes.length)
					return;
					
				nodes.each(function(index, child)
				{
					var $child = $(child);
					var childAttr = $child.attr(keyAttr);
					var child = self[childAttr];
					
					if($child.parents(keySelector)[0] != self.$node[0]) //this node has a parent with a keyAttr
						return;
					
					if(child) //if the tag has a matching object
					{
						if(!child.load)
						{
							self[childAttr] = new O_O.nested(child); //convert plain objects to O_O.nested; plain objects are used to maintain simplicity
						}
						
						self[childAttr].load($child); //load the node to the object
						
					} //tags without matching objects are left intact; so to play nice with other libs
				});
			}
		}
		
		this.collection = function(data)
		{
			$.extend(this, data);
			
			this.load = function($node)
			{
				var self = this;
				
				this.$node = $node;
				
				this.itemTemplate = this.$node[0].outerHTML;
				
				this.$node.html('');
				
				$.each(this.data, function(index, item)
				{
					self.$node.append(parseTemplate(self.itemTemplate, item));
				});
			}
		}
		
		//Data classes
		this.value = function(initialValue) //the binding is two-way until cut
		{
			//var value = newValue;
			var value;
			
			var $ed = $({});
			
			function ret(newValue)
			{
				if(!arguments.length)
					return value;
			
				if(value !== newValue)
				{
					value = newValue;
					$ed.trigger('change', value);
				}
				
				return this;
				
			}(initialValue);
			
			ret.subscribe = function(subscriber, action) //the second and third parameters are used to cut the default-two way binding
			{
				$ed.on('change', function(event, value) //subscribe to changes
				{
					action.apply(subscriber, [value]);
				});					
				
			}
			
			return ret;
		}

		var digest = function(object)
		{
			if(digest)
			{
				digest();
			}
			else if (object instanceof O_O.simple) //? replace this with a simple object
			{
				object.$node.html(object.html);
			}
		}
		
		var parseTemplate = function(html, object)
		{
			var fragment = $(html);
			
			var nodes = fragment.find(keySelector);
			
			nodes.each(function(index, item)
			{
				var node = $(item);
				var key = node.attr(keyAttr);
				
				node.html(object[key]);
			});
			
			return fragment.html();
		}
		
		var wrap = function(object)
		{
			return object;
		}
	}
});