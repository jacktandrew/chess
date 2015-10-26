(function(){
var chess = window.chess = window.chess || {};

function Game() { this.init(); }

chess.Game = Game;

Game.prototype = {
  constructor: Game,
  counter: 0,
  logEl: document.querySelector('.log'),
  teams: ['white', 'black'],
  init: function() {
    this.captures = [];
    this.notation = [];
    this.active = { color: this.teams[this.counter], squares: [] };
    this.enemy = this.teams[1 - this.counter];
    document.body.addEventListener('click', this, false);
  },
  handleEvent: function(event) {
    var el = event.target;

    if (u.hasClass(el, 'square')) {
      if (el.children.length) {
        this.capture(el.children[0]);
      } else {
        this.handleSquare(el);
      }
    } else {
      if (u.hasClass(el, this.active.color)) {
        if (this.active.manEl) this.deactivate();
        else this.handleMan(el);
      } else if (u.hasClass(el.parentElement, 'active')) {
        this.capture(el);
      }
    }
  },
  handleSquare: function(sqEl) {
    var name = sqEl.dataset.name,
      target = {
        sqEl: sqEl,
        sqObj: chess.board[name]
      },
      validMove = this.active.squares.indexOf(target.sqObj) + 1;

    if (!validMove) return false;
    this.movePiece(target);
    this.inCheck = this.checkForMate();
    if (this.inCheck) this.reverseMove(target);
    else this.endTurn(sqEl);
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
  endTurn: function(sqEl) {
    this.noteMove(sqEl);
    this.counter = 1 - this.counter;
    this.deactivate();
    this.active = { color: this.teams[this.counter], squares: [] };
    this.enemy = this.teams[1 - this.counter];
    this.inCheck = this.checkForMate();
    this.active.squares = [];
    this.finishNote();
  },
  finishNote: function() {

    if (this.inCheck) this.note += '+';

    if (this.whiteMove) {
      this.notation.push([this.whiteMove, this.note]);
      this.writeLog();
      this.whiteMove = undefined;
    } else {
      this.whiteMove = this.note;
    }
  },
  writeLog: function() {
    var l = this.notation.length;
    // console.log(l+'. '+this.whiteMove, this.note);
    li = document.createElement('li');
    li.textContent = this.whiteMove+' '+this.note;
    this.logEl.appendChild(li);
  },
  noteMove: function(sqEl) {
    var name = sqEl.dataset.name,
      abbr = this.active.man.abbr || '';
    this.note = abbr + name;

    if (this.isCapture) {
      if (!abbr) abbr = this.active.sqObj.name.slice(0,1);
      this.note = abbr + 'x' + name;
    }

    this.isCapture = false;
  },
  reverseMove: function(target) {
    setTimeout(function() {
      this.active.sqObj.man = this.active.man;
      this.active.sqObj.el.appendChild(this.active.manEl);
      target.sqObj.man = undefined;
      if (this.isCapture) {
        target.sqObj.man = this.capturedMan;
        target.sqObj.el.appendChild(this.capturedEl);
        this.isCapture = false;
      }
    }.bind(this), 500);
  },
  capture: function(manEl) {
    var sqEl = manEl.parentElement,
      sqObj = chess.board[sqEl.dataset.name],
      isEnemy = sqObj.man.color === this.enemy,
      isActiveSq = this.active.squares.indexOf(sqObj) + 1;

    if (isEnemy && isActiveSq) {
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
      piece = sqObj.man.name,
      active = {
        man: sqObj.man,
        manEl: manEl,
        sqObj: sqObj
      };

    manEl.classList.add('active');
    u.extend(this.active, active);

    if (piece === 'pawn') {
      this.getPawnMoves(chess.board[manEl.parentElement.dataset.name]);
    } else if (piece === 'king') {
      this.getCastling();
      this.getMoves(sqObj.coords, sqObj.man.repeat, sqObj.man.moves);
    } else {
      this.getMoves(sqObj.coords, sqObj.man.repeat, sqObj.man.moves);
    }

    this.activateSquares();
  },
  deactivate: function(manEl) {
    this.active.manEl.classList.remove('active');
    u.each(this.active.squares, function(sqObj) {
      sqObj.el.classList.remove('active');
    });
    this.active.manEl = undefined;
    this.active.squares = [];
  },
  getObject: function(manEl) {
    var sqEl = manEl.parentElement,
      name = sqEl.dataset.name;
    return chess.board[name];
  },
  getMoves: function(start, repeat, deltas) {
    u.each(deltas, function(delta) {
      var sq = chess.board.getSq([start[0]+delta[0],start[1]+delta[1]]);
      if (!sq) return false;
      if (!sq.man) {
        if (repeat) chess.game.getMoves(sq.coords, repeat, [delta]);
        chess.game.active.squares.push(sq);
      } else if (sq.man.color === chess.game.enemy) {
        chess.game.active.squares.push(sq);
        chess.game.captures.push(sq);
      }
    });
  },
  onHome: function(coords) {
    var team = this.active.color;
    if (team === 'white' && coords[1] === 1) return true;
    if (team === 'black' && coords[1] === 6) return true;
  },
  activateSquares: function() {
    var squares = this.active.squares.filter(function(sq) {
      if (sq) return true;
    });

    u.each(squares, function(sq) {
      sq.el.classList.add('active');
    });
  },
  getPawnCaptures: function(sq) {
    var enemy = this.enemy,
      possible = this.seekOne(sq.coords, sq.man.moves.captures);
      captures = possible.filter(function(sq) {
        if (sq && sq.man && sq.man.color === enemy) return true;
      });
    this.captures = this.captures.concat(captures);
    return captures;
  },
  getPawnAdvances: function(sq) {
    var onHome = this.onHome(sq.coords),
      possible = this.seekOne(sq.coords, sq.man.moves.advances);

    return possible.filter(function(move, i) {
      if (!move) return false;
      if (!move.man && i === 0) return true;
      if (!move.man && onHome) return true;
    });
  },
  seekOne: function(start, deltas) {
    var squares = deltas.map(function(delta) {
      var coord = [start[0]+delta[0], start[1]+delta[1]];
      return chess.board.getSq(coord);
    });

    return squares.filter(function(sq) {if (sq)return true;});
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

    return squares;
  },
  getPawnMoves: function(sq) {
    var captures = this.getPawnCaptures(sq),
      advances = this.getPawnAdvances(sq);

    this.active.squares = advances.concat(captures);
  },
  checkForMate: function(kingSq) {
    var proto = chess.Pieces.prototype,
      deltas = proto.straight.concat(proto.diagonal),
      boole = false, singles, repeats, squares, threats, real;

    kingSq = kingSq || this.getSqByMan('king', this.active.color);
    singles = this.seekOne(kingSq.coords, proto.l_shaped);
    repeats = this.seekMany(kingSq.coords, deltas);
    squares = singles.concat(repeats);
    threats = squares.filter(function(sq) {
      if (sq && sq.man && sq.man.color === chess.game.enemy) return true;
    });
    real = threats.filter(function(sq) {
      var deltas = sq.man.moves.captures || sq.man.moves;

      if (sq.man.repeat)
        squares = chess.game.seekMany(sq.coords, deltas);
      else
        squares = chess.game.seekOne(sq.coords, deltas);

      if (squares.indexOf(kingSq) + 1) return true;
    });
    return real.length;
  },
  getSqByMan: function(name, color) {
    var results = u.filter(chess.board, function(sq) {
      var man = sq.man || {};
      if (man.color === color && man.name === name)
        return true;
    });
    return results[0]
  },
  // There are a number of cases when castling is not permitted.
  // Your king has been moved earlier in the game.
  // The rook that castles has been moved earlier in the game.
  // There are pieces standing between your king and rook.
  // The king is in check.
  // The king moves through a square that is attacked by a piece of the opponent.
  // The king would be in check after castling.

  getCastling: function() {
    var rank = this.active.sqObj.coords[1] + 1;
    var left, right = [];
    u.loopRank(chess.board, rank, function(sq, i, name) {
      var man = sq.man,
        obj = {};

      if (man) obj.occupied = true;
      if (man && man.canCastle)
        obj.canCastle = true;

      obj.name = name;

      right[i] = obj;
    });
    //  remove 4 elements from index 0
    left = right.splice(0,4)
    left.push(right[0]);
    right.reverse();

    this.checkCastle(left);
    this.checkCastle(right);
  },
  checkCastle: function(arr) {
    var l = arr.length,
      valid = true;

    u.each(arr, function(obj) {
      var sq = chess.board[obj.name],
        inCheck = chess.game.checkForMate(sq);
    });
  }
};
})();