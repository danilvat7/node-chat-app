const socket = io();

function scrollToBottom() {
  const messages = $('#messages');
  const newMessage = messages.children('li:last-child');

  const clientHeight = messages.prop('clientHeight');
  const scrollTop = messages.prop('scrollTop');
  const scrollHeight = messages.prop('scrollHeight');
  const newMessageHeight = newMessage.innerHeight();
  const lastMessageHeight = newMessage.prev().innerHeight();
  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }

  messages.scrollTop(scrollHeight);
}
socket.on('connect', () => {
  const params = $.deparam(window.location.search);

  socket.emit('join', params, (err) => {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('updateUserList', (users) => {
  const ol = $('<ol></ol>');
  users.forEach(user => {
    ol.append($(`<li></li>`).text(user))
  });
  $('#users').html(ol);
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
  scrollToBottom();
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
  scrollToBottom();
});


const createMsg = (text) => {
  socket.emit('createMsg', {
    text
  }, (res) => {
    console.log('Got it', res);
  })
}


$('#form').on('submit', (ev) => {
  ev.preventDefault()
  createMsg($('#text').val())
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