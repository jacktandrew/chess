window.chess.castling = {
  get: function(sqObj) {
    var rank = sqObj.coords[1] + 1,
      qSide = [], kSide = [], castlingSq = [];

    u.loopRank(chess.board, rank, function(sq) {kSide.push(sq)});
    qSide = kSide.splice(0,4)

    qSide.reverse();
    qSide.unshift(kSide[0]);

    castlingSq = [this.check(kSide), this.check(qSide)];

    return castlingSq.filter(function(sq) { if (sq) return true });
  },
  check: function(squares) {
    var validSquares = squares.filter(function(sq, i) {
      var inCheck = chess.check.inquire(sq),
        occupiedByEnemy = (sq.man && sq.man.color === chess.game.enemy);
      if (!inCheck && (!sq.man || occupiedByEnemy)) return true;
      if (sq.man && sq.man.canCastle) return true;
    });

    if (squares.length === validSquares.length) {
      squares[2].castling = true;
      return squares[2];
    }
  },
  moveRook: function(sqObj) {
    var middleOfBoard = 4,
      rank = sqObj.coords[1],
      file = sqObj.coords[0],
      delta = Math.sign(middleOfBoard - file),
      queenSideSq = chess.board.getSq([0, rank]),
      kingSideSq = chess.board.getSq([7, rank]),
      dstCoords = u.combine(sqObj.coords, [delta, 0]),
      dstSq = chess.board.getSq(dstCoords),
      srcSq;

    if (file < middleOfBoard) {
      srcSq = queenSideSq;
      chess.notation.current = '0-0-0';
    } else if (file > middleOfBoard) {
      srcSq = kingSideSq;
      chess.notation.current = '0-0';
    }

    chess.game.movePiece(srcSq, dstSq);
  }
};