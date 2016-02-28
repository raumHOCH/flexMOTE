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
    Remote.connection.on('cmd', Remote.handleCommand);

    // ----- tests -------------------------------------------------------------
    // load skin
    Remote.UI.loadSkin({
        action: 'set',
        type: 'skin',
        id: 'skin-hello-world',
        data: {
            url: 'http://localhost:3001/hello-world/skin/style.css'
        }    }, function() {
        // build gui - hello world w/ HTML
        Remote.UI.buildLayout({
            action: 'set',
            type: 'layout',
            id: 'layout-1',
            data: {
                name: 'Layout 1',
                orientation: 'landscape',
                gridSize: 50,
                cols: 10,
                rows: 14,
                elements: [

                // first row
                {
                    type: "Button",
                    id: "home",
                    action: "home",
                    label: "HOME"
                }, {
                    type: "Text",
                    id: "title",
                    content: "Hello World",
                    cssClass: "blue",
                    cols: 8
                }, {
                    type: "Button",
                    id: "close",
                    label: "X",
                    cssClass: "red"
                },

                // second row
                {
                    type: "HTML",
                    id: "content",
                    content: '<p>Hello World!</p><p><strong>Lorem Ipsum</strong> foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat!</p><p>Hello World!</p><p><strong>Lorem Ipsum</strong> foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat!</p><p>Hello World!</p><p><strong>Lorem Ipsum</strong> foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat!</p><p>Hello World!</p><p><strong>Lorem Ipsum</strong> foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat! foo bar bat!</p>',
                    cols: 10,
                    rows: 12
                },

                // third row
                {
                    type: "Text",
                    id: "status",
                    content: "Status.... (<p>XSS Test</p><script>alert('foo');)",
                    cols: 10
                }]
            }
        });

        // remote control (cF)
        Remote.UI.buildLayout({
            action: 'set',
            type: 'layout',
            id: '"><script>alert(\'foo!\');</script><table id="layout-2',
            data: {
                name: 'Layout 2',
                orientation: 'portrait',
                cols: 3,
                rows: 5,
                elements: [

                // first row
                {
                    type: "Button",
                    id: "home",
                    action: "home",
                    label: "HOME"
                }, {
                    type: "Spacer"
                }, {
                    type: "Button",
                    id: "close",
                    label: "X"
                },

                // second row
                {
                    type: "Spacer"
                }, {
                    type: "Button",
                    action: 'up',
                    label: '^',
                    id: "up"
                }, {
                    type: "Spacer"
                },

                // third row
                {
                    type: "Button",
                    action: 'left',
                    label: '<',
                    id: "left"
                }, {
                    type: "Spacer",
                    id: 'mdl'
                }, {
                    type: "Button",
                    action: 'right',
                    label: '>',
                    id: "right"
                },

                // fourth row
                {
                    type: "Spacer"
                }, {
                    type: "Button",
                    action: 'down',
                    label: 'v',
                    id: "down"
                }, {
                    type: "Spacer"
                },

                // fifth row
                {
                    type: "Button",
                    action: 'cF',
                    label: 'cF',
                    id: "cf"
                }, {
                    type: "Spacer"
                }, {
                    type: "Button",
                    action: 'more',
                    label: '...',
                    id: "more"
                }]
            }
        });

        return;

        // remote control (cF)
        Remote.UI.buildLayout({
            action: 'set',
            type: 'layout',
            id: '3',
            data: {
                name: 'Chess',
                orientation: 'landscape',
                cols: 8,
                rows: 8,
                elements: [{
                    type: "Button",
                    "label": "T"
                }, {
                    type: "Button",
                    "label": "L"
                }, {
                    type: "Button",
                    "label": "S"
                }, {
                    type: "Button",
                    "label": "K"
                }, {
                    type: "Button",
                    "label": "D"
                }, {
                    type: "Button",
                    "label": "S"
                }, {
                    type: "Button",
                    "label": "L"
                }, {
                    type: "Button",
                    "label": "T"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "B"
                }, {
                    type: "Button",
                    "label": "T"
                }, {
                    type: "Button",
                    "label": "L"
                }, {
                    type: "Button",
                    "label": "S"
                }, {
                    type: "Button",
                    "label": "D"
                }, {
                    type: "Button",
                    "label": "K"
                }, {
                    type: "Button",
                    "label": "S"
                }, {
                    type: "Button",
                    "label": "L"
                }, {
                    type: "Button",
                    "label": "T"
                }]
            }
        });
    });

})(window);
