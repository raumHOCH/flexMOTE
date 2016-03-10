;(function(window, $) {
    "use strict";

    // ----- dependencies ------------------------------------------------------
    if (!window.Remote) {
        throw Error("requires remote.js!");
    }

    // ----- remote ui ---------------------------------------------------------
    /**
     *
     */
    var Remote = window.Remote;
    var UI = Remote.UI = {};
    UI.layouts = {};
    UI.skins = {};
    UI.currentLayout = '';
    UI.currentSkin = '';
    UI.allowedProperties = ["id", "cssClass", "action", "url", "label", "content", "state"];

    // ----- remote ui components -----------------------------------------------------
    /**
     * allowed states
     */
    var State = {
        DEFAULT: 'default',
        DISABLED: 'disabled',
        PRESSED: 'pressed'
    };

    /**
     * @param {String} id
     * @param {String} cssClass
     * @param {Number} cols
     * @param {Number} rows
     */
    var Element = {
        id: "",
        cssClass: "",
        state: State.DEFAULT,
        cols: 1,
        rows: 1
    };

    /**
     * @see {Element}
     */
    UI.Spacer = $.extend({
        markup: '<div id="{{id}}" class="spacer {{cssClass}} {{state}}">&nbsp;</div>'
    }, Element);

    /**
     * @see {Element}
     */
    UI.Debug = $.extend({
        markup: '<div id="{{id}}" class="debug {{cssClass}} {{state}}">&nbsp;</div>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} action
     * @param {String} label
     */
    UI.Button = $.extend({
        action: '',
        label: '',
        markup: '<button id="{{id}}" class="button {{cssClass}} {{state}}" data-action="{{action}}">{{label}}</button>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} url
     * @param {String} label
     * @param {String} target
     */
    UI.Link = $.extend({
        url: '',
        label: '',
        target: '',
        markup: '<a id="{{id}}" class="link {{cssClass}} {{state}}" href="{{url}}">{{label}}</a>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} content
     */
    UI.Text = $.extend({
        markup: '<div id="{{id}}" class="text {{cssClass}} {{state}}">{{content}}</div>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} content
     */
    UI.HTML = $.extend({
        markup: '<div id="{{id}}" class="html {{cssClass}} {{state}}">{{{content}}}</div>'
    }, Element);

    // ----- public methods ----------------------------------------------------
    /**
     *
     */
    UI.buildLayout = function(layout) {
        Remote.DEBUG && console.log('remote ui | buildLayout: ' + layout.id);

        var l = UI.layouts[layout.id] || {};
        layout = $.extend(l, layout);
        layout.id = layout.id.toString();
        layout.data.gridSize = layout.data.gridSize || 100;

        UI.layouts[layout.id] = layout;
        UI.currentLayout = layout.id;

        var col = 0;

        // control value!
        var maxCols = parseInt(layout.data.cols);

        var out = '<table id="' + he(layout.id) + '" cellspacing="0" cellpadding="0" border="0">';

        // loop through all buttons. We only allow one "rows", so you can
        // combine columns, but each one will have the same height.
        // @TODO col-/rowspan combo? Seems to be very difficult in all major browsers...
        for (var idx = 0; idx < layout.data.elements.length; idx++) {

            // prepare data
            var el = layout.data.elements[idx];
            delete el.markup;

            var cfg = $.extend(true, {}, UI[el.type || "Spacer"], el);

            // open row
            if (!col) {
                out += '<tr>';
            }
            col += parseInt(cfg.cols);

            // build cell
            out += '<td colspan="' + cfg.cols + '" style="height:' + (cfg.rows * layout.data.gridSize) + 'px">';

            var markup = cfg.markup;
            if (markup) {
                for (var i = 0; i < UI.allowedProperties.length; i++) {
                    var prop = UI.allowedProperties[i];
                    var value = cfg[prop];

                    // sanitize
                    var regExHtml = new RegExp("{{{" + prop + "}}}", "gi");
                    var regExText = new RegExp("{{" + prop + "}}", "gi");
                    markup = markup.replace(regExHtml, value);
                    markup = markup.replace(regExText, he(value));
                }
            }
            else {
                markup = "&nbsp;";
            }

            out += markup;
            out += '</td>';

            // close row
            if (col == maxCols) {
                col = 0;
                out += '</tr>';
            }
        }
        out += '</table>';

        // rebuild gui and event handlers
        UI.unloadLayout();
        $('#remote').html(out);
        $('#remote table').css('width', (layout.data.cols * layout.data.gridSize) + "px");

        $('#remote td>*').on('mousedown touchstart', UI.onElementPressed);
        $('#remote td>*').on('mouseup touchend', UI.onElementReleased);

        // scale to fit
        UI.onResize();
    };

    /**
     *
     */
    UI.unloadLayout = function() {
        Remote.DEBUG && console.log('remote ui | unload layout');
        $('#remote td>*').off('mousedown touchstart', UI.onElementPressed);
        $('#remote td>*').off('mouseup touchend', UI.onElementReleased);
        $('#remote').empty();
    };

    /**
     * @param {Object} skin
     */
    UI.loadSkin = function(skin) {
        Remote.DEBUG && console.log('remote ui | load skin:', skin.id);

        // merge settings
        var s = UI.skins[skin.id] || {};
        skin = $.extend(s, skin);

        // no full skin config?
        if (!skin.id || !skin.data.url) {
            return UI.unloadSkin(true);
        }

        // unset old skin
        var stylesheetChanged = $('#skin-loader').attr('href') != skin.data.url;
        UI.unloadSkin(stylesheetChanged);

        // set new skin
        skin.id = skin.id.toString();
        UI.skins[skin.id] = skin;
        UI.currentSkin = skin.id;

        // load css file if needed
        if (stylesheetChanged) {
            Remote.DEBUG && console.log('remote ui | load css: ' + skin.data.url);

            var e = document.createElement('link');
            e.id = "skin-loader";
            e.rel = "stylesheet";
            e.type = "text/css";
            e.href = skin.data.url;
            e.onload = function() {
                Remote.DEBUG && console.log('remote ui | css loaded');
            };

            $('head').append(e);
        }

        $('body').attr('id', skin.id);
    };

    /**
     *
     */
    UI.unloadSkin = function(removeStylesheet) {
        Remote.DEBUG && console.log('remote ui | unloadSkin');
        UI.currentSkin = null;

        if (removeStylesheet) {
            $('#skin-loader').remove();
        }
        $('body').removeAttr('id');
    };

    // ----- event handler -----------------------------------------------------
    /**
     *
     */
    UI.onResize = function() {
        Remote.DEBUG && console.log('remote ui | resize');

        // calculate scale & top
        var l = UI.layouts[UI.currentLayout];
        if (!l) {
            return;
        }

        var ios = !!/iPad|iPhone|iPod/.test(navigator.platform);
        var d = $(document);
        var gap = ( ios ? 20 : 0);
        var heightScale = ((d.height() - gap) / (l.data.rows * l.data.gridSize)).toString();
        var widthScale = (d.width() / (l.data.cols * l.data.gridSize)).toString();
        var scale = Math.min(heightScale, widthScale);
        var top = Math.round(Math.max(0, (d.height() - (l.data.rows * l.data.gridSize) * scale) / 2) - (1.5 * gap));
        var left = Math.round(Math.max(0, (d.width() - (l.data.cols * l.data.gridSize) * scale) / 2));

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
        css = css.replace(/{{w}}/gi, l.data.cols * l.data.gridSize);
        $('#remote table').attr('style', css);

        window.scrollTo(0, 1);
    };

    /**
     * @param {Object} event
     */
    UI.onElementPressed = function(event) {
        Remote.DEBUG && console.log('remote ui | element pressed', event.currentTarget);

        if (event.currentTarget.id) {
            Remote.sendCommand('*', {
                action: 'set',
                type: 'button',
                id: event.currentTarget.id,
                data: {
                    state: State.PRESSED
                }
            });
        }
    };

    /**
     * @param {Object} event
     */
    UI.onElementReleased = function(event) {
        Remote.DEBUG && console.log('remote ui | element released', event.currentTarget);

        if (event.currentTarget.id) {
            Remote.sendCommand('*', {
                action: 'set',
                type: 'button',
                id: event.currentTarget.id,
                data: {
                    state: State.DEFAULT
                }
            });
        }
    };

    // ----- private helper ----------------------------------------------------
    /**
     * htmlentities
     */
    var he = function(src) {
        return $('<div />').text(src).html();
    };

    // ----- initialization ----------------------------------------------------
    $(window).on('resize', UI.onResize);

})(window, window.jQuery ? window.jQuery : window.$);
