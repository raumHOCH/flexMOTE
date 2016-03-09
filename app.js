var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var compress = require('compression');

// ---- client -----------------------------------------------------------------
app.use(compress());
app.use(express.static(__dirname + '/public'));

// ---- socket.io --------------------------------------------------------------
/**
 * we store all room settings in a global object. These data will be updated as
 * soon as rooms are created of closed.
 */
io.sockets.adapter.settings = {};

/**
 * @TODO implement channels / rooms / namespaces
 * @param {Object} socket
 */
io.on('connection', function(socket) {
    console.log('socket.io | connected:', socket.id);

    // some event handlers
    /**
     * handle incoming messages
     * @param {Object} params
     */
    socket.on('cmd', function(params, callback) {
        console.log("socket.io | cmd:", socket.id, params.target);

        // forward <cmd> to params.target or ALL
        if (params.target && params.target != '*') {
            io.to(params.target).emit('cmd', params);
        }
        else {
            socket.broadcast.to(socket.room).emit('cmd', params);
        }

        // fire callback (if any)
        if (callback) {
            callback();
        }
    });

    /**
     * @param {Function} callback
     */
    socket.on('ping', function(callback) {
        console.log("socket.io | ping (" + socket.id + ")");
        if (callback) {
            callback();
        }
    });

    /**
     * register a room
     */
    socket.on('register', function(settings, callback) {
        var room = Math.random().toString().replace(".", "").substr(0, 5);

        // :TODO: add credentials check
        console.log("socket.io | user (" + socket.id + ") - register:", settings);
        socket.join(room);
        socket.room = room;

        io.sockets.adapter.settings[room] = settings;

        console.log(io.sockets.adapter);
        callback(200, room);
    });

    /**
     * join a room, if no room specified create one
     */
    socket.on('join', function(room, callback) {
        console.log("socket.io | user (" + socket.id + ") - join: " + room);

        if (!room || !io.sockets.adapter.rooms[room]) {
            callback(404);
        }

        socket.join(room);
        socket.room = room;
        socket.broadcast.to(socket.room).emit('cmd', {
            action: 'set',
            type: 'user',
            id: socket.id,
            data: {
                connected: true
            }
        });

        callback(200, room);
    });

    /**
     *
     */
    socket.on('leave', function(callback) {
        console.log("socket.io | user (" + socket.id + ") - leave");

        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('cmd', {
            action: 'set',
            type: 'user',
            id: socket.id,
            data: null
        });

        if (!io.sockets.adapter.rooms[socket.room]) {
            delete io.sockets.adapter.settings[socket.room];
        }
        delete socket.room;

        callback(200);
    });

    /**
     * socket disconnected
     */
    socket.on('disconnect', function() {
        console.log('socket.io | user disconnected:', socket.id, socket.room);

        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('cmd', {
            action: 'set',
            type: 'user',
            id: socket.id,
            data: null
        });

        if (!io.sockets.adapter.rooms[socket.room]) {
            delete io.sockets.adapter.settings[socket.room];
        }
        delete socket.room;
    });

});

// ---- go! --------------------------------------------------------------------
http.listen(3000, function() {
    console.log('flexMOTE - core; listening on *:3000');
});
