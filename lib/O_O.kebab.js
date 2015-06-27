/** a O_O plugin that helps with managing a group of boxes that share some common aspects. **/
(function(O_O) {

	"use strict";
	
	O_O.plugin('kebab', function kebab(data){
	
		var key,
			extend = O_O.utils.extend,
			extended = {},
			items = data.items,
			shared = data.shared,
			i = 0, keys = Object.keys(items), l = keys.length;
		
		for(; i < l;) {
		
			key = keys[i++];
			
			extended[key] = extend({}, items[key], shared);
		}
		
		return extended;
	});
	
})(window.O_O);