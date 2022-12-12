const { json } = require('express/lib/response');
const socketio = require('socket.io');

module.exports = function (server) {
  // io server
  const io = socketio(server);

  // game state (players list)
  const players = [];
  const afks = [];
  var texts = [];
  var id_received;
  var newcomer;


  io.on('connection', function (socket) {

    socket.emit('link id', socket.id)

    socket.on('connect player', function (data) {
      players[socket.id] = data;
      newcomer = data.name
    })    

    socket.on('update player', function (data) {
      players[socket.id] = data;

    })

    socket.on('update texts', function (data, id) {
      texts = data;
      id_received = id;

    })

    socket.on('not afk', function (data) {
      delete afks[data];

    })

    // delete disconnected player
    socket.on('disconnect', function () {
      delete players[socket.id];
    });

  });

  function update() {

    playersData = Object.values(players);
    playersData.forEach(function (p) {
      if(p.afk==60) // Le joueur passe afk au bout d'une seconde
      {
        afks[p.id] = p.id;
        p.was_afk = true;
      }
      else  p.afk++;


      
    });


    afksData = Object.values(afks);
    io.volatile.emit('players list', playersData, afksData, texts, id_received, newcomer);
    texts=[]
    id_received=undefined;
    newcomer=undefined
  }

  setInterval(update, 1000 / 60);
};

