/**
 * reference to socket.io
 * @private
 */
var io = null;

/**
 * @private
 */
var reservations = require('./reservations.json');

/**
 * @private
 */
var settings = {};

/**
 * debug flag
 * @private
 */
var DEBUG = false;

// ----- private methods -------------------------------------------------------
/**
 * remove the socket from it's current room and cleanup data/settings
 *
 * @param {Object} socket
 */
var leaveRoom = function(socket) {
    socket.broadcast.to(socket.room).emit('cmd', {
        action: 'set',
        type: 'user',
        id: socket.id,
        data: null
    });
    socket.leave(socket.room);

    // remove additional data/settings
    if (!io.sockets.adapter.rooms[socket.room]) {
        delete settings[socket.room];
    }
    delete socket.room;
};

/**
 * runs every 5 seconds to remove old clients and ping all remaining clients
 * to get their latency.
 */
var cronJob = function() {
    DEBUG && console.log('flexMOTE | cronJob');

    // remove inactive clients
    for (var id in io.sockets.sockets) {
        var client = io.sockets.sockets[id];
        var setting = settings[client.room];

        // client is connected to an old/not existing room
        if (!setting) {
            DEBUG && console.log(" > wrong room!", client.id);
            client.disconnect();
            continue;
        }

        // if client is not an app & this room has a timeout
        if (!client.isApp && setting.timeout > 0) {

            // we should disconnect all clients w/ inactivity
            var duration = ((new Date()).getTime() - client.lastUpdate);
            if (duration > setting.timeout) {
                DEBUG && console.log(" > inactivity!", client.id, duration, "ms");
                client.disconnect();
                continue;
            }
        }

        // :TODO: implement "ping" and save client's latency
    }
};

// ----- public methods --------------------------------------------------------
/**
 * initialize the module w/ reference to socket.io and DEBUG settings
 *
 * @param {Object} _io
 * @param {Boolean} _DEBUG
 */
module.exports.init = function(_io, _DEBUG) {
    io = _io;
    DEBUG = _DEBUG;
    setInterval(cronJob, 5000);
};

// ----- socket event handlers -------------------------------------------------
/**
 * handle incoming <cmd> message, actually forwarding to the right receiver(s)
 *
 * @param {Object} params
 * @param {Function} callback
 */
module.exports.onCommand = function(params, callback) {
    DEBUG && console.log('flexMOTE | onCommand', this.id, params.target);

    // forward <cmd> to params.target or ALL
    if (params.target && params.target != '*') {
        io.to(params.target).emit('cmd', params);
    }
    else {
        this.broadcast.to(this.room).emit('cmd', params);
    }

    this.lastUpdate = (new Date()).getTime();

    // fire callback (if any)
    if (callback) {
        callback();
    }
};

/**
 * ping message to measure latency
 *
 * @param {Function} callback
 */
module.exports.onPing = function(callback) {
    // :TODO: should work the other way around, server triggers the ping...
    DEBUG && console.log('flexMOTE | onPing', this.id);
    if (callback) {
        callback();
    }
};

/**
 * register a room
 *
 * @param {Object} setting
 * @param {Function} callback
 */
module.exports.onRegister = function(setting, callback) {
    var room = null;

    // check for reservations
    if (setting.room && reservations[setting.room]) {
        var r = reservations[setting.room];
        if (r.app == setting.app && r.secret == setting.secret) {
            room = setting.room;
        }
        else {
            callback(403);
            return;
        }
    }

    // create a new room, should not be a reserved id,
    // should not be already created
    if (!room) {
        do {
            room = Math.random().toString().replace(".", "").substr(0, 5);
            DEBUG && console.log(' > trying room', room);
        }
        while(reservations[room] || settings[room]);
    }

    // ok, we have a new room id, join and send result
    DEBUG && console.log('flexMOTE | onRegister', this.id, setting);
    this.join(room);
    this.room = room;
    this.isApp = true;

    // set some defaults for optional settings
    setting.timeout = setting.timeout || 0;
    setting.maxUsers = setting.maxUsers || -1;
    setting.stickySessions = setting.stickySessions || false;

    // save the settings in separate place,
    // don't mess up the socket.io room management
    settings[room] = setting;

    // everything is fine, send success message to client
    callback(200, room);
};

/**
 * join an existing room. If the given room is not active,
 * this call will fail (status: 404).
 *
 * @param {String} room
 * @param {Function} callback
 */
module.exports.onJoin = function(room, callback) {
    DEBUG && console.log('flexMOTE | onJoin', this.id, room);

    // creating a new room on the fly is not allowed!
    if (!room || !io.sockets.adapter.rooms[room]) {
        callback(404);
        return;
    }

    // check if the room is "full"
    // first user is the app, which has registered the room
    var userCount = Object.keys(io.sockets.adapter.rooms[room]).length - 1;
    if (settings[room].maxUsers > 0 && settings[room].maxUsers <= userCount) {
        callback(429);
        return;
    }

    // as the client part is always public, we can connect w/o further checks
    this.join(room);
    this.room = room;
    this.lastUpdate = (new Date()).getTime();
    this.broadcast.to(this.room).emit('cmd', {
        action: 'set',
        type: 'user',
        id: this.id,
        data: {
            connected: true
        }
    });

    // send success message
    callback(200, room);
};

/**
 * client leaves a room
 *
 * @param {Function} callback
 */
module.exports.onLeave = function(callback) {
    DEBUG && console.log('flexMOTE | onLeave', this.id);
    callback(200);
    this.disconnect();
};

/**
 * socket disconnected
 */
module.exports.onDisconnect = function() {
    DEBUG && console.log('flexMOTE | onDisconnect', this.id, this.room);
    leaveRoom(this);
};
