'use strict';

var chess = window.chess = window.chess || {};

var team = 1;

var longNotation = [];

u.ajax('json/i.pgn', function(string) {
  var moves = extractMoves(string);

  u.each(moves, function(move) {
    var start = move.slice(0,2),
      end = move.slice(2);
    console.log(start, end);
  });

  // longNotation.forEach(function(t) {
  //   console.log(t[0],t[1]);
  // })
});

function extractMoves(string) {
  var endOfNotes = string.lastIndexOf(']') + 1;
  string = string.slice(endOfNotes);
  string = string.replace(/\n/g, '');
  return string.split(' ');
}

function parseEnPassant() {}

function parseCastling(move, team) {
  var teams = [{
      '0-0':   [['e1','g1'],['h1','f1']],
      '0-0-0': [['e1','c1'],['a1','d1']]
    },{
      '0-0':   [['e8','g8'],['h8','f8']],
      '0-0-0': [['e8','c8'],['a8','d8']]
    }],
    coord = teams[team][move];
  if (coord) return coord;
}