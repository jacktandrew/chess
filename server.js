var express = require('express');
var http = require('http');
var peerjs = require('peer');
var app = express();
var ExpressPeerServer = peerjs.ExpressPeerServer;
var options = { debug: true }
var server = http.createServer(app);

app.use(express.static('public'));

app.use('/peerjs', ExpressPeerServer(server, options));

server.listen(9000);