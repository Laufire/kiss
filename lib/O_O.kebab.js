(function() {

	"use strict";
	
	//a O_O plugin that helps with managing a group of boxes that share some common aspects
	// depends on xtend.js
	
	O_O.plugin('kebab', function kebab(data){
	
		var key,
			extended = {},
			items = data.items,
			shared = data.shared,
			i = 0, keys = Object.keys(items), l = keys.length;
		
		for(; i < l;) {
		
			key = keys[i++];
			
			extended[key] = Object.extend({}, items[key], shared);
		}
		
		return extended;
	});
})();