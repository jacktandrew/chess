var connection;

if (!location.hash) client();
else host(location.hash.slice(1))

function movePiece(data) {
  var p1 = chess.board[data.slice(0,2)],
    p2 = chess.board[data.slice(2)];
  console.log('webrtc');
  chess.game.movePiece(p1, p2);
  chess.ui.endTurn(p2);
}

function host(id) {
  console.log('the client id ===', id);

  var peer = new Peer({host: 'localhost', port: 9000, path: '/peerjs'});

  connection = peer.connect(id);

  connection.on('open', function() {
    // Receive messages
    connection.on('data', movePiece);
  });
}

function client() {
  var peer = new Peer({host: 'localhost', port: 9000, path: '/peerjs'});

  peer.on('open', function(id) {
    location.hash = id;
    console.log('My peer ID is: ' + id);
  });

  peer.on('connection', function(conn) {
    conn.on('data', movePiece);
    connection = conn;
  });
}
