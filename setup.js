(function(){
  var chess = window.chess = window.chess || {};

  chess.setup = {
    init: function(board, white, black) {
      var blackBackRow = this.getBackRow(black),
        whiteBackRow = this.getBackRow(white);
      this.board = board;
      this.assignBackRow(whiteBackRow, 1);
      this.assignPawns(white, 2);
      this.assignPawns(black, 7);
      this.assignBackRow(blackBackRow, 8);
      this.boardEl = chess.render.init(board);
      document.body.appendChild(this.boardEl);
      chess.render.styleIt(8);
    },
    assignPawns: function(team, row) {
      u.loopRow(this.board, row, function(square, i) {
        square.man = team.pawn();
      });
    },
    assignBackRow: function(team, row) {
      u.loopRow(this.board, row, function(square, i) {
        square.man = team[i];
      });
    },
    getBackRow: function(team) {
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