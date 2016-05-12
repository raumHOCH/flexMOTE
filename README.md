# [flexMOTE.js](https://raumhoch.github.io/flexMOTE/)

flexMOTE.js is a framework for providing instant remote control for virtual or physical applications. Remote interfaces are accessible through any mobile browser (BYOD).

## Examples
Find a [Hello World example](http://raumhoch.github.io/flexMOTE/samples/hello-world/index.html) and a [remote website control example](http://raumhoch.github.io/flexMOTE/samples/earth/index.html). Here is a "Read-only" demo of the [admin panel](http://raumhoch.github.io/flexMOTE/samples/admin/index.html).

## Use cases
**Control web-based services**
- Games
- IoT
- Website / presentations
- Local / remote audience feedback

**Control hardware**
- Physical application using Arduino, Rhasberry, etc.
- Smart TV
- Connected Cars
- IoT

## How it works
![Diagram](https://raumhoch.github.io/flexMOTE/images/flexMOTE.png)

## System requirements

- nodejs
- npm

## Getting started
- Clone repository:

      (git clone .... && cd ....)

- Install node.js dependencies:

      npm install

- Start server:

      node app.js

- Point your browser to http://localhost:3000

## API in example

Include the flexMOTE library and dependancies:
```html
<script type="text/javascript" src="http://localhost:3000/lib/zepto.min.js"></script>
<script type="text/javascript" src="http://localhost:3000/lib/socket.io-1.3.5.js"></script>
<script type="text/javascript" src="http://localhost:3000/lib/qrcode.min.js"></script>
<script type="text/javascript" src="http://localhost:3000/lib/flexMOTE.js"></script>

```
Define a layout:

```javascript
var layout = {
    action: 'set',
    type: 'layout',
    id: 'layout-1',
    data: {
        name: 'Layout 1',
        cols: 3,
        rows: 3,
        elements: [ { type: "Text", content: "Hello World!", cols: 3 }, { cols: 3 }, { cols: 3}]
    }
};
```
Connect to server:
```javascript
flexMOTE.connection = io('http://localhost:3000');
flexMOTE.connection.on('connect', function() {
    flexMOTE.register({
        app: 'hello-world',
        room: '12345',
        secret: 'mysecret',
        version: '0.1.0',
        maxUsers: -1,
        timeout: -1,
        stickySessions: false
    }, function(status, room) {
        console.log(status, room);
    });
});
```
Define event handler for user commands:
```javascript
flexMOTE.connection.on('cmd', function(cmd) {
    switch (cmd.action) {
        case 'set':
            switch (cmd.type) {
                case 'user':
                    if (cmd.data && cmd.data.connected) {
                        flexMOTE.sendCommand(cmd.id, layout);
                    }
                break;
            }
        break;
    }
});
```

## Related repositories
For more examples check the [the flexMOTE samples](https://github.com/raumHOCH/flexMOTE-samples) repository. For the latest updates check [the flexMOTE admin samples](https://github.com/raumHOCH/flexMOTE-admin) repository.

## Credits

Christian David ([@chrdavid](https://github.com/chrdavid)) at ([@raumHOCH](https://github.com/raumHOCH)).

## License

This work is licensed under a
[Creative Commons Attribution 3.0 Unported License](https://creativecommons.org/licenses/by/3.0/deed.en_US).
