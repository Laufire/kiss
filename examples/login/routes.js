(function() {

	"use strict";
	
	window.routes = new function() {
	
		var self = this;
		
		self.login = function(params) {
		
			var ret = false;
			
			params.username && params.password && params.username === 'user' && params.password === 'pass' && (ret = true);
			
			return ret;
		}
	}

})();