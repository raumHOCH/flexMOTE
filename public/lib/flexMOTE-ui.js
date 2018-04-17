;(function(window, $) {
    "use strict";

    // ----- dependencies ------------------------------------------------------
    if (!window.flexMOTE) {
        throw Error("requires flexMOTE.js!");
    }

    // ----- remote ui ---------------------------------------------------------
    /**
     *
     */
    var flexMOTE = window.flexMOTE;
    var UI = flexMOTE.UI = {};
    UI.layouts = {};
    UI.skins = {};
    UI.currentLayout = '';
    UI.currentSkin = '';
    UI.allowedProperties = ["id", "cssClass", "action", "url", "label", "content", "state", "value", "placeholder", "buttonUrl", "buttonStyle"];

    // ----- remote ui components ----------------------------------------------
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
     * @param {Function} onRendered, callback after layout update
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
    UI.Input = $.extend({
        markup: '<input id="{{id}}" type="text" class="input {{cssClass}} {{state}}" value="{{value}}" placeholder="{{placeholder}}" />'
    }, Element);

    /**
     * @see {Element}
     * @param {String} content
     */
    // TODO: do we really want html here? Perhaps markdown is a saver solution?
    UI.HTML = $.extend({
        markup: '<div id="{{id}}" class="html {{cssClass}} {{state}}">{{{content}}}</div>'
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
     * @param {String} action
     * @param {String} label
     */
    UI.ImgButton = $.extend({
        action: '',
        label: '',
        markup: '<button id="{{id}}" class="img_button button {{cssClass}} {{state}}" data-action="{{action}}" style="background: url({{buttonUrl}}); background-size:cover; width:100px; height:100px; {{buttonStyle}}">{{label}}</button>'
    }, Element);

    /**
     * @see {Element}
     */
    UI.Reload = $.extend({
        markup: '<button id="{{id}}" class="__reload__ button {{cssClass}} {{state}}">{{label}}</button>'
    }, Element);

    /**
     * @see {Element}
     */
    UI.Submit = $.extend({
        markup: '<button id="{{id}}" class="__submit__ button {{cssClass}} {{state}}">{{label}}</button>'
    }, Element);

    /**
     * @see {Element}
     * @param {String} content
     */
    UI.Audio = $.extend({
        url: '',
        state: 'initialize',
        markup: '<div id="{{id}}" class="text {{cssClass}} {{state}}">{{content}}</div>',
        onRendered: function() {
            console.log("AUDIO RENDERED!");

            // on first time, we have to initilaize an audio element and
            // let the user trigger the play() event. This is mandatory as
            // all mobile browsers only start audio playback after user
            // interaction
            if (!$('audio').length || !$('body').hasClass('audio-confirmed')) {
                $('body').append($('<audio preload />'));
                var audio = $('audio')[0];
                audio.src = this.url;
                audio.currentTime = this.value || 0;

                var elem = $("#" + this.id);
                var parent = elem.parent();
                parent.empty();
                elem = $('<button class="__confirm__ button">TAP TO START</button>');
                elem.on('mousedown touchstart', function(event) {
                    if (audio.src) {
                        audio.play();
                        audio.pause();
                        $('body').addClass('audio-confirmed');
                        setTimeout(function() {
                            elem.remove();
                            parent.html('<div class="text">Seeking...</div>');
                        }, 99);
                    }
                });
                parent.append(elem);
            }
            else {
                // audio is initialized, so playback
                var audio = $('audio')[0];

                if (audio.src != this.url) {
                    audio.src = this.url;
                }

                // TODO: latency compensation
                var latency = 0.1;
                if (Math.abs(audio.currentTime - this.value) > 0.1) {
                    audio.currentTime = this.value + latency;
                }

                if (audio.duration <= this.value) {
                    audio.pause();
                }
                else {
                    switch (this.state) {
                        case 'playing':
                            audio.play();
                            break;
                        case 'paused':
                            audio.pause();
                            break;
                    }
                }
            }
        }
    }, Element);

    // ----- remote ui error pages ---------------------------------------------
    /**
     * error 403 - we don't have access to a channel
     */
    UI.layouts['flexMOTE-error-403'] = {
        type: 'layout',
        id: 'flexMOTE-error-403',
        data: {
            name: 'Error 403',
            cols: 3,
            rows: 3,
            elements: [{
                type: "Text",
                content: "Error 403 - forbidden",
                cols: 3
            }, {
                cols: 3
            }, {

                cols: 3
            }]
        }
    };

    /**
     * error 404 - the requested channel is not available/open
     */
    UI.layouts['flexMOTE-error-404'] = {
        type: 'layout',
        id: 'flexMOTE-error-404',
        data: {
            name: 'Error 404',
            cols: 3,
            rows: 3,
            elements: [{
                type: "Text",
                content: "Error 404 - channel not found",
                cols: 3
            }, {
                cols: 3
            }, {

                cols: 3
            }]
        }
    };

    /**
     * error 429 - the requested channel is full
     */
    UI.layouts['flexMOTE-error-429'] = {
        type: 'layout',
        id: 'flexMOTE-error-429',
        data: {
            name: 'Error 429',
            cols: 3,
            rows: 3,
            elements: [{
                type: "Text",
                content: "Error 429 - too many connections",
                cols: 3
            }, {
                cols: 3
            }, {

                cols: 3
            }]
        }
    };

    /**
     * error 503 - the last app in this channel is gone...
     */
    UI.layouts['flexMOTE-error-503'] = {
        type: 'layout',
        id: 'flexMOTE-error-503',
        data: {
            name: 'Error 503',
            cols: 3,
            rows: 3,
            elements: [{
                type: "Text",
                content: "Error 503 - app lost",
                cols: 3
            }, {
                cols: 3
            }, {

                cols: 3
            }]
        }
    };

    /**
     * input channel code to enter (if not set in url...)
     */
    UI.layouts['flexMOTE-code'] = {
        type: 'layout',
        id: 'flexMOTE-code',
        data: {
            name: 'Code',
            cols: 3,
            rows: 3,
            elements: [{
                type: "Text",
                content: "Enter Code",
                cols: 3
            }, {
                cols: 3
            }, {
                type: "Input",
                placeholder: "Your Code Here",
                cssClass: '__code__',
                cols: 2
            }, {
                type: "Submit",
                id: "code",
                cssClass: '__code_submit__',
                label: "Go"
            }]
        }
    };

    /**
     * flexMOTE disconnected - show reload button
     */
    UI.layouts['flexMOTE-disconnect'] = {
        type: 'layout',
        id: 'flexMOTE-disconnect',
        data: {
            name: 'Disconnect',
            cols: 3,
            rows: 3,
            elements: [{
                type: "Text",
                content: "Disconnected from server",
                cols: 3
            }, {
                cols: 3
            }, {}, {
                type: "Reload",
                label: "Reload"
            }, {}]
        }
    };

    // ----- public methods ----------------------------------------------------
    /**
     *
     */
    UI.buildLayout = function(layout) {
        console.log('buildLayout', layout.id);

        var configs = [];

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

            configs.push(cfg);
        }
        out += '</table>';

        // rebuild gui and event handlers
        UI.unloadLayout();
        $('#remote').html(out);
        $('#remote table').css('width', (layout.data.cols * layout.data.gridSize) + "px");

        $('#remote td>*').on('mousedown touchstart', UI.onElementPressed);
        $('#remote td>*').on('mouseup touchend', UI.onElementReleased);

        // call onRendered hook on all elements (if defined...)
        for (var idx = 0; idx < configs.length; idx++) {
            if (!!configs[idx].onRendered) {
                configs[idx].onRendered();
            };
        }

        // scale to fit
        UI.onResize();
    };

    /**
     *
     */
    UI.unloadLayout = function() {
        console.log('unload layout');
        $('#remote td>*').off('mousedown touchstart', UI.onElementPressed);
        $('#remote td>*').off('mouseup touchend', UI.onElementReleased);
        $('#remote').empty();
    };

    /**
     * @param {Object} skin
     */
    UI.loadSkin = function(skin) {
        console.log('load skin:', skin.id);

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
            console.log('load css', skin.data.url);

            var e = document.createElement('link');
            e.id = "skin-loader";
            e.rel = "stylesheet";
            e.type = "text/css";
            e.href = skin.data.url;
            e.onload = function() {
                console.log('css loaded');
            };

            $('head').append(e);
        }

        $('body').attr('id', skin.id);
    };

    /**
     *
     */
    UI.unloadSkin = function(removeStylesheet) {
        console.log('unloadSkin');
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
        console.log('resize');

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
        console.log('element pressed', event.currentTarget);
//		
        // specials: reload button
        var target = $(event.currentTarget);
        if (target.hasClass('__reload__')) {
            location.reload();
            return;
        }

        // specials: code input
        if (target.hasClass('__code_submit__')) {
            if ($('.input.__code__').val()) {
                location.hash = $('.input.__code__').val();
                location.reload();
            }
            else {
                alert("Please enter a code!");
            }
            return;
        }

        // default behaviour
        if (event.currentTarget.id && target.hasClass('button')) {
            console.log(' > inform app');
            flexMOTE.sendCommand('*', {
                action: 'set',
                type: 'button',
                id: event.currentTarget.id,
                data: {
                    state: State.PRESSED
                }
            });
        }
        
        if (target.hasClass('button')) {
        	event.preventDefault();
        }
    };

    /**
     * @param {Object} event
     */
    UI.onElementReleased = function(event) {
        console.log('element released', event.currentTarget);

        if (event.currentTarget.id) {
            flexMOTE.sendCommand('*', {
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
