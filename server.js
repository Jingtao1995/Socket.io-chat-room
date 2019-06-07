// required components
var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);

var currentUser = [];
var currentSocket = [];
var Rooms = ['room1'];
var roomName = '';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    //if server receive socket with chat message flag, check receiver's name
    //and choose to send private msg or broadcast the msg to all
    socket.on('chat message', (userName, receiverName, msg, date) => {
        if (receiverName == 'all') {
            //send message to all client without self
            socket.broadcast.emit('chat message', userName, receiverName, msg, date);
        }
        else {
            currentSocket[currentUser.indexOf(receiverName)].emit('chat message', userName, receiverName, msg, date);
        }
        console.log(date + ' - ' + userName + ' to ' + receiverName + ' : ' + msg);
    })


    //when server receive socket of 'new user' event, store user's name and
    //response to cient.
    socket.on('new user', (userName) => {
        if (currentUser.indexOf(userName) == -1) {
            currentUser.push(userName);
            currentSocket.push(socket);
            io.emit('msg user join', userName);
            io.emit('add userList', userName);
            console.log(userName + " join room");
        }
        else {
            socket.emit('alert userName exists', userName);
        }
    })


    //when server listen disconnect event
    socket.on('disconnect', () => {
        //when disconnect username doesn't null, show user left message
        if (currentSocket.indexOf(socket) != -1) {
            if (currentUser[currentSocket.indexOf(socket)] != null) {
                io.emit('msg user leave', currentUser[currentSocket.indexOf(socket)]);
                console.log(currentUser[currentSocket.indexOf(socket)] + ' leave the room');
            }
            //remove leaved user's name and socket
            currentUser.splice(currentSocket.indexOf(socket), 1);
            currentSocket.splice(currentSocket.indexOf(socket), 1);
        }
    })

    //once new client connected to server add users to client List selector
    for (var i = 0; i < currentUser.length; i++) {
        socket.emit('add userList', currentUser[i]);
        //console.log('USER ADD');
    }

})

http.listen(process.env.PORT || 3000, function () {
    console.log('listening on http://localhost:3000/');
});