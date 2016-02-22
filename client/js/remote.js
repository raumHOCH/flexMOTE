;(function(window) {
    "use strict";

    // ----- constants ---------------------------------------------------------
    /**
     * global flag to show/hide console.log messages
     */
    var DEBUG = true;

    /**
     * channel is determined by the url: http://yourremoteserver.com/#/app-id
     */
    var CHANNEL = window.location.href.replace("#/", "");

    // ----- Remote ------------------------------------------------------------
    /**
     * @singleton
     */
    var Remote = {};
    Remote.connection = null;
    Remote.layouts = [];
    Remote.skins = [];
    Remote.currentLayout = '';
    Remote.currentSkin = '';

    // ----- event handler -----------------------------------------------------
    /**
     *
     */
    Remote.defaultHandler = function(cmd) {
        console.log('remote | defaultHandler ', cmd);

        switch (cmd.type) {
            case 'layout':
                break;

            case 'skin':
                break;
        }
    };

    /**
     *
     */
    Remote.onConnect = function() {
        DEBUG && console.log("remote | connected to " + CHANNEL);
        DEBUG && console.log("remote | connected as " + Remote.connection.id);
    };

    /**
     *
     */
    Remote.onDisconnect = function() {
        DEBUG && console.log('remote | disconnected');
    };

    /**
     *
     */
    Remote.onResize = function() {

        // calculate scale & top
        var ios = !!/iPad|iPhone|iPod/.test(navigator.platform);
        var d = $(document);
        var l = Remote.layouts[Remote.currentLayout];
        var gap = ( ios ? 20 : 0);
        var heightScale = ((d.height() - gap) / (l.rows * 100)).toString();
        var widthScale = (d.width() / (l.cols * 100)).toString();
        var scale = Math.min(heightScale, widthScale);
        var top = Math.round(Math.max(0, (d.height() - (l.rows * 100) * scale) / 2) - (1.5 * gap));
        var left = Math.round(Math.max(0, (d.width() - (l.cols * 100) * scale) / 2));

        // css
        var css = 'transform:scale3d({{s}},{{s}},{{s}});';
        css += '-o-transform:scale3d({{s}},{{s}},{{s}});';
        css += '-ms-transform:scale3d({{s}},{{s}},{{s}});';
        css += '-moz-transform:scale3d({{s}},{{s}},{{s}});';
        css += '-webkit-transform:scale3d({{s}},{{s}},{{s}});';
        css += 'top:{{t}}px;left:{{l}}px;width:{{w}}px';
        css = css.replace(/{{s}}/gi, scale);
        css = css.replace(/{{t}}/gi, top);
        css = css.replace(/{{l}}/gi, left);
        css = css.replace(/{{w}}/gi, l.cols * 100);
        $('#remote table').attr('style', css);

        window.scrollTo(0, 1);
    };

    // ----- public methods ----------------------------------------------------
    /**
     *
     */
    Remote.buildLayout = function(layout) {
        DEBUG && console.log('remote | buildLayout: ' + layout.name);

        Remote.layouts[layout.name] = layout;
        Remote.currentLayout = layout.name;

        var out = '<table cellspacing="0" cellpadding="0" border="0">';
        for (var i = 0; i < layout.rows; i++) {
            out += '<tr>';
            for (var j = 0; j < layout.cols; j++) {
                out += '<td>...</td>';
            }
            out += '</tr>';
        }
        out += '</table>';

        $('#remote').empty().html(out);
        $('#remote table').css('width', (layout.cols * 100) + "px");
    };

    /**
     *
     */
    Remote.loadSkin = function(skin, callback) {
        Remote.unloadSkin();
        DEBUG && console.log('remote | loadSkin: ' + skin.baseUrl);
        var e = document.createElement('link');
        e.id = "skin";
        e.rel = "stylesheet";
        e.type = "text/css";
        e.href = skin.baseUrl.replace(/\/$/, "") + '/style.css';
        e.onload = function() {
            DEBUG && console.log('remote | skin loaded');
            if (callback) {
                callback();
            }
        };

        $('head').append(e);
        $('body').addClass(skin.cssClass);
    };

    /**
     *
     */
    Remote.unloadSkin = function() {
        DEBUG && console.log('remote | unloadSkin');
        $('#skin').remove();
        $('body').removeAttr('class');
    };

    // ----- initialization  ---------------------------------------------------
    // @TODO connect to right channel / room / namespace
    Remote.connection = io();
    Remote.connection.on('connect', Remote.onConnect);
    Remote.connection.on('disconnect', Remote.onDisconnect);
    Remote.connection.on('cmd', Remote.defaultHandler);

    // window
    window.Remote = Remote;
    $(window).on('resize', Remote.onResize);

    // ----- tests -------------------------------------------------------------
    // load skin
    Remote.loadSkin({
        'name': 'Hello World',
        'cssClass': 'hello-world',
        'baseUrl': 'http://localhost/0_RAUMHOCH/reMOTE/src/applications/hello-world/skin/'
    }, function() {
        // build gui
        Remote.buildLayout({
            'name': 'Layout 10x20',
            'cols': 10,
            'rows': 20
        });
        Remote.onResize();
    });

})(window);
