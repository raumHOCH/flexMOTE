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

    Remote.ping();

})(window);
