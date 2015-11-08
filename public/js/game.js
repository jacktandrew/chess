(function(){
var chess = window.chess = window.chess || {};

function Game() { this.init(); }

chess.Game = Game;

Game.prototype = {
  constructor: Game,
  init: function() {
  },
  movePiece: function(src, dst) {
    src.man.hasMoved = true;
    //  Put man on target square in HTML
    if (dst.man) this.capture(dst);
    dst.el.appendChild(src.el.children[0]);
    //  Update model
    dst.man = src.man;
    src.man = undefined;
  },
  capture: function(sqObj) {
    var manEl = sqObj.el.children[0];
    chess.ui.turn.captured = {
      el: manEl,
      manObj: sqObj.man
    };

    sqObj.el.removeChild(manEl);
    sqObj.man = undefined;
  },
  getMoves: function(sq) {
    var results;

    if (sq.man.name === 'pawn')
      results = chess.pawn.getMoves(sq);
    else if (sq.man.name === 'king')
      results = this.getKingMoves(sq);
    else if (sq.man.repeat)
      results = chess.game.seekMany(sq.coords, sq.man.moves);
    else
      results = chess.game.seekOne(sq.coords, sq.man.moves);

    return results;
  },
  getKingMoves: function(sq, results) {
    var results = chess.game.seekOne(sq.coords, sq.man.moves),
      castling;

    if (!sq.man.hasMoved) {
      castling = chess.castling.get(sq);
      chess.ui.turn.castling = castling;
      results = results.concat(castling);
    }

    return chess.check.filterKingMoves(sq.man, results);
  },
  seekOne: function(start, deltas) {
    var squares = deltas.map(function(delta) {
      var coord = [start[0]+delta[0], start[1]+delta[1]];
      return chess.board.getSq(coord);
    });

    return squares.filter(function(sq) { if (sq) return true });
  },
  seekMany: function(p0, deltas, squares) {
    squares = squares || [];

    u.each(deltas, function(p1) {
      var coord = [p0[0]+p1[0], p0[1]+p1[1]],
        sq = chess.board.getSq(coord);

      if (sq) {
        squares.push(sq);
        if (!sq.man) chess.game.seekMany(coord, [p1], squares);
      }
    });

    return squares.filter(function(sq) { if (sq) return true });
  }
};
})();