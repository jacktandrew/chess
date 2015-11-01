(function(){
var chess = window.chess = window.chess || {};

function Game() { this.init(); }

chess.Game = Game;

Game.prototype = {
  constructor: Game,
  counter: 0,
  teams: ['white', 'black'],
  init: function() {
    this.captures = [];
    this.active = { color: this.teams[this.counter], squares: [] };
    this.enemy = this.teams[1 - this.counter];
    document.body.addEventListener('click', this, false);
  },
  handleEvent: function(event) {
    var sqEl, manEl;
    if (u.hasClass(event.target, 'square')) {
      sqEl = event.target;
      manEl = event.target.children[0];
    } else if (u.hasClass(event.target, 'man')) {
      sqEl = event.target.parentElement;
      manEl = event.target;
    }

    if (manEl)
      this.parseEvent(sqEl, manEl);
    else if (u.hasClass(sqEl, 'active'))
      this.handleSquare(sqEl);
  },
  parseEvent: function(sqEl, manEl) {
    var sqObj = this.getObject(manEl),
      isActive = this.active.sqObj === sqObj;

    if (sqObj.man.castleNow)
      chess.castling.complete(sqObj);
    else if (sqObj.man.color === this.enemy)
      this.capture(sqEl, manEl, sqObj);
    else if (sqObj.man.color === this.active.color) {
      if (this.active.manEl) this.deactivate();
      if (!isActive) this.handleMan(manEl);
    }
  },
  handleSquare: function(sqEl) {
    var sqObj = chess.board[sqEl.dataset.name],
      target = {
        sqEl: sqEl,
        sqObj: sqObj
      },
      validMove = this.active.squares.indexOf(target.sqObj) + 1,
      enPassant = chess.pawn.enPassant.moveSq === target.sqObj;

    if (!validMove) return false;
    this.movePiece(target);
    this.inCheck = chess.check.get();
    if (enPassant) chess.pawn.completePass();
    if (this.inCheck) chess.check.reverseMove(target);
    else this.endTurn(sqObj);
  },
  movePiece: function(target) {
    this.active.sqObj.man.canCastle = false;
    //  Put man on target square in model
    target.sqObj.man = this.active.sqObj.man;

    //  Put man on target square in HTML
    target.sqObj.el.appendChild(this.active.manEl);

    //  Remove man of action from starting square
    this.active.sqObj.man = undefined;
  },
  endTurn: function(sqObj) {
    chess.notation.start(sqObj);
    this.counter = 1 - this.counter;
    this.deactivate();
    this.active = { color: this.teams[this.counter], squares: [] };
    this.enemy = this.teams[1 - this.counter];
    this.inCheck = chess.check.get();
    this.active.squares = [];
    chess.notation.finish(this.inCheck);
    this.isCastling = false;
    this.isCapture = false;
    chess.pawn.enPassant = {};
  },
  capture: function(sqEl, manEl, sqObj) {
    var isActiveSq = this.active.squares.indexOf(sqObj) + 1;

    if (isActiveSq) {
      this.finishCapture(manEl, sqObj);
      this.handleSquare(sqEl);
    }
  },
  finishCapture: function(manEl, sqObj) {
    this.active.man = sqObj.man;
    this.capturedEl = manEl;
    this.capturedMan = sqObj.man;
    sqObj.el.removeChild(manEl);
    sqObj.man = undefined;
    this.isCapture = true;
  },
  handleMan: function(manEl) {
    var sqObj = this.getObject(manEl),
      active = {
        man: sqObj.man,
        manEl: manEl,
        sqObj: sqObj
      },
      results = this.getMoves(sqObj);
    u.extend(this.active, active);
    this.activate(results);
  },
  activate: function(results) {
    this.active.manEl.classList.add('active');
    this.active.squares = results.filter(function(sq) {
      if (!sq.man || sq.man.castleNow || sq.man.color === chess.game.enemy) {
        sq.el.classList.add('active');
        return true;
      }
    });
    this.active.sqObj.el.classList.remove('active');
  },
  deactivate: function(manEl) {
    this.active.manEl.classList.remove('active');
    u.each(this.active.squares, function(sq) {
      sq.el.classList.remove('active');
      if (sq.man) sq.man.castleNow = false;
    });
    this.active.sqObj = {};
    this.active.manEl = undefined;
    this.active.squares = [];
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