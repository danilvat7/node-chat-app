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
    generateMsg
} = require('./utils/message');

app.use(express.static(publicPath));

io.on('connection', socket => {
    console.log('New user connected');

    socket.emit('newMsg', generateMsg('Admin', 'Welcome to the chat!'));

    socket.broadcast.emit('newMsg', generateMsg('Admin', 'New User joined us'));

    socket.on('createMsg', (msg, cb) => {
        console.log('createMsg', msg);
        io.emit('newMsg', generateMsg(msg.from, msg.text));
        cb('This is from server');
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });
});

server.listen(port, () => {
    console.log('Server is working on 3000');
});
