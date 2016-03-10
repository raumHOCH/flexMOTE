var DEBUG = true;

// ----- dependencies ----------------------------------------------------------
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var compress = require('compression');
var flexMOTE = require('./flexMOTE.js');

// ----- initialization --------------------------------------------------------
app.use(compress());
app.use(express.static(__dirname + '/public'));
flexMOTE.init(io, DEBUG);

// ----- socket.io -------------------------------------------------------------
/**
 * @param {Object} socket
 */
io.on('connection', function(socket) {
    DEBUG && console.log('socket.io | connected', socket.id);
    socket.on('cmd', flexMOTE.onCommand);
    socket.on('ping', flexMOTE.onPing);
    socket.on('register', flexMOTE.onRegister);
    socket.on('join', flexMOTE.onJoin);
    socket.on('leave', flexMOTE.onLeave);
    socket.on('disconnect', flexMOTE.onDisconnect);
});

// ----- go! -------------------------------------------------------------------
http.listen(3000, function() {
    DEBUG && console.log('flexMOTE - core; listening on *:3000');
});
