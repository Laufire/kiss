(function()
{
	"use strict";
	
	//a O_O plugin that helps with l10n and i18n by dynamically setting UI props
	
	O_O.plugin('texter', function(target, source){
	
		traverse(target, source);
		
	});
	
	function traverse(target, source){
	
		var keys = Object.keys(source),
			i = 0,
			key, type, sProp, tProp;
		
		for(; i < keys.length;){
			
			key = keys[i++],
			sProp = source[key],
			tProp = target[key],
			type = typeof sProp;
			
			if(Array.isArray(sProp)) //array representation of a single property like ['attr', 'palceholder', 'username']
				tProp.$[sProp[0]](sProp[1], sProp[2]);
			
			else if(type == 'object')
			
				if(sProp.$) //$ props
					tProp.$.set(sProp.$);
					
				else //nested object
					traverse(tProp, sProp)
			
			else
				if(typeof tProp != 'function') //a O_O.value
					tProp.$.text(sProp)
					
				else //$.text
					tProp(sProp)
		}
	}
})();