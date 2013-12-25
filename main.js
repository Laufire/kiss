var observed = O_O.value(false),
	pv = O_O.value('Dynamic Value'),
	
	App = O_O.box({
		
		simple: {
		
			input: observed,
			
			simpleString: {
				
				$: {
				
					html: pv,
					
					attr: {
					
						//style: 'background: red'
						style: function(){return 'background: red'}
					},
					
					class: {
					
						hidden: observed
						//hidden: function(){return true}
					},
					
					event: {
					
						click: function(){
						
							alert('The html of this element is: ' + this.html());
						}
					}
				},
				
				voidOfElement: 'So wouldn\'t be used as for an element'
				
			},
			
			check:
			{
				$: {
				
					prop: {
					
						checked: false
					},
					
					event: {change: function(){observed(!observed())}}
				}
			}
		}
	});
	
O_O.ready(function()
{
	App.$.at('App');
	pv(1);
});		