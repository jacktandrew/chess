window.chess.pawn = {
  enPassant: {},
  home: {
    white: 1,
    black: 6
  },
  onHome: function(coords) {
    var team = chess.game.turn.color;
    if (this.home[team] === coords[1]) return true;
  },
  getMoves: function(sq) {
    var captures = this.getCaptures(sq),
      advances = this.getAdvances(sq),
      enPassant = this.getEnPassant(sq);
    return advances.concat(captures, enPassant);
  },
  getCaptures: function(sq) {
    var enemy = chess.game.turn.enemy,
      possible = chess.game.seekOne(sq.coords, sq.man.moves.captures);
      captures = possible.filter(function(sq) {
        if (sq && sq.man && sq.man.color === enemy) return true;
      });
    chess.game.captures = chess.game.captures.concat(captures);
    return captures;
  },
  getAdvances: function(sq) {
    var onHome = this.onHome(sq.coords),
      possible = chess.game.seekOne(sq.coords, sq.man.moves.advances);

    return possible.filter(function(move, i) {
      if (!move) return false;
      if (!move.man && i === 0) return true;
      if (!move.man && onHome) return true;
    });
  },
  getEnPassant: function(sq) {
    var onRank = false,
      captures = chess.game.seekOne(sq.coords, sq.man.moves.captures),
      passes = chess.game.seekOne(sq.coords, [[1,0],[-1,0]]),
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
    var sqObj = this.enPassant.manSq,
      manEl = sqObj.el.children[0];

    chess.game.finishCapture(manEl, sqObj);
  }
};