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
    UI.allowedProperties = ["id", "cssClass", "action", "url", "label", "content"];

    // ----- remote ui components -----------------------------------------------------
    /**
     * @param {String} id
     * @param {String} cssClass
     * @param {Number} cols
     * @param {Number} rows
     */
    var Element = {
        id: "",
        cssClass: "",
        cols: 1,
        rows: 1
    };

    /**
     * @see {Element}
     */
    UI.Spacer = $.extend({
        markup: '<div id="{{id}}" class="spacer {{cssClass}}">&nbsp;</div>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} action
     * @param {String} label
     */
    UI.Button = $.extend({
        action: '',
        label: '',
        markup: '<button id="{{id}}" class="button {{cssClass}}" data-action="{{action}}">{{label}}</button>'
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
        markup: '<a id="{{id}}" class="link {{cssClass}}" href="{{url}}">{{label}}</a>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} content
     */
    UI.Text = $.extend({
        markup: '<div id="{{id}}" class="text {{cssClass}}">{{content}}</div>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} content
     */
    UI.HTML = $.extend({
        markup: '<div id="{{id}}" class="html {{cssClass}}">{{{content}}}</div>'
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

        $('#remote').empty().html(out);
        $('#remote table').css('width', (layout.data.cols * layout.data.gridSize) + "px");

        UI.onResize();
    };

    /**
     *
     */
    UI.loadSkin = function(skin, callback) {

        var s = UI.skins[skin.id] || {};
        skin = $.extend(s, skin);
        skin.id = skin.id.toString();

        UI.unloadSkin();
        UI.skins[skin.id] = skin;
        UI.currentSkin = skin.id;

        Remote.DEBUG && console.log('remote ui | loadSkin: ' + skin.data.url);
        var e = document.createElement('link');
        e.id = "skin";
        e.rel = "stylesheet";
        e.type = "text/css";
        e.href = skin.data.url;
        e.onload = function() {
            Remote.DEBUG && console.log('remote ui | skin loaded');
            if (callback) {
                callback();
            }
        };

        $('head').append(e);
        $('body').addClass(skin.id);
    };

    /**
     *
     */
    UI.unloadSkin = function() {
        Remote.DEBUG && console.log('remote ui | unloadSkin');
        UI.currentSkin = null;

        $('#skin').remove();
        $('body').removeAttr('class');
    };

    // ----- event handler -----------------------------------------------------
    /**
     *
     */
    UI.onResize = function() {
        Remote.DEBUG && console.log('remote ui | resize');

        // calculate scale & top
        var ios = !!/iPad|iPhone|iPod/.test(navigator.platform);
        var d = $(document);
        var l = UI.layouts[UI.currentLayout];
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
