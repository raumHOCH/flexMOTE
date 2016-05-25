/**
 *
 */
var Config = window.Config = {};
Config.skins = {};
Config.layouts = {};

// ----- skins -----------------------------------------------------------------
/**
 * black/white
 */
Config.skins['skin-1'] = {
    action: 'set',
    type: 'skin',
    id: 'skin-1',
    data: {
        url: 'http://raumhoch.github.io/flexMOTE/samples/skin-demo/css/skins.css'
    }
};

/**
 * blue/red
 */
Config.skins['skin-2'] = {
    action: 'set',
    type: 'skin',
    id: 'skin-2',
    data: {
        url: 'http://raumhoch.github.io/flexMOTE/samples/skin-demo/css/skins.css'
    }
};

Config.currentSkin = 'skin-1';

// ----- layouts ---------------------------------------------------------------
/**
 * default skin-demo layout
 */
Config.layouts['layout-1'] = {
    action: 'set',
    type: 'layout',
    id: 'layout-1',
    data: {
        name: 'SkinDemo',
        orientation: 'landscape',
        cols: 8,
        rows: 8,
        elements: [{
            type: "Button",
            label: "T"
        }, {
            type: "Button",
            label: "L"
        }, {
            type: "Button",
            label: "S"
        }, {
            type: "Button",
            label: "K"
        }, {
            type: "Button",
            label: "D"
        }, {
            type: "Button",
            label: "S"
        }, {
            type: "Button",
            label: "L"
        }, {
            type: "Button",
            label: "T"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "B"
        }, {
            type: "Button",
            label: "T"
        }, {
            type: "Button",
            label: "L"
        }, {
            type: "Button",
            label: "S"
        }, {
            type: "Button",
            label: "D"
        }, {
            type: "Button",
            label: "K"
        }, {
            type: "Button",
            label: "S"
        }, {
            type: "Button",
            label: "L"
        }, {
            type: "Button",
            label: "T"
        }]
    }
};
