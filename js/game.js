(function(){
var chess = window.chess = window.chess || {};

function Game() { this.init(); }

chess.Game = Game;

Game.prototype = {
  constructor: Game,
  counter: 0,
  teams: ['white', 'black'],
  init: function() {
    this.resetTurn();
  },
  switchTurn: function() {
    this.counter = 1 - this.counter;
    this.captured = undefined;
    this.resetTurn();
  },
  resetTurn: function() {
    this.turn = {
      enemy: this.teams[1 - this.counter],
      color: this.teams[this.counter],
      squares: [],
      castling: []
    };
  },
  movePiece: function(srcObj, dstObj) {
    srcObj.man.hasMoved = true;
    //  Put man on target square in HTML
    dstObj.el.appendChild(srcObj.el.children[0]);
    console.log(srcObj, dstObj);
    //  Update model
    dstObj.man = srcObj.man;
    srcObj.man = undefined;
  },
  endTurn: function(sqObj) {
    chess.promotion.inquire(sqObj);
    chess.notation.record(sqObj);
    this.deactivate();
    this.switchTurn();
  },
  checkCapture: function(manEl, sqObj) {
    var isActiveSq = this.turn.squares.indexOf(sqObj) + 1;
    if (isActiveSq) this.capture(manEl, sqObj)
  },
  capture: function(manEl, sqObj) {
    this.turn.man = sqObj.man;
    this.captured = {
      el: manEl,
      man: sqObj.man
    };
    sqObj.el.removeChild(manEl);
    sqObj.man = undefined;
  },
  getObject: function(manEl) {
    var sqEl = manEl.parentElement,
      name = sqEl.dataset.name;
    return chess.board[name];
  },
  getMoves: function(sq) {
    var results, castling;

    if (sq.man.name === 'pawn')
      results = chess.pawn.getMoves(sq);
    else if (sq.man.repeat)
      results = chess.game.seekMany(sq.coords, sq.man.moves);
    else
      results = chess.game.seekOne(sq.coords, sq.man.moves);

    if (sq.man.name === 'king' && !this.inCheck) {
      castling = chess.castling.get(sq);
      this.turn.castling = castling;
      results = castling.concat(results);
    }

    return results;
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