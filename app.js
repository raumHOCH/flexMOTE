var express = require('./server/node_modules/express');
var app = express();
var http = require('http').Server(app);
var io = require('./server/node_modules/socket.io')(http);
var compress = require('./server/node_modules/compression');

// ---- client -----------------------------------------------------------------
app.use(compress());
app.use(express.static(__dirname + '/client'));
app.use('/applications', express.static(__dirname + '/applications'));

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

    // test cmd
    // @TODO remove
    socket.emit('cmd', {
        id: 1
    });
});

// ---- go! --------------------------------------------------------------------
http.listen(3000, function() {
    console.log('listening on *:3000');
});
