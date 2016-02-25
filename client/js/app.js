;(function(window) {
    "use strict";

    // ----- dependencies ------------------------------------------------------
    if (!window.Remote) {
        throw Error("requires remote.js!");
    }

    if (!window.Remote.UI) {
        throw Error("requires remote-ui.js!");
    }

    // ----- initialization  ---------------------------------------------------
    var Remote = window.Remote;

    // @TODO connect to right channel / room / namespace
    Remote.connection = io();
    Remote.connection.on('connect', Remote.onConnect);
    Remote.connection.on('disconnect', Remote.onDisconnect);
    Remote.connection.on('cmd', Remote.defaultHandler);

    // ----- tests -------------------------------------------------------------
    // load skin
    Remote.UI.loadSkin({
        action: 'set',
        type: 'skin',
        id: 1,
        data: {
            name: 'Hello World',
            cssClass: 'hello-world',
            baseUrl: 'http://localhost/0_RAUMHOCH/reMOTE/src/applications/hello-world/skin/'
        }
    }, function() {
        // build gui
        Remote.UI.buildLayout({
            action: 'set',
            type: 'layout',
            id: '1',
            data: {
                name: 'Layout 1',
                orientation: 'landscape',
                cols: 5,
                rows: 1,
                elements: [
                
                // first row
                {
                    type: "Button",
                    id: "home",
                    action: "home",
                    label: "H",
                    cssClass: "red"
                }, {
                    type: "Text",
                    id: "title",
                    label: "Hello World",
                    cssClass: "blue",
                    cols: 3
                }, {
                    type: "Button",
                    id: "close",
                    label: "X",
                    cssClass: "red"
                },
                
                // second row
                ]
            }
        });
    });

})(window);
