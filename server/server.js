const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

const {
    generateMsg,
    generateLocMsg
} = require('./utils/message');
const {
    isRealString
} = require('./utils/validation');
const {
    Users
} = require('./utils/users');

const users = new Users();


app.use(express.static(publicPath));

io.on('connection', socket => {
    socket.on('join', (params, cb) => {
        for (const key in params) {
            if (!isRealString(params[key])) {
                return cb('Name and room name are require');
            }
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUsersList(params.room));

        socket.emit('newMsg', generateMsg('Admin', 'Welcome to the chat!'));

        socket.broadcast.to(params.room).emit('newMsg', generateMsg('Admin', `${params.name} joined`));

        cb();
    });

    socket.on('createMsg', (msg, cb) => {
        const user = users.getUser(socket.id);

        if (user && isRealString(msg.text)) {
            io.to(user.room).emit('newMsg', generateMsg(user.name, msg.text));
        }
        cb('This is from server');
    });

    socket.on('locationMsg', (coords) => {
        const user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocMsg', generateLocMsg(user.name, coords.latitude, coords.longitude));
        }
    });
    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUsersList(user.room));
            io.to(user.room).emit('newMsg', generateMsg('Admin', `${user.name} left room`));
        }

    });
});

server.listen(port, () => {
    console.log('Server is working on 3000');
});