window.chess.castling = {
  get: function(sqObj) {
    var rank = sqObj.coords[1] + 1,
      file = chess.board.getFile(sqObj.coords),
      q = [], k = [],
      kResult = [], qResult = [], results;

    u.loopRank(chess.board, rank, function(sq) {q.push(sq)});
    //  remove 4 elements from index 0
    k = q.splice(0,4)
    //  Add King to k
    k.push(q[0]);
    q.reverse();

    if (file === 'a' || file === 'e')
      kResult = this.check(k);

    if (file === 'h' || file === 'e')
      qResult = this.check(q);

    results = kResult.concat(qResult);

    return results.filter(function(sq) { if (sq) return true });
  },
  check: function(squares) {
    var validSquares = squares.filter(function(sq, i) {
      var inCheck = chess.game.checkForMate(sq),
        occupiedByEnemy = (sq.man && sq.man.color === chess.game.enemy);
      if (!inCheck && (!sq.man || occupiedByEnemy)) return true;
      if (sq.man && sq.man.canCastle) return true;
    });

    if (squares.length === validSquares.length) {
      squares.splice(1, squares.length - 2);
      squares[0].man.castleNow = true;
      squares[1].man.castleNow = true;
      return squares;
    }
    return [];
  },
  complete: function(sqObj) {
    var clone = u.clone(sqObj.man),
      sq1 = chess.game.active.sqObj.el,
      sq2 = sqObj.el,
      man1 = sq1.children[0],
      man2 = sq2.children[0];

    sq1.appendChild(man2);
    sq2.appendChild(man1);

    sqObj.man = chess.game.active.sqObj.man;
    chess.game.active.sqObj.man = clone;

    sqObj.man.canCastle = false;
    chess.game.active.sqObj.man.canCastle = false;

    chess.game.isCastling = true;

    chess.game.endTurn(sqObj);
  }
};