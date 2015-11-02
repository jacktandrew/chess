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
    document.body.addEventListener('click', this, false);
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
  handleEvent: function(event) {
    var sqEl, manEl;
    if (u.hasClass(event.target, 'promotion')) {
      return chess.promotion.finish(event.target);
    } else if (u.hasClass(event.target, 'square')) {
      sqEl = event.target;
      manEl = event.target.children[0];
    } else if (u.hasClass(event.target, 'man')) {
      sqEl = event.target.parentElement;
      manEl = event.target;
    }

    if (manEl)
      this.parseEvent(sqEl, manEl);
    else if (sqEl && u.hasClass(sqEl, 'active'))
      this.handleSquare(sqEl);
  },
  parseEvent: function(sqEl, manEl) {
    var sqObj = this.getObject(manEl),
      isActive = this.turn.sqObj === sqObj;

    if (sqObj.man.color === this.turn.enemy) {
      this.checkCapture(manEl, sqObj);
      this.handleSquare(sqEl);
    } else if (sqObj.man.color === this.turn.color) {
      if (this.turn.manEl) this.deactivate();
      if (!isActive) this.handleMan(manEl);
    }
  },
  handleSquare: function(sqEl) {
    var sqObj = chess.board[sqEl.dataset.name],
      validMove = this.turn.squares.indexOf(sqObj) + 1,
      enPassant = chess.pawn.enPassant.moveSq === sqObj,
      castling = this.turn.castling.indexOf(sqObj) + 1,
      inCheck;

    if (!validMove) return false;
    this.movePiece(this.turn.sqObj, sqObj);
    inCheck = chess.check.get(this.turn.color);
    if (castling) chess.castling.moveRook(sqObj);
    if (enPassant) chess.pawn.completePass();
    if (inCheck) chess.check.reverseMove(this.turn.sqObj, sqObj);
    else this.endTurn(sqObj);
  },
  movePiece: function(srcObj, dstObj) {
    //  Put man on target square in HTML
    dstObj.el.appendChild(srcObj.el.children[0]);

    //  Update model
    dstObj.man = srcObj.man;
    srcObj.man = undefined;
  },
  endTurn: function(sqObj) {
    chess.promotion.inquire(sqObj);
    sqObj.man.canCastle = false;
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
  handleMan: function(manEl) {
    var sqObj = this.getObject(manEl),
      active = {
        man: sqObj.man,
        manEl: manEl,
        sqObj: sqObj
      },
      results = this.getMoves(sqObj);
    u.extend(this.turn, active);
    this.activate(results);
  },
  activate: function(results) {
    this.turn.manEl.classList.add('active');
    this.turn.squares = results.filter(function(sq) {
      if (!sq.man || sq.man.color === chess.game.turn.enemy) {
        sq.el.classList.add('active');
        return true;
      }
    });
    this.turn.sqObj.el.classList.remove('active');
  },
  deactivate: function(manEl) {
    if (this.turn.manEl)
      this.turn.manEl.classList.remove('active');

    u.each(this.turn.squares, function(sq) {
      sq.el.classList.remove('active');
    });

    this.resetTurn();
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