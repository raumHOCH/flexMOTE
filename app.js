var DEBUG = true;

// ----- dependencies ----------------------------------------------------------
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var compress = require('compression');
var reservations = require('./reservations.json');

// ----- http ------------------------------------------------------------------
app.use(compress());
app.use(express.static(__dirname + '/public'));

// ----- socket.io -------------------------------------------------------------
/**
 * we store all room settings in a global object. These data will be updated as
 * soon as rooms are created of closed.
 */
io.sockets.adapter.settings = {};

/**
 * @param {Object} socket
 */
io.on('connection', function(socket) {
    DEBUG && console.log('socket.io | connected:', socket.id);

    /**
     * handle incoming <cmd> message, actually forwarding to the right receiver(s)
     *
     * @param {Object} params
     * @param {Function} callback
     */
    socket.on('cmd', function(params, callback) {
        DEBUG && console.log("socket.io | cmd:", socket.id, params.target);

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
     * ping message to measure latency
     *
     * @param {Function} callback
     */
    socket.on('ping', function(callback) {
        // :TODO: should work the other way around, server triggers the ping...
        DEBUG && console.log("socket.io | ping (" + socket.id + ")");
        if (callback) {
            callback();
        }
    });

    /**
     * register a room
     *
     * @param {Object} settings
     * @param {Function} callback
     */
    socket.on('register', function(settings, callback) {
        var room = null;

        // check for reservations
        if (settings.room && reservations[settings.room]) {
            var r = reservations[settings.room];
            if (r.app == settings.app && r.secret == settings.secret) {
                room = settings.room;
            }
            else {
                callback(403);
                return;
            }
        }

        // create a new room, should not be a reserved id,
        // should not be already created
        if (!room) {
            do {
                room = Math.random().toString().replace(".", "").substr(0, 5);
                DEBUG && console.log('try room', room);
            }
            while(reservations[room] || io.sockets.adapter.settings[room]);
        }

        // ok, we have a new room id, join and send result
        DEBUG && console.log("socket.io | user (" + socket.id + ") - register:", settings);
        socket.join(room);
        socket.room = room;

        // save the settings in separate place,
        // don't mess up the socket.io room management
        io.sockets.adapter.settings[room] = settings;

        // everything is fine, send success message to client
        callback(200, room);
    });

    /**
     * join a room, if no room specified create one
     */
    socket.on('join', function(room, callback) {
        DEBUG && console.log("socket.io | user (" + socket.id + ") - join: " + room);

        // creating a new room on the fly is not allowed!
        if (!room || !io.sockets.adapter.rooms[room]) {
            callback(404);
        }

        // as the client part is always public, we can connect w/o further checks
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

        // send success message
        callback(200, room);
    });

    /**
     * client leave a room
     *
     * @param {Function} callback
     */
    socket.on('leave', function(callback) {
        DEBUG && console.log("socket.io | user (" + socket.id + ") - leave");

        // remove from room
        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('cmd', {
            action: 'set',
            type: 'user',
            id: socket.id,
            data: null
        });

        // remove additional data/settings
        if (!io.sockets.adapter.rooms[socket.room]) {
            delete io.sockets.adapter.settings[socket.room];
        }
        delete socket.room;

        // return success message
        callback(200);
    });

    /**
     * socket disconnected
     */
    socket.on('disconnect', function() {
        DEBUG && console.log('socket.io | user disconnected:', socket.id, socket.room);

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

        DEBUG && console.log(io.sockets.adapter.settings);
        DEBUG && console.log(io.sockets.adapter.rooms);
    });

});

// ----- go! -------------------------------------------------------------------
http.listen(3000, function() {
    DEBUG && console.log('flexMOTE - core; listening on *:3000');
});
