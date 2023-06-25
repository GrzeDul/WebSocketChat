const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, '/client')));

const messages = [];
const users = [];

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});
const io = socket(server);

io.on('connection', (socket) => {
  socket.on('message', (message) => {
    messages.push(message);
    socket.broadcast.emit('message', message);
  });
  socket.on('join', (name) => {
    users.push({ name, id: socket.id });
    socket.broadcast.emit('addUser', {
      author: 'Chat Bot',
      content: `${name} has joined the conversation!`,
    });
  });

  socket.on('disconnect', () => {
    const user = users.find((user) => user.id === socket.id);
    const userIndex = users.indexOf(user);
    users.splice(userIndex, 1);
    socket.broadcast.emit('removeUser', {
      author: 'Chat Bot',
      content: `${user.name} has left the conversation... :(`,
    });
  });
});
