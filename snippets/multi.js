O_O.multi = function(combine) { // generates a wrapper a that plugs into mutiple O_O.values and combines them when ever a value changes

	return function(/* hosts */) {
	
		var args = arguments
		, l = args.length
		, prev = (function() {
		
			var vals = []
			, i = 0
			;
			
			for(; i < l;)
				vals.push(args[++i]());
			
			return combine.apply(null, vals);
		})()
		
		, wrap = function() {
		
			return prev;
		}
		;
		
		wrap.plug = function(outFunc) {
		
			var unplugs = []
			
			, plug = function() {
			
				var vals = []
				, i = 0
				;
				
				for(; i < l;)
					vals.push(args[++i]());
				
				var combined = combine.apply(null, vals);
				
				if(prev !== combined) {
				
					prev = combined;
					
					outFunc(combined);
				}
			};
			
			for(var i = 0; i < l;)
				unplugs.push(args[++i].plug(plug)); // collect the unplugs of all the hosts
			
			return function() { // the unplug function
			
				for(var i = 0; i < l;)
					unplugs[++i](); // unplug from all the hosts
			}
		}

		return wrap;
	}
}