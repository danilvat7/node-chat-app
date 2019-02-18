const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', socket => {
  console.log('New user connected');

  socket.emit('newMsg', {
    from: 'Admin',
    text: 'Welcome to the chat!',
    createdAt: new Date().getTime()
  });

  socket.broadcast.emit('newMsg', {
    from: 'Admin',
    text: 'New User joined us',
    createdAt: new Date().getTime()
  });

  socket.on('createMsg', msg => {
    console.log('createMsg', msg);
    io.emit('newMsg', {
      from: msg.from,
      text: msg.text,
      createdAt: new Date().getTime()
    });
    // socket.broadcast.emit('newMsg', {
    //   from: msg.from,
    //   text: msg.text,
    //   createdAt: new Date().getTime()
    // });
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log('Server is working on 3000');
});
