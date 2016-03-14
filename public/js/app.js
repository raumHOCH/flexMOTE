/**
 * @public socket.io connection
 */
flexMOTE.connection = io();

/**
 * onConnect event handler
 */
flexMOTE.connection.on('connect', function() {
    console.log("connected to", flexMOTE.connection.io.uri);
    console.log("connected as", flexMOTE.connection.id);
    var room = location.hash.substr(1);
    if (room.length == 5) {
        flexMOTE.join(room, function(status, room) {
            if (status == 200) {
                flexMOTE.ping();
            }
            else {
                flexMOTE.UI.buildLayout({
                    'id': 'error-' + status
                });
            }
        });
    };
});

/**
 * onDisconnect event handler
 */
flexMOTE.connection.on('disconnect', function() {
    console.log('disconnect');
    flexMOTE.UI.unloadSkin();
    flexMOTE.UI.buildLayout({
        id: 'disconnect'
    });
});

/**
 * onCommand event handler
 * @param {Object} cmd
 */
flexMOTE.connection.on('cmd', function(cmd) {
    console.log('onCommand', cmd);
    switch (cmd.action) {
        case 'set':
            switch (cmd.type) {
                case 'layout':
                    flexMOTE.UI.buildLayout(cmd);
                    break;

                case 'skin':
                    flexMOTE.UI.loadSkin(cmd);
                    break;
            }
            break;
    }
});
