(function() {

	//a O_O plugin providing commonly used 'trans'es
	
	"use strict";
	
	O_O.plugin('trans', {
	
		count: O_O.trans(function(val) {
		
			return val.length;
		}),

		truthy: O_O.trans(function(val) {
		
			return Boolean(val);
		}),

		falsy: O_O.trans(function(val) {
		
			return !Boolean(val);
		}),
		
		num: O_O.trans(function(val) {
		
			return parseInt(val, 10);
		}),
		
		equal: O_O.trans(function(val, source, data) {
		
			return val == data;
		}),
		
		unequal: O_O.trans(function(val, source, data) {
		
			return val != data;
		}),
		
		template: O_O.trans(function(val, source, template) { //for simple string replacements
		
			//ex: O_O.plugin.trans.template(aO_OValue, 'before-{{}}-after')
			return template.replace('{{}}', val);
		}),
		
		apply: O_O.trans(function(val, source, params) { //call one of the methods of 'val'
		
			//ex: String replacement, O_O.trans.plugin.apply(aO_OValue, ['replace', ['stringToSearch', 'replaceWith']])
			return val[params[0]].apply(val, params[1]);
		})
	});
	
})();