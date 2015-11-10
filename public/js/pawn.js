'use strict';

var chess = window.chess = window.chess || {};

chess.pawn = {
  enPassant: {},
  getMoves: function(sq) {
    var captures = this.getCaptures(sq),
      advances = this.getAdvances(sq),
      enPassant = this.getEnPassant(sq);
    return advances.concat(captures, enPassant);
  },
  getCaptures: function(sq) {
    var color = sq.man.color,
      possible = chess.ui.seekOne(sq.coords, sq.man.moves.captures),
      captures = possible.filter(function(sq) {
        if (sq && sq.man && sq.man.color !== color) return true;
      });
    return captures;
  },
  getAdvances: function(sq) {
    var pawn = sq.man,
      possible = chess.ui.seekOne(sq.coords, pawn.moves.advances);

    return possible.filter(function(sq, i) {
      if (!sq.man && i === 0) return true;
      if (!possible[0].man && !sq.man && !pawn.hasMoved) return true;
    });
  },
  getEnPassant: function(sq) {
    var onRank = false,
      captures = chess.ui.seekOne(sq.coords, sq.man.moves.captures),
      passes = chess.ui.seekOne(sq.coords, [[1,0],[-1,0]]),
      previous = chess.board[chess.notation.previous],
      i, move = [];

    if (sq.man.color === 'white' && sq.coords[1] === 4) onRank = true;
    else if (sq.man.color === 'black' && sq.coords[1] === 3) onRank = true;

    if (onRank) {
      i = passes.indexOf(previous);
      if (i + 1) {
        move[0] = captures[i];
        this.enPassant = {
          moveSq: captures[i],
          manSq: previous
        };
      }
    } else {
      this.enPassant = {};
    }

    return move;
  },
  completePass: function() {
    chess.game.capture(this.enPassant.manSq);
    this.enPassant = {};
    console.log('ep', this.enPassant);
  }
};