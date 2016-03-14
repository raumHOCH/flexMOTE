// start up
var room = location.hash.substr(1);
if (room.length == 5) {

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
        flexMOTE.join(room, function(status, room) {
            if (status == 200) {
                flexMOTE.ping();
            }
            else {
                flexMOTE.UI.buildLayout({
                    'id': 'flexMOTE-error-' + status
                });
            }
        });
    });

    /**
     * onDisconnect event handler
     */
    flexMOTE.connection.on('disconnect', function() {
        console.log('disconnect');
        flexMOTE.UI.unloadSkin();
        flexMOTE.UI.buildLayout({
            id: 'flexMOTE-disconnect'
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

                    case 'app':
                        if (!cmd.id) {
                            flexMOTE.UI.unloadSkin();
                            flexMOTE.UI.buildLayout({
                                id: 'flexMOTE-error-503'
                            });
                            setTimeout(flexMOTE.leave, 5000);
                        }
                        break;
                }
                break;
        }
    });

}
else {
    flexMOTE.UI.buildLayout({
        'id': 'flexMOTE-code'
    });
};
