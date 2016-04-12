/**
 * our gui to control the camera
 */
var layout = {
    action: 'set',
    type: 'layout',
    id: 'layout-1',
    data: {
        name: 'Layout 1',
        orientation: 'portrait',
        cols: 3,
        rows: 3,
        elements: [{
        }, {
            type: "Button",
            id: "up",
            action: "up",
            label: "^"
        }, {}, {
            type: "Button",
            id: "left",
            action: "left",
            label: "<"
        }, {}, {
            type: "Button",
            id: "right",
            action: "right",
            label: ">"
        }, {
        }, {
            type: "Button",
            id: "down",
            action: "down",
            label: "v"
        }, {}]
    }
};

// ----- flexMOTE --------------------------------------------------------------
/**
 * @public socket.io connection
 */
flexMOTE.connection = io('http://remote.cloudfolio.com');

/**
 * onConnect event handler
 */
flexMOTE.connection.on('connect', function() {
    flexMOTE.DEBUG && console.log('app | onConnect');

    flexMOTE.register({
        app: 'earth',
        version: '0.1.0',
        maxUsers: 1,
        timeout: 5 * 1000, // 60 seconds
        stickySessions: false
    }, function(status, room) {

        $('body').append('<div id="qrcode" style="text-align:center;position:absolute;top:20px;left:20px;z-index:1000;background:#FFF;padding:20px"></div>');
        var qrcode = new QRCode("qrcode", {
            text: "http://remote.cloudfolio.com/#" + room.toString(),
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        $('#qrcode').append('<p><a target="_blank" style="color:#000;text-decoration:none" href="http://remote.cloudfolio.com/#' + room + '">remote.cloudfolio.com<br/>#<strong>' + room + '</strong></a></p>');
    });
});

/**
 *
 */
flexMOTE.connection.on('disconnect', function() {
    $('#qrcode').remove();
});

/**
 * onCommand event handler
 * @param {Object} cmd
 */
flexMOTE.connection.on('cmd', function(cmd) {
    switch (cmd.type) {
        case 'button':
            if (cmd.data.state == 'pressed') {
                switch (cmd.id) {
                    case 'down':
                        window.mouse.y += 0.05;
                        break;
                    case 'up':
                        window.mouse.y -= 0.05;
                        break;
                    case 'left':
                        window.mouse.x += 0.05;
                        break;
                    case 'right':
                        window.mouse.x -= 0.05;
                        break;
                }
            }

        case 'user':
            flexMOTE.sendCommand(cmd.id, layout);
            break;
    }
});
