var counter = 0;

/**
 * @public remote connection
 */
flexMOTE.connection = io('https://remote.cloudfolio.com');

/**
 * onConnect event handler
 */
flexMOTE.connection.on('connect', function() {

    // register a channel
    flexMOTE.register({
        app: 'counter',
        version: '0.1.0',
        maxUsers: 1,
        timeout: 10 * 1000, // 10 seconds
        stickySessions: false
    }, function(status, room) {

        // generate qrcode
        $('#qrcode').empty();
        var qrcode = new QRCode("qrcode", {
            text: "https://remote.cloudfolio.com/#" + room.toString(),
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // some info texts...
        var info = '<p><a target="_blank" href="https://remote.cloudfolio.com/#' + room + '">';
        info += 'remote.cloudfolio.com<br/>#<strong>' + room + '</strong></p>';
        $('#qrcode').append(info);
    });
});

/**
 * onDisconnect event handler
 */
flexMOTE.connection.on('disconnect', function() {
    $('#qrcode').empty();
});

/**
 * onCommand event handler
 * @param {Object} cmd
 */
flexMOTE.connection.on('cmd', function(cmd) {

    switch (cmd.action) {
        case 'set':

            switch (cmd.type) {
                case 'button':
                    if (cmd.data.state == 'pressed') {
                        counter += (cmd.id == 'plus' ? 1 : -1);
                        $('#counter').html(counter);
                    }
                    break;

                case 'user':
                    flexMOTE.sendCommand('*', {
                        action: 'set',
                        type: 'layout',
                        id: 'layout-1',
                        data: {
                            name: 'Layout 1',
                            cols: 1,
                            rows: 4,
                            elements: [{},{
                                type: "Button",
                                label: "+",
                                id: "plus",
                            }, {
                                type: "Button",
                                label: "–",
                                id: "minus",
                            }, {}]
                        }
                    });
                    break;
            }
    }

});
