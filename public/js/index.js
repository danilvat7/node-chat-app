const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('newMsg', msg => {
    const li = $('<li></li>');
    li.text(`${msg.from}: ${msg.text}`);
    $('#messages').append(li);
  });
});


const createMsg = (from, text) => {
  socket.emit('createMsg', {
    from,
    text
  }, (res) => {
    console.log('Got it', res);
  })
}


$('#form').on('submit', (ev) => {
  ev.preventDefault()

  createMsg('Jhon', $('#text').val())
})