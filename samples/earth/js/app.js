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
            type: "ImgButton",
            id: "img_button_up",
            action: "up",
            buttonUrl: "https://raumhoch.github.io/flexMOTE/samples/earth/images/arrow_double.png",
            buttonStyle: "transform: rotate(90deg)"
        }, {}, {
            type: "ImgButton",
            id: "img_button_left",
            action: "left",
            buttonUrl: "https://raumhoch.github.io/flexMOTE/samples/earth/images/arrow_double.png"
        }, {
          type: "Text",
          id: "earthText",
          content: "Click to Move"
        }, {
            type: "ImgButton",
            id: "img_button_right",
            action: "right",
            buttonUrl: "https://raumhoch.github.io/flexMOTE/samples/earth/images/arrow_double.png",
            buttonStyle: "transform: rotate(180deg)"
        }, {}, {
            type: "ImgButton",
            id: "img_button_down",
            action: "down",
            buttonUrl: "https://raumhoch.github.io/flexMOTE/samples/earth/images/arrow_double.png",
            buttonStyle: "transform: rotate(-90deg)"
        }, {}]
    }
};

// ----- flexMOTE --------------------------------------------------------------
/**
 * @public socket.io connection
 */
flexMOTE.connection = io('https://remote.cloudfolio.com');

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
            text: "https://remote.cloudfolio.com/#" + room.toString(),
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        $('#qrcode').append('<p><a target="_blank" style="color:#000;text-decoration:none" href="https://remote.cloudfolio.com/#' + room + '">remote.cloudfolio.com<br/>#<strong>' + room + '</strong></a></p>');
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
    console.log(cmd.id, cmd.type );
    switch (cmd.type) {
        case 'button':
            if (cmd.data.state == 'pressed') {
                switch (cmd.id) {
                    case 'img_button_down':
                        window.mouse.y += 0.05;
                        break;
                    case 'img_button_up':
                        window.mouse.y -= 0.05;
                        break;
                    case 'img_button_left':
                        window.mouse.x += 0.05;
                        break;
                    case 'img_button_right':
                        window.mouse.x -= 0.05;
                        break;
                    //case 'slider_x':
                    //    window.mouse.x = cmd.value;
                    //    break;
                }
            }

        case 'user':
            flexMOTE.sendCommand(cmd.id, layout);
            break;
    }
});
