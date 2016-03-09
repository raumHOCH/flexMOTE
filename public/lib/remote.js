;(function(window, $) {
    "use strict";

    // ----- Remote ------------------------------------------------------------
    /**
     * @singleton
     */
    var Remote = {};

    /**
     * socket.io handle
     */
    Remote.connection = null;

    /**
     *
     */
    Remote.room = null;

    /**
     * global flag to show/hide console.log messages
     */
    Remote.DEBUG = true;

    // ----- event handler -----------------------------------------------------
    /**
     *
     */
    Remote.handleCommand = function(cmd) {
        Remote.DEBUG && console.log('remote | handleCommand ', cmd);

        switch (cmd.action) {
            case 'set':
                switch (cmd.type) {
                    case 'layout':
                        Remote.UI.buildLayout(cmd);
                        break;

                    case 'skin':
                        Remote.UI.loadSkin(cmd);
                        break;
                }
                break;

            case 'get':
                // return values via websocket
                switch (cmd.type) {
                    case 'layout':
                        console.log(' > get layout', Remote.UI.layouts[Remote.UI.currentLayout]);
                        break;

                    case 'skin':
                        console.log(' > get skin', Remote.UI.skins[Remote.UI.currentSkin]);
                        break;
                }
                break;
        }
    };

    /**
     * @param {Object} data
     * @param {Function} callback
     */
    Remote.sendCommand = function(target, data, callback) {
        data.target = target;

        if ( typeof data == 'function') {
            callback = data;
            data = {};
        }

        Remote.connection.emit('cmd', data, function() {
            var args = arguments;
            if (callback) {
                callback.apply(Remote.connection, args);
            }
        });
    };

    /**
     * call this to get the current latency (console.log output)
     */
    Remote.ping = function() {
        var start = Date.now();
        Remote.connection.emit('ping', function() {
            Remote.DEBUG && console.log('remote | ping: ' + ((Date.now() - start) / 2) + ' ms');
            $('#debug').html('ping: ' + ((Date.now() - start) / 2) + ' ms');
            setTimeout(Remote.ping, 5000);
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
     *    secret: 'your-api-key'
     * }
     *
     * @param {Object} settings
     * @param {Function} callback
     */
    Remote.register = function(settings, callback) {
        // :TODO: add settings.room to request a specific room id

        Remote.DEBUG && console.log('remote | register:', settings);
        Remote.connection.emit('register', settings, function(status, room) {
            Remote.DEBUG && console.log(' >', status, room);

            if (status != 200) {
                return alert(status);
            }

            Remote.room = room;
            if (callback) {
                callback(room);
            }
        });
    };

    /**
     * @param {String} room (optional)
     */
    Remote.join = function(room, callback) {
        Remote.DEBUG && console.log('remote | join:', room);
        Remote.connection.emit('join', room, function(status, room) {
            Remote.DEBUG && console.log(' >', status, room);
            Remote.room = room;
            if (callback) {
                callback(room);
            }
        });
    };

    /**
     * @param {String} room (optional)
     */
    Remote.leave = function(callback) {
        Remote.DEBUG && console.log('remote | leave');
        Remote.connection.emit('leave', room, function(status, room) {
            Remote.DEBUG && console.log(' >', status, room);
            if (callback) {
                callback(room);
            }
        });
    };

    /**
     *
     */
    Remote.onConnect = function() {
        Remote.DEBUG && console.log("remote | connected to", Remote.connection.io.uri);
        Remote.DEBUG && console.log("remote | connected as", Remote.connection.id);

        var room = location.hash.substr(1);
        if (room.length == 5) {
            Remote.join(room, Remote.ping);
        };
    };

    /**
     *
     */
    Remote.onDisconnect = function() {
        Remote.DEBUG && console.log('remote | disconnected');
    };

    // window
    window.Remote = Remote;

})(window, window.jQuery ? window.jQuery : window.$);
