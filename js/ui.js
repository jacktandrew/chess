(function(){
var chess = window.chess = window.chess || {};

chess.ui =  {
  init: function() {
    document.body.addEventListener('click', this, false);
  },
  handleEvent: function(event) {
    var sqEl = event.target;

    if (u.hasClass(event.target, 'promotion'))
      return chess.promotion.finish(event.target);

		if (u.hasClass(event.target, 'man'))
      sqEl = event.target.parentElement;

    this.handleSquare(sqEl);
  },
  handleSquare: function(sqEl) {
  	var sqObj = chess.board[sqEl.dataset.name],
  		validMove = chess.game.turn.squares.indexOf(sqObj) + 1,
	  	possibleMoves, start;

		if (validMove) {
			start = chess.game.turn.squares[0];
			chess.game.movePiece(start, sqObj);
		} else {
			this.deactivate();
			possibleMoves = chess.game.getMoves(sqObj);
			this.activate(sqObj, possibleMoves);
		}
  },
  old: function(sqEl) {
    // var sqObj = chess.board[sqEl.dataset.name],
    //   possibleMoves = chess.game.getMoves(sqObj),
    //   validMove = chess.game.turn.squares.indexOf(sqObj) + 1,
    //   enPassant = chess.pawn.enPassant.moveSq === sqObj,
    //   castling = chess.game.turn.castling.indexOf(sqObj) + 1,
    //   inCheck;

    // chess.game.turn.push(sqObj);
    // this.activate(results);

    // if (!validMove) return false;
    // chess.game.movePiece(chess.game.turn.sqObj, sqObj);
    // inCheck = chess.check.get(chess.game.turn.color);
    // if (castling) chess.castling.moveRook(sqObj);
    // if (enPassant) chess.pawn.completePass();
    // if (inCheck) chess.check.reverseMove(chess.game.turn.sqObj, sqObj);
    // else chess.game.endTurn(sqObj);
  },
  activate: function(target, squares) {
    chess.game.turn.squares = squares.filter(function(sq) {
      if (!sq.man || sq.man.color === chess.game.turn.enemy) {
        sq.el.classList.add('active');
        return true;
      }
    });
    target.el.children[0].classList.add('active');
    chess.game.turn.squares.unshift(target);
  },
  deactivate: function() {
    u.each(chess.game.turn.squares, function(sq) {
      sq.el.classList.remove('active');
      if (sq.el.children[0])
	      sq.el.children[0].classList.remove('active');
    });
		chess.game.turn.squares = [];
  },
  parseEvent: function(sqEl, manEl) {
    // var sqObj = chess.game.getObject(manEl),
    //   isActive = chess.game.turn.sqObj === sqObj;

    // if (sqObj.man.color === chess.game.turn.enemy) {
    //   chess.game.checkCapture(manEl, sqObj);
    //   chess.game.handleSquare(sqEl);
    // } else if (sqObj.man.color === chess.game.turn.color) {
    //   if (chess.game.turn.manEl) chess.game.deactivate();
    //   if (!isActive) chess.game.handleMan(manEl);
    // }
  },
}

})();