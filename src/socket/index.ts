'use strict';

import {config} from '../config'
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');

var ioEvents = function(io) {

	io.of('/chatroom').on('connection', function(socket) {
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
}

var init = function(app){

	var server 	= require('http').Server(app);
	var io 		= require('socket.io')(server);

	io.set('transports', ['websocket','polling']);

	let port = config.redis.port;
	let host = config.redis.host;
	let password = config.redis.password;
	let pubClient = redis(port, host, { auth_pass: password });
	let subClient = redis(port, host, { auth_pass: password, return_buffers: true, });
	io.adapter(adapter({ pubClient, subClient }));

	io.use((socket, next) => {
		require('../session')(socket.request, {}, next);
	});
	console.log('server start');
	ioEvents(io);

	return server;
}

module.exports = init;
/*

import config 	from '../config'
let redis 	= require('redis').createClient;
import * as  adapter from 'socket.io-redis'

var ioEvents = function(io) {

	io.of('/chatroom').on('connection', function(socket) {
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
			socket.broadcast.to(11).emit('someEvent', 123);
		});
	});
}

let init = function(app){

	var server 	= require('http').Server(app);
	var io 		= require('socket.io')(server);

	io.set('transports', ['websocket','polling']);

	let port = config.redis.port;
	let host = config.redis.host;
	let password = config.redis.password;
	let pubClient = redis(port, host, { auth_pass: password });
	let subClient = redis(port, host, { auth_pass: password, return_buffers: true, });
	io.adapter(adapter({ pubClient, subClient }));

	io.use((socket, next) => {
		require('../session')(socket.request, {}, next);
	});
	console.log('server start');
	ioEvents(io);

	return server;
}

module.exports = init;

*/