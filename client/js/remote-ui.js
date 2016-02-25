;(function(window, $) {
    "use strict";

    // ----- dependencies ------------------------------------------------------
    if (!window.Remote) {
        throw Error("requires remote.js!");
    }

    // ----- remote ui ---------------------------------------------------------
    var Remote = window.Remote;
    Remote.UI = {};
    Remote.UI.layouts = {};
    Remote.UI.skins = {};
    Remote.UI.currentLayout = '';
    Remote.UI.currentSkin = '';

    /**
     *
     */
    Remote.UI.onResize = function() {
        Remote.DEBUG && console.log('remote ui | resize');

        // calculate scale & top
        var ios = !!/iPad|iPhone|iPod/.test(navigator.platform);
        var d = $(document);
        var l = Remote.UI.layouts[Remote.UI.currentLayout];
        var gap = ( ios ? 20 : 0);
        var heightScale = ((d.height() - gap) / (l.data.rows * 100)).toString();
        var widthScale = (d.width() / (l.data.cols * 100)).toString();
        var scale = Math.min(heightScale, widthScale);
        var top = Math.round(Math.max(0, (d.height() - (l.data.rows * 100) * scale) / 2) - (1.5 * gap));
        var left = Math.round(Math.max(0, (d.width() - (l.data.cols * 100) * scale) / 2));

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
        css = css.replace(/{{w}}/gi, l.data.cols * 100);
        $('#remote table').attr('style', css);

        window.scrollTo(0, 1);
    };

    // ----- public methods ----------------------------------------------------
    /**
     *
     */
    Remote.UI.buildLayout = function(layout) {
        Remote.DEBUG && console.log('remote ui | buildLayout: ' + layout.id);

        var l = Remote.UI.layouts[layout.id] || {};
        layout = $.extend(l, layout);
        layout.id = layout.id.toString();
        Remote.UI.layouts[layout.id] = layout;
        Remote.UI.currentLayout = layout.id;

        var out = '<table cellspacing="0" cellpadding="0" border="0">';
        for (var i = 0; i < layout.data.rows; i++) {
            out += '<tr>';
            for (var j = 0; j < layout.data.cols; j++) {
                out += '<td>...</td>';
            }
            out += '</tr>';
        }
        out += '</table>';

        $('#remote').empty().html(out);
        $('#remote table').css('width', (layout.data.cols * 100) + "px");

        Remote.UI.onResize();
    };

    /**
     *
     */
    Remote.UI.loadSkin = function(skin, callback) {
        Remote.UI.unloadSkin();
        Remote.DEBUG && console.log('remote ui | loadSkin: ' + skin.data.baseUrl);

        Remote.UI.skins[skin.id] = skin;
        Remote.UI.currentSkin = skin.id;

        var e = document.createElement('link');
        e.id = "skin";
        e.rel = "stylesheet";
        e.type = "text/css";
        e.href = skin.data.baseUrl.replace(/\/$/, "") + '/style.css';
        e.onload = function() {
            Remote.DEBUG && console.log('remote ui | skin loaded');
            if (callback) {
                callback();
            }
        };

        $('head').append(e);
        $('body').addClass(skin.data.cssClass);
    };

    /**
     *
     */
    Remote.UI.unloadSkin = function() {
        Remote.DEBUG && console.log('remote ui | unloadSkin');
        Remote.UI.currentSkin = null;

        $('#skin').remove();
        $('body').removeAttr('class');
    };

    // ----- ui components -----------------------------------------------------
    /**
     * @param {String} id
     * @param {String} cssClass
     * @param {String} cols
     * @param {String} rows
     */
    var BaseElement = {
        id: "",
        cssClass: "",
        cols: 1,
        rows: 1
    };

    /**
     * @see {Remote.UI.Element}
     */
    Remote.UI.Spacer = $.extend({
        markup: '<div id="{{id}}" class="spacer {{cssClass}}">&nbsp;</div>'
    }, BaseElement);

    /**
     * @see {Remote.UI.Element}
     * @param {String} action
     * @param {String} label
     */
    Remote.UI.Button = $.extend({
        action: '',
        label: '',
        markup: '<button id="{{id}}" class="button {{cssClass}}" data-action="{{action}}">{{label}}</button>'
    }, BaseElement);

    /**
     * @see {Remote.UI.Element}
     * @param {String} url
     * @param {String} label
     * @param {String} target
     */
    Remote.UI.Link = $.extend({
        url: '',
        label: '',
        target: '',
        markup: '<a id="{{id}}" class="link {{cssClass}}" href="{{url}}">{{label}}</a>'
    }, BaseElement);

    /**
     * @see {Remote.UI.Element}
     * @param {String} content
     */
    Remote.UI.Text = $.extend({
        markup: '<div id="{{id}}" class="text {{cssClass}}">{{content}}</div>'
    }, BaseElement);

    // ----- initialization ----------------------------------------------------
    $(window).on('resize', Remote.UI.onResize);

})(window, window.jQuery ? window.jQuery : window.$);
