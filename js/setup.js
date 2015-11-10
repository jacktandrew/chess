(function(){
'use strict';

  var chess = window.chess = window.chess || {};

  chess.setup = {
    init: function(board, boardEl, white, black) {
      var blackBackRank = this.getBackRank(black),
        whiteBackRank = this.getBackRank(white);
      this.board = board;
      this.assignBackRank(whiteBackRank, 1);
      this.assignPawns(white, 2);
      this.assignPawns(black, 7);
      this.assignBackRank(blackBackRank, 8);
      chess.render.init(board, boardEl);
      chess.render.styleIt(8);
    },
    assignPawns: function(team, rank) {
      u.loopRank(this.board, rank, function(square, i) {
        square.man = team.pawn();
      });
    },
    assignBackRank: function(team, rank) {
      u.loopRank(this.board, rank, function(square, i) {
        square.man = team[i];
      });
    },
    getBackRank: function(team) {
      return [
        team.rook(),
        team.knight(),
        team.bishop(),
        team.queen(),
        team.king(),
        team.bishop(),
        team.knight(),
        team.rook()
      ]
    }
  }

})();