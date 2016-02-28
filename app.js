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

    /**
     *
     */
    socket.on('disconnect', function() {
        console.log('socket.io | user disconnected:', socket.id);
    });
});

// ---- go! --------------------------------------------------------------------
http.listen(3000, function() {
    console.log('listening on *:3000');
});
