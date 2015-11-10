(function(){
'use strict';

var chess = window.chess = window.chess || {};

function Game() { this.init(); }

chess.Game = Game;

Game.prototype = {
  constructor: Game,
  init: function() {
  },
  readNotation: function(p1, p2) {
    var sq1 = chess.board[p1],
      sq2 = chess.board[p2];
    this.movePiece(sq1, sq2);
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
  }
};
})();