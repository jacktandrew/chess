(function(){
var chess = window.chess = window.chess || {};

chess.ui =  {
  counter: 0,
  teams: ['white', 'black'],
  init: function() {
  	this.resetTurn();
    document.body.addEventListener('click', this, false);
  },
  resetTurn: function() {
    this.turn = {
      enemy: this.teams[1 - this.counter],
      color: this.teams[this.counter],
      squares: [],
      castling: []
    };
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
  		validMove = this.turn.squares.indexOf(sqObj) + 1,
	  	possibleMoves, start;

		if (validMove) {
			chess.game.movePiece(this.turn.start, sqObj);
	    this.endTurn(sqObj);
		} else {
			this.deactivate();
			this.turn.start = sqObj;
			possibleMoves = chess.game.getMoves(sqObj);
			this.activate(sqObj, possibleMoves);
		}
  },
  old: function(sqEl) {
    // var sqObj = chess.board[sqEl.dataset.name],
    //   possibleMoves = chess.game.getMoves(sqObj),
    //   validMove = this.turn.squares.indexOf(sqObj) + 1,
    //   enPassant = chess.pawn.enPassant.moveSq === sqObj,
    //   castling = this.turn.castling.indexOf(sqObj) + 1,
    //   inCheck;

    // this.turn.push(sqObj);
    // this.activate(results);

    // if (!validMove) return false;
    // chess.game.movePiece(this.turn.sqObj, sqObj);
    // inCheck = chess.check.get(this.turn.color);
    // if (castling) chess.castling.moveRook(sqObj);
    // if (enPassant) chess.pawn.completePass();
    // if (inCheck) chess.check.reverseMove(this.turn.sqObj, sqObj);
    // else chess.game.endTurn(sqObj);
  },
  activate: function(target, squares) {
  	var color = target.man.color;

    this.turn.squares = squares.filter(function(sq) {
      if (!sq.man || sq.man.color !== color) {
        sq.el.classList.add('active');
        return true;
      }
    });

    target.el.children[0].classList.add('active');
  },
  deactivate: function() {
    u.each(this.turn.squares, function(sq) {
      sq.el.classList.remove('active');
      if (sq.el.children[0])
	      sq.el.children[0].classList.remove('active');
    });
		this.turn.squares = [];
  },
  endTurn: function(sqObj) {
    chess.promotion.inquire(sqObj);
    chess.notation.record(sqObj);
    this.deactivate();
    this.counter = 1 - this.counter;
    this.resetTurn();
  }
}

})();