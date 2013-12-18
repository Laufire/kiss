/*develop v0.0.7*/
define(['microDOM'], function(DOM)
{
	"use strict";
	
	var stopLive;
	
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
	
	DOM.ready(function(){

		if(!stopLive)
			DOM.$('head').append('script').attr('src', '//localhost:35729/livereload.js');
	});
	
	
	return new function()
	{
		this.stopLive = function()
		{
			stopLive = true;
		}
		//from: https://developer.mozilla.org/en/docs/Web/API/window.setTimeout
		//and has been modified a bit
		this.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */)
		{
			var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
			
			return window.setTimeout(vCallback instanceof Function ? function () {
				
				vCallback.apply(oThis, aArgs);
				
			} : vCallback, nDelay);
		}

		this.test = function()
		{
			if(!arguments[0])
				this.output = function(val){console.log(val)};
				
			else
				this.output = arguments[0];
				
			//publics
			this.forResult = function(pairs) //[[result, expectation]]
			{
				for(var i in pairs)
				{
					if(pairs[i][0] === pairs[i][1])
						this.output(i + ': passed');
					else
						this.output(i + ': failed');
				}
			}
			
			this.performance = function(func, repeat)
			{
				repeat = repeat || 100;
				
				var start = new Date();
				
				for(var i = 0; i < repeat; ++i)
					func();
					
				return new Date() - start;
			}
			
			this.queue = function(tests, interval)
			{
				if(!tests.length)
					return;			
				
				var i = 0, l = tests.length - 1;
				interval = interval || 2000;
				
				var timer = setInterval(function()
				{
					tests[i++]();
					
					if(i > l)
						clearInterval(timer);
						
				}, interval);
			}
		}
		
		var lastDiff;
			
		this.timeDiff = function()
		{
			var r = new Date() - lastDiff;
			
			lastDiff = new Date();
			
			return r;
		}
	}
});