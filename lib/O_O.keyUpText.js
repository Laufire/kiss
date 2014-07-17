(function(O_O) {

	"use strict";
	
	//a O_O plugin that changes a given val on keyup
	
	O_O.plugin('keyUpText', function keyUpText(target /*a O_O.value*/)
	{
		return new O_O.class.box({
		
			$: {
			
				prop: {
				
					value: target
				},
				
				event: {
					
					keyup: function(e)
					{
						target(e.target.value);
					}
				}
			}
		});
	});
	
})(window.O_O);