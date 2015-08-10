var express = require('./server/node_modules/express');
var app = express();
var http = require('http').Server(app);
var io = require('./server/node_modules/socket.io')(http);
var compress = require('./server/node_modules/compression');

// ---- urls -------------------------------------------------------------------
app.use(compress());
app.use(express.static(__dirname + '/client/public'));

app.get('/', function(req, res) {
    console.log("  > /index.html");
    res.sendFile(__dirname + '/client/templates/index.html');
});
app.get('/application.html', function(req, res) {
    console.log("  > /application.html");
    res.sendFile(__dirname + '/client/templates/application.html');
});
app.get('/monitoring.html', function(req, res) {
    console.log("  > /monitoring.html");
    res.sendFile(__dirname + '/client/templates/monitoring.html');
});
app.get('/remote.html', function(req, res) {
    console.log("  > /remote.html");
    res.sendFile(__dirname + '/client/templates/remote.html');
});
app.get('/remote-10x10.html', function(req, res) {
    console.log("  > /remote-10x10.html");
    res.sendFile(__dirname + '/client/templates/remote-10x10.html');
});

// ---- socket.io --------------------------------------------------------------
io.on('connection', function(socket) {
    console.log('a user connected');
    //socket.broadcast.emit('chat message', "HI!");

    socket.on('disconnect', function() {
        //socket.broadcast.emit('chat message', "BYE!");
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        socket.broadcast.emit('chat message', msg);
    });
});

// ---- go! --------------------------------------------------------------------
http.listen(3000, function() {
    console.log('listening on *:3000');
});
