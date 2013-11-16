//from: https://developer.mozilla.org/en/docs/Web/API/window.setTimeout
//and has been modified a bit
define(['jquery'], function($)
{
	"use strict";
	
	Date.prototype.format = function (fmt)
	{
		//from: http://blog.magnetiq.com/post/497609110/javascript-date-formatting-an-unorthodox-way
		var date = this;

		return fmt.replace(
			/\{([^}:]+)(?::(\d+))?\}/g,
			function (s, comp, pad)
			{
				var fn = date["get" + comp];

				if (fn)
				{
					var v = (fn.call(date) +
					(/Month$/.test(comp) ? 1 : 0)).toString();

					return pad && (pad = pad - v.length) ? new Array(pad + 1).join("0") + v : v;
				}
				else
				{
					return s;
				}
			}
		);
	};
	
	//console.clear();
	console.log('Reloaded on: ' + new Date().format("{Hours:2}:{Minutes:2}:{Seconds:2}"));
	
	$(document).ready(function(){

		$('body').append('<script src="//localhost:35729/livereload.js"></script>');
		
	});
	
	
	return new function()
	{
		this.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */)
		{
			var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
			
			return window.setTimeout(vCallback instanceof Function ? function () {
				
				vCallback.apply(oThis, aArgs);
				
			} : vCallback, nDelay);
		}		
	}
	
});