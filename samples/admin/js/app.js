// ----- flexMOTE setup --------------------------------------------------------
/**
 * @public socket.io connection
 */
flexMOTE.connection = io('https://flexmote.youspace.online');

/**
 * onConnect event handler
 */
flexMOTE.connection.on('connect', function() {

    // register a channel, using a reserved room id
    flexMOTE.register({
        app: 'admin',
        room: '00000',
        secret: 'myadminsecret',
        version: '0.1.0',
        maxUsers: -1,
        timeout: -1,
        stickySessions: false
    }, function(status, room) {
        clearInterval(app.updateInterval);
        app.updateInterval = setInterval(app.updateStatistics, app.UPDATE_INTERVAL);
        app.updateStatistics();
    });
});

/**
 * onDisconnect event handler
 */
flexMOTE.connection.on('disconnect', function() {
    clearInterval(app.updateInterval);
});

// ----- application -----------------------------------------------------------
/**
 * @singleton
 */
var app = {};

/**
 *
 */
app.MAX_DATA_POINTS = 12;

/**
 *
 */
app.UPDATE_INTERVAL = 5 * 1000;

/**
 * interval id to stop running updateStatistics interval
 */
app.updateInterval = -1;

/**
 * this field is updated periodically
 */
app.statistics = [{
    memmory: {},
    latency: 0,
    appCount: 0,
    userCount: 0,
    rooms: []
}];

/**
 * load data from server
 */
app.updateStatistics = function() {
    console.log('updateStatistics');
    var start = (new Date()).getTime();
    flexMOTE.connection.emit('statistics', function(status, data) {
        console.log(' >', status, data);
        data.latency = (new Date()).getTime() - start;
        app.statistics.unshift(data);
        if (app.statistics.length > app.MAX_DATA_POINTS) {
            app.statistics.pop();
        }
        app.updateGui();
    });
};

/**
 * update gui w/ latest statistics
 */
app.updateGui = function() {

    // top navi
    $('#server-name').text(flexMOTE.connection.io.uri);
    $('#total-apps').text(app.statistics[0].appCount || 0);
    $('#total-users').text(app.statistics[0].userCount || 0);
    $('#latency').text((app.statistics[0].latency || 0) + " ms");

    // left sidebar (applications)
    $('#rooms').empty();
    for (var i = 0; i < app.statistics[0].rooms.length; i++) {
        var room = app.statistics[0].rooms[i];
        var html = '<div class="item"><span>#' + room.id + ' | ' + room.app + '</span>';
        html += '<br /><em>' + room.host + '</em></div>';
        $('#rooms').append(html);
    }

    // chart options
    var options = {
        responsive: true,
        animation: false,
        showTooltips: false,
        scaleBeginAtZero: true
    };

    // chart data
    var labels = app.statistics.map(function(elem, idx) {
        return (idx * app.UPDATE_INTERVAL / 1000) + "s";
    }).reverse();

    var userCounts = app.statistics.map(function(elem) {
        return elem.userCount || 0;
    }).reverse();

    var appCounts = app.statistics.map(function(elem) {
        return elem.appCount || 0;
    }).reverse();

    var latencies = app.statistics.map(function(elem) {
        return elem.latency || 0;
    }).reverse();

    var cpuLoads = app.statistics.map(function(elem) {
        return elem.cpuLoad || 0;
    }).reverse();

    // chart 1 - app count
    var ctx = document.getElementById("chart-1").getContext("2d");
    var data = {
        labels: labels,
        datasets: [{
            label: "Apps",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: appCounts
        }]
    };
    var myLineChart = new Chart(ctx).Line(data, options);

    // chart 2 - user count
    ctx = document.getElementById("chart-2").getContext("2d");
    data = {
        labels: labels,
        datasets: [{
            label: "Users",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: userCounts
        }]
    };
    myLineChart = new Chart(ctx).Line(data, options);

    // chart 3 - latencies
    ctx = document.getElementById("chart-3").getContext("2d");
    data = {
        labels: labels,
        datasets: [{
            label: "Latencies",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: latencies
        }]
    };
    myLineChart = new Chart(ctx).Line(data, $.extend({
        scaleLabel: function(payload) {
            return payload.value + "ms";
        }
    }, options));

    // chart 4 - cpu load
    ctx = document.getElementById("chart-4").getContext("2d");
    data = {
        labels: labels,
        datasets: [{
            label: "Latencies",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: cpuLoads
        }]
    };
    myLineChart = new Chart(ctx).Line(data, $.extend({
        scaleBeginAtZero: true,
        scaleOverride: true,
        scaleStepWidth: 20,
        scaleSteps: 5,
        scaleStartValue: 0,
        scaleLabel: function(payload) {
            return payload.value + "%";
        }
    }, options));
};

// ----- setup semantic ui behaviour -------------------------------------------
// tooltips for top nav
$('.top.menu i.icon').parent().popup();

/**
 * toggle application sidebar on the left
 * @param {Object} event
 */
$('.ui.button.applications').on('click', function(event) {
    $('.ui.sidebar.left').sidebar({
        dimPage: false
    }).sidebar('toggle');
});

/**
 * toggle application settings on the right
 * @param {Object} event
 */
$('.ui.button.settings').on('click', function(event) {
    $('.ui.sidebar.right').sidebar({
        dimPage: false
    }).sidebar('toggle');
});