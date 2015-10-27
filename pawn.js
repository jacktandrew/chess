window.chess.pawn = {
  onHome: function(coords) {
    var team = chess.game.active.color;
    if (team === 'white' && coords[1] === 1) return true;
    if (team === 'black' && coords[1] === 6) return true;
  },
  getMoves: function(sq) {
    var captures = this.getCaptures(sq),
      advances = this.getAdvances(sq);
    return advances.concat(captures);
  },
  getCaptures: function(sq) {
    var enemy = chess.game.enemy,
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
  }
};
