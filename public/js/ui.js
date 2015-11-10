(function(){
'use strict';

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
    connection.send(this.turn.start.name + sqObj.name);
    this.endTurn(sqObj);
  },
  getMoves: function(sq) {
    var results;

    if (sq.man.name === 'pawn')
      results = chess.pawn.getMoves(sq);
    else if (sq.man.name === 'king')
      results = this.getKingMoves(sq);
    else if (sq.man.repeat)
      results = this.seekMany(sq.coords, sq.man.moves);
    else
      results = this.seekOne(sq.coords, sq.man.moves);

    return results;
  },
  getKingMoves: function(sq, results) {
    var results = chess.ui.seekOne(sq.coords, sq.man.moves),
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
        if (!sq.man) chess.ui.seekMany(coord, [p1], squares);
      }
    });

    return squares.filter(function(sq) { if (sq) return true });
  },
  handleSelect: function(sqObj) {
    var possibleMoves;
    if (sqObj.man.color !== this.turn.color) return false;
    this.deactivate();
    this.turn.start = sqObj;
    possibleMoves = this.getMoves(sqObj);
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