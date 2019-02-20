const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('newMsg', msg => {
    const formattedTime = moment(msg.createdAt).format('h:mm a');

    const tmp = $('#msg-template').html();
    const html = Mustache.render(tmp, {
      text: msg.text,
      from: msg.from,
      createdAt: formattedTime
    });
    $('#messages').append(html);
  });

  socket.on('newLocMsg', msg => {
    const formattedTime = moment(msg.createdAt).format('h:mm a');

    const tmp = $('#location-msg-template').html();
    const html = Mustache.render(tmp, {
      url: msg.url,
      from: msg.from,
      createdAt: formattedTime
    });
    $('#messages').append(html);
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
});

const locationBtn = $('#send-location');
locationBtn.on('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('locationMsg', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })

  }, () => {
    alert('Unable to fetch location');
  })
});