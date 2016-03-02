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
     * join a room, if no room specified create one
     */
    socket.on('join', function(room, callback) {
        var room = room || Math.random().toString().replace(".", "").substr(0, 5);

        console.log("socket.io | user (" + socket.id + ") - join: " + room);

        socket.join(room);
        socket.room = room;
        socket.broadcast.to(socket.room).emit('cmd', {
            action: 'join',
            type: 'user',
            id: socket.id
        });

        if (callback) {
            callback(room);
        }
    });

    /**
     *
     */
    socket.on('leave', function(room) {
        console.log("socket.io | user (" + socket.id + ") - leave: " + room);

        socket.leave(room);
        socket.broadcast.to(room).emit('cmd', {
            action: 'leave',
            type: 'user',
            id: socket.id
        });
        delete socket.room;
    });

    /**
     * socket disconnected
     */
    socket.on('disconnect', function() {
        console.log('socket.io | user disconnected:', socket.id, socket.room);

        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('cmd', {
            action: 'disconnect',
            type: 'user',
            id: socket.id
        });
        delete socket.room;
    });

});

// ---- go! --------------------------------------------------------------------
http.listen(3000, function() {
    console.log('reMOTE.js - core; listening on *:3000');
});
