/**
 * @public socket.io connection
 */
flexMOTE.connection = io('http://remote.cloudfolio.com');

/**
 * onConnect event handler
 */
flexMOTE.connection.on('connect', function() {

    // register a channel
    flexMOTE.register({
        app: 'skin',
        version: '0.1.0',
        maxUsers: 2,
        timeout: 60 * 1000, // 60 seconds
        stickySessions: true
    }, function(status, room) {

        // generate qrcode
        $('#qrcode').empty();
        var qrcode = new QRCode("qrcode", {
            text: "http://remote.cloudfolio.com/#" + room.toString(),
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // some info texts...
        var info = '<p><a target="_blank" href="http://remote.cloudfolio.com/#' + room + '">';
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
                case 'user':
                    flexMOTE.sendCommand(cmd.id, Config.skins[Config.currentSkin], function() {
                        flexMOTE.sendCommand(cmd.id, Config.layouts['layout-1']);
                    });
                    break;
            }
            break;
    }
});

// ---- DOM event handler ------------------------------------------------------
/**
 * @param {Object} event
 */
$('#button-skin-1').on('click', function(event) {
    Config.currentSkin = 'skin-1';
    $('body').attr('id', 'skin-1');
    flexMOTE.sendCommand('*', Config.skins[Config.currentSkin]);
});

/**
 * @param {Object} event
 */
$('#button-skin-2').on('click', function(event) {
    Config.currentSkin = 'skin-2';
    $('body').attr('id', 'skin-2');
    flexMOTE.sendCommand('*', Config.skins[Config.currentSkin]);
});

/**
 * @param {Object} event
 */
$('#button-skin-3').on('click', function(event) {
    Config.currentSkin = 'skin-3';
    $('body').attr('id', 'skin-3');
    flexMOTE.sendCommand('*', Config.skins[Config.currentSkin]);
});

/**
 * @param {Object} event
 */
 $('.button').click(function() {
       $(".button.active").removeClass("active");
       $(this).addClass('active');
 });
