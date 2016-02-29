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
        socket.broadcast.emit('cmd', params);
        if (callback) {
            callback();
        }
    });

    /**
     * @param {Function} callback
     */
    socket.on('ping', function(callback) {
        callback();
    });

    /**
     * client disconnected
     */
    socket.on('disconnect', function() {
        console.log('socket.io | user disconnected:', socket.id);

        // @TODO implement right protocol (set user/app instead of generic message)
        socket.broadcast.emit('cmd', {
            'target': '*',
            'type': 'generic',
            'data': {
                'message': 'client disconnected!'
            }
        });
    });

    // initial message
    // @TODO implement right protocol (set user/app instead of generic message)
    socket.broadcast.emit('cmd', {
        'target': '*',
        'type': 'generic',
        'data': {
            'message': 'client connected!'
        }
    });

});

// ---- go! --------------------------------------------------------------------
http.listen(3000, function() {
    console.log('reMOTE.js - core; listening on *:3000');
});
