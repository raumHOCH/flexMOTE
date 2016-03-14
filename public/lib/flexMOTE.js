;(function(window, $) {
    "use strict";

    // ----- flexMOTE ----------------------------------------------------------
    /**
     * @singleton
     */
    var flexMOTE = {};

    /**
     * socket.io handle
     */
    flexMOTE.connection = null;

    /**
     *
     */
    flexMOTE.room = null;

    /**
     * global flag to show/hide console.log messages
     */
    flexMOTE.DEBUG = true;

    // ----- public methods ----------------------------------------------------
    /**
     * @param {Object} data
     * @param {Function} callback
     */
    flexMOTE.sendCommand = function(target, data, callback) {
        data.target = target;

        if ( typeof data == 'function') {
            callback = data;
            data = {};
        }

        flexMOTE.connection.emit('cmd', data, function() {
            var args = arguments;
            if (callback) {
                callback.apply(flexMOTE.connection, args);
            }
        });
    };

    /**
     * call this to get the current latency (console.log output)
     */
    flexMOTE.ping = function() {
        var start = Date.now();
        flexMOTE.connection.emit('ping', function() {
            console.log('ping', (Date.now() - start) / 2, 'ms');
            $('#debug').html('ping: ' + ((Date.now() - start) / 2) + ' ms');
            setTimeout(flexMOTE.ping, 5000);
        });
    };

    /**
     * Register a new channel, settings should look like this:
     *
     * {
     *    app: 'your-app-name',
     *    version: '0.x',
     *    maxUsers: -1, // -1 = unlimited
     *    timeout: 5000,
     *    stickySession: false,
     *    room: '12345', // a reserved room
     *    secret: 'your-api-key' // password for reserved room
     * }
     *
     * @param {Object} settings
     * @param {Function} callback
     */
    flexMOTE.register = function(settings, callback) {
        console.log('register', settings);
        settings.host = location.host;
        flexMOTE.connection.emit('register', settings, function(status, room) {
            console.log(' >', status, room);
            flexMOTE.room = room;
            if (callback) {
                callback(status, room);
            }
        });
    };

    /**
     * @param {String} room (optional)
     */
    flexMOTE.join = function(room, callback) {
        console.log('join', room);
        flexMOTE.connection.emit('join', room, function(status, room) {
            console.log(' >', status, room);
            flexMOTE.room = room;
            if (callback) {
                callback(status, room);
            }
        });
    };

    /**
     * @param {String} room (optional)
     */
    flexMOTE.leave = function(callback) {
        console.log('leave');
        flexMOTE.connection.emit('leave', function(status) {
            console.log(' >', status);
            if (callback) {
                callback(status);
            }
        });
    };

    // window
    window.flexMOTE = flexMOTE;

})(window, window.jQuery ? window.jQuery : window.$);
