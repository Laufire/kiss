/** a O_O.plugin to help with making requests 
	
	version - 0.0.1 (based on utils.js 0.3.7)
*/
(function(O_O) {

	"use strict";
	
	O_O.plugin('request', function(options) {
		
		/* ex:
			Utils.request({
			
				url: 'http"// example.com/',
				
				data: {username: 'user', password: 'pass'},
				
				method: 'POST'
			});
		*/
		
		/* Data */
		var HttpRequest = new XMLHttpRequest()
		
		, method = options.method || 'GET'
		
		, data = options.data || {}
		
		, type = options.type || 'JSON'
		
		, url = getUrl(options, data)
		
		, timeout = options.timeout
		
		/* State */
		, responded = false
		
		/* Helpers */
		, respond = function(response) {
		
			if(! responded) {
			
				options.callback(response, HttpRequest);
				
				responded = true;
			}
		}
		;
		
		HttpRequest.open(method, url);
		
		if(method == 'GET') {
			
			data = null;
			
		} else {
			
			data = getFormData(data);
		}
		
		HttpRequest.onreadystatechange = function() {
			
			var response = {};
			
			if(HttpRequest.readyState == 4) {
			
				var status = HttpRequest.status
				, text = HttpRequest.responseText
				;
				
				if(status > 199 && status < 400) {
					
					if(type == 'JSON') {
						
						try {
						
							response.result = JSON.parse(text);
						}
						catch(e) {
							
							response = {
							
								error: {
								
									message: 'JSON not delivered.'
									
									, text: text
									
									, typeMismatch: true
								}
							}
						}
					}
					else {
					
						response.result = text;
					}
				}
				else if (status === 0) {
				
					response = {
					
						error: {
						
							message: 'Couldn\'t complete the request.'
							
							, failedConnection: true
						}						
					}
				}
				else {
				
					response = {
					
						error: {
						
							message: 'Couldn\'t complete the request.'
							
							, text: text
							
							, serverError: true
						}
					}
				}
				
				respond(response);
			}
		}
		
		if(timeout) {
		
			HttpRequest.timeout = timeout;
			
			HttpRequest.ontimeout = function() {
			
				respond({
		
					error: {
					
						message: 'The request timed out.'
						
						, timeout: true
					}
					
				});					
			}
		}
		
		try {
			
			HttpRequest.send(data);
		}
		catch(e) {
		
			respond({
			
				error: {
				
					message: 'Couldn\'t complete the request.'
					
					, failedConnection: true
				}
				
			});
		}
	});
	
	/* Helpers */
	var getKeys = Object.keys;
	
	// prepares the url along with cache busting
	function getUrl(options, params) {
		
		var url = options.url
		, cacheBuster = options.cache ? '' : '_=' + Date.now() + '_' + rndBtwn(0, 100000) // adds _=TIMESTAMP_rndNum to the url query (courtesy: jQuery) // ! check: could rndString with fixed length be used instead
		, queryStr = options.method == 'GET' ? serialize(params) : '';
		
		if(cacheBuster)
			cacheBuster = (queryStr ? '&' : '?') + cacheBuster;
		
		return url + queryStr + cacheBuster;
	}
	
	// serializes the data for 'GET' requests
	function serialize(params) {
		
		var i = 0, key
		, keys = getKeys(params)
		, res = '?'
		;
		
		for(; i < keys.length;)
			key = keys[i++], res += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
		
		return res.substr(0, res.length - 1);
	}
	
	// builds a formData object from plain objects for 'POST' requests
	function getFormData(params){
		
		if(params instanceof FormData)
			return params;
		
		var i = 0, key
		, keys = getKeys(params)
		, formData = new FormData()
		;
			
		for(; i < keys.length;)
			key = keys[i++], formData.append(key, params[key]);
			
		return formData;
	}
	
	function rndBtwn(n1, n2){
		
		return n1 + (Math.floor(Math.random() * (n2 - n1 + 1)));
	}
	
})(O_O);