;(function() {
    "use strict";

    var socket = io();
    socket.on('connect', function(id) {
        $('#whoami').html(socket.id);
        $('body').addClass('online');
        $('body').removeClass('offline');
    });

    socket.on('disconnect', function() {
        $('#whoami').html('<em>not connected</em>');
        $('body').addClass('offline');
        $('body').removeClass('online');
    });

    socket.on('chat message', function(msg) {
        $('#message').html(msg);
    });
})();
