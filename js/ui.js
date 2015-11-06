(function(){
var chess = window.chess = window.chess || {};

chess.ui =  {
  counter: 1,
  teams: ['white', 'black'],
  init: function() {
    var board = document.querySelector('.board');
  	this.resetTurn();
    board.addEventListener('click', this, false);
  },
  resetTurn: function() {
    this.counter = 1 - this.counter;
    this.turn = {
      enemy: this.teams[1 - this.counter],
      color: this.teams[this.counter],
      squares: [],
      castling: []
    };
  },
  handleEvent: function(event) {
    var sqObj = chess.board[event.target.dataset.name],
  	  validMove = this.turn.squares.indexOf(sqObj) + 1;

		if (validMove) this.handleMove(sqObj);
		else if (sqObj.man) this.handleSelect(sqObj);
  },
  handleMove: function(sqObj) {
    this.checkForTheUnusual(sqObj);
    chess.game.movePiece(this.turn.start, sqObj);
    this.endTurn(sqObj);
  },
  handleSelect: function(sqObj) {
    var possibleMoves;
    if (sqObj.man.color !== this.turn.color) return false;
    this.deactivate();
    this.turn.start = sqObj;
    possibleMoves = chess.game.getMoves(sqObj);
    this.activate(sqObj, possibleMoves);
  },
  checkForTheUnusual: function(sqObj) {
  	var enPassant = chess.pawn.enPassant.moveSq === sqObj,
  		castling = this.turn.castling.indexOf(sqObj) + 1;
    if (castling) chess.castling.moveRook(sqObj);
    if (enPassant) chess.pawn.completePass();
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
  deactivate: function(sqObj) {
    u.each(this.turn.squares, function(sq) {
      sq.el.classList.remove('active');
    });

    if (this.turn.start)
	    this.turn.start.el.children[0].classList.remove('active');

	  if (sqObj) sqObj.el.children[0].classList.remove('active');

		this.turn.squares = [];
  },
  reverseMove: function(src, dst) {
    var king = u.getManEl('king', src.man.color);
    king.classList.add('active');
    setTimeout(function() {
      chess.game.movePiece(src, dst);
      if (this.turn.captured) this.reverseCapture(src);
      this.deactivate(dst);
      king.classList.remove('active');
    }.bind(this), 400);
  },
  reverseCapture: function(sqObj) {
    sqObj.el.appendChild(this.turn.captured.el);
    sqObj.man = this.turn.captured.manObj;
    this.turn.captured = undefined;
  },
  endTurn: function(sqObj) {
    var inCheck = chess.check.get(this.turn.color);
    if (inCheck) return this.reverseMove(sqObj, this.turn.start);

    chess.promotion.inquire(sqObj);
    chess.notation.record(sqObj);
    this.turn.start = undefined;
    this.deactivate(sqObj);
    this.resetTurn();
  }
}

})();