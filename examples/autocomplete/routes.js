(function()
{
	"use strict";
	
	var cache;
	
	function rndBtwn(n1, n2)
	{
		return n1 + (Math.floor(Math.random() * (n2 - n1 + 1)));
	}
	
	function rndText()
	{
		var res = String.fromCharCode(rndBtwn(1,5) + 64);
		
		for(var i = 0, j = rndBtwn(1,5); i < j; ++i)
			res += (10 + (Math.round(Math.random() * 25))).toString(36);
			
		return res.toLowerCase();
	}

	window.routes = new function()
	{
	
		var self = this;
		
		self.all = function(params)
		{
			var res = [];
			
			for(var i = 0; i < 20; ++i)
				res.push(rndText());
			
			cache = res;
			
			return JSON.stringify(res);
		}
		
		self.filter = function(string)
		{
			var res = [];
			
			for(var i = 0; i < cache.length; ++i)
				if(cache[i].indexOf(string) > -1)
					res.push(cache[i]);
			
			return JSON.stringify(res);
		}
	}
})();