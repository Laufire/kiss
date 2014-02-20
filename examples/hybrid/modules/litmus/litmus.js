window.currentModule = (function() {

	return {
	
		name: 'litmus',
		
		commands: {
	
			login: function(params) {
			
				if(!params.length)
					return {type: 'error', data: 'We need the connection parameters'};
				
				Connection.request({
					
					url: 'modules/litmus/connect.php',
					data: {params: ['localhost', 'litmus_v1'].concat(params)}
				});
			},
			
			logout: function() {
			
				Connection.request({
			
					url: 'modules/litmus/connect.php'
				});
			}
		},
		
		defaultAction: function(params, command) {
		
			Connection.request({
			
				url: 'modules/litmus/exec.php',
				data: {command: command, params: params}
			});
		}
	}
})();