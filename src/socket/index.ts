export const register = function(server, options) {
	console.log('serving socket io');

	server.register({
		register : require('hapi-io'),
		options : options
	});

	var io = server.plugins['hapi-io'].io;

	io.of('/chatroom').on('connection', function(socket) {
		socket.emit('Oh hii!');
		console.log('new connection');
		//socket.broadcast.emit('updateRoomsList', newRoom);

		socket.on('join', function(roomId) {
			socket.emit('someEvent', 1233333);
			socket.broadcast.to(4444).emit('someEvent', 123);
		});

		// When a socket exits
		socket.on('disconnect', function() {
			console.log(11);
			// Check if user exists in the session
			//if(socket.request.session.passport == null){
			//	console.log(22);
			//		return;
			//}
			console.log(33);
			socket.broadcast.to(123).emit('someEvent', 123);
		});
	});
};
