/*develop v0.1.1*/
(function(window)
{
	"use strict";

	var develop = new function()
	{
		//enable liveReload
		this.liveReload = function()
		{
			addScript('//localhost:35729/livereload.js');
		}

		//from: https://developer.mozilla.org/en/docs/Web/API/window.setTimeout
		//and has been modified a bit

		//a timeout function with a 'this' context.
		this.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */)
		{
			var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);

			return window.setTimeout(vCallback instanceof Function ? function () {

				vCallback.apply(oThis, aArgs);

			} : vCallback, nDelay);
		}

		//an object that helps testing
		this.test = function()
		{
			if(!arguments[0])
				this.output = function(val){console.log(val)};

			else
				this.output = arguments[0];

			//publics
			//checking for expected results
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

			//calculates the time to execute a single function for 'n' times
			this.performance = function(func, repeat)
			{
				repeat = repeat || 100;

				var start = new Date();

				for(var i = 0; i < repeat; ++i)
					func();

				return new Date() - start;
			}

			//executes a queue of functions wit a specific interval between each call
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

		//logs the time till last call of timeDiff in milli seconds
		this.timeDiff = function()
		{
			var r = new Date() - lastDiff;

			lastDiff = new Date();

			return r;
		}

		this.import = function(imports, timeout)
		{
			timeout = timeout || 1000; //the 'rough' timeout before throwing a 'dependency not loaded error'. //the out 1000 sums to 1024ms

			for(var path in imports)
				for(var base in imports[path])
				{
					var scripts = Array.isArray(imports[path][base]) ? imports[path][base] : [imports[path][base]]; //convert script strings into arrays

					(function(deps, scripts, path)
					{
						setTimeout(function()
						{

							addModule(deps, scripts, path, 2);

						}, 1);

					})(base.replace(/ /g, '').split(','), scripts, path);
				}

			//add the module to the DOM
			function addModule(deps, scripts, path, interval)
			{
				var depsReady = true;

				for(var i = 0; i < deps.length; ++i)
					if(!(depsReady = depsReady * hasChild(window, deps[i])))
						if(interval > timeout) //throw an error if the dependency is not loaded within 1000ms (the number is 500 as we have to add the previous waits too)
							throw ('Could not load dependency: ' + deps[i]);
						else
							break;

				if(depsReady)
					for(var i in scripts)
						addScript(path + scripts[i] + '.js');
						//console.log(path + scripts[i] + '.js');

				else
					setTimeout(function()
					{
						addModule(deps, scripts, path, interval = interval * 2);

					}, interval);
			}

			function hasChild(parent, childPath)
			{
				var descendants = childPath.split('.');

				for(var i in descendants)
					if(typeof parent[descendants[i]] == 'undefined')
						return false; //the child does not exist
					else
						parent = parent[descendants[i]]; //move deeper

				return true;
			}
		}
		
		//a simple ajax request
		this.request = function(options)
		{
			var request = new XMLHttpRequest();
			request.open(options.method || 'GET', options.url || '', false);
			
			request.onreadystatechange = function (e)
			{
				if (request.readyState == 4)
					if (request.status == 200)
						options.success && options.success(request.responseText, request);
					else
						options.failure && options.failure(request);
			}
			
			request.send(options.data || null);
		}
	}

	//adds a script tag to the dom
	function addScript(path)
	{
		var el = document.querySelector('script');
		var scriptTag = document.createElement('script');

		scriptTag.setAttribute('src', path);

		el.parentElement.insertBefore(scriptTag, el.nextElementSibling);
	}

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

	function init()
	{
		console.log('Reloaded on: ' + new Date().format("{Hours:2}:{Minutes:2}:{Seconds:2}"));

		var developNode = document.querySelector('[data-develop]');

		if(developNode)

			develop.request({
			
				url: developNode.getAttribute('data-develop'),
				
				success: function(response)
				{
					var options = JSON.parse(response);

					if(options.imports)
						develop.import(options.imports);

					if(options.live)
						develop.liveReload();
				}
			});

		window.develop = develop; //add develop to the global scope
	}

	init(); //initialize the script

})(window);