this.connections = new function() //thanks to: bloody-jquery-plugins / pubsub.js
{
	var store = {}; //stores the connections

	this.trigger = function(/* String */topic, /* Array? */args){
		// summary:
		//                Publish some data on a named topic.
		// topic: String
		//                The channel to publish on
		// args: Array?
		//                The data to publish. Each array item is converted into an ordered
		//                arguments on the subscribed functions.
		//
		// example:
		//                Publish stuff on '/some/topic'. Anything subscribed will be called
		//                with a function signature like: function(a,b,c){ ... }
		//
		//        |                $.trigger("/some/topic", ["a","b","c"]);
		store[topic] && $.each(store[topic], function(){
				console.log(topic);
				this.apply($, args || []);
		});
	};

	this.plug = function(/* String */topic, /* Function */callback){
		// summary:
		//                Register a callback on a named topic.
		// topic: String
		//                The channel to subscribe to
		// callback: Function
		//                The handler event. Anytime something is $.trigger'ed on a
		//                subscribed channel, the callback will be called with the
		//                published array as ordered arguments.
		//
		// returns: Array
		//                A handle which can be used to unsubscribe this particular connection.
		//
		// example:
		//        |        O_O.plug("/some/topic", function(a, b, c){ /* handle data */ });
		//
		if(!store[topic]){
				store[topic] = [];
		}
		store[topic].push(callback);
		return [topic, callback]; // Array
	};

	this.unplug = function(/* Array */handle){
		// summary:
		//                Disconnect a subscribed function for a topic.
		// handle: Array
		//                The return value from a $.plug call.
		// example:
		//        |        var handle = $.plug("/something", function(){});
		//        |        O_O.unplug(handle);

		var t = handle[0];
		store[t] && $.each(store[t], function(idx){
				if(this == handle[1]){
					store[t].splice(idx, 1);
					if(!store[t].length) delete store[t];
				}
		});
	};

	this.get = function() //gets a new connection
	{
		var rnd = Math.random().toString(36).substring(2, 12);

		while(store[rnd]){rnd = Math.random().toString(36).substring(2, 12);} //gets a key of 10 letters that's not in the store

		return rnd;
	}
}