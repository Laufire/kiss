(function(O_O)
{
	//a O_O plugin providing commonly used 'trans'es
	
	"use strict";
	
	O_O.plugin('trans', {
	
		count: O_O.trans(function(val)
		{
			return val.length;
		}),

		truthy: O_O.trans(function(val)
		{
			return Boolean(val);
		}),		

		falsy: O_O.trans(function(val)
		{
			return !Boolean(val);
		})
	});
})(O_O);