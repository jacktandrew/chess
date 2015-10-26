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
    var el = event.target,
      sq, man, child;

    if (u.hasClass(el, 'square')) {
      if (kids.length) {
        this.parseEvent(sq, man);
      } else {
        this.handleSquare(el);
      }
    } else {
      if (u.hasClass(el, this.active.color)) {
        if (this.active.manEl) this.deactivate();
        this.handleMan(el);
      } else if (u.hasClass(el.parentElement, 'active')) {
        this.parseEvent(sq, man);
      }
    }
  },
  parseEvent: function(sq, man) {
    if (u.hasClass(sq, this.enemy)
      this.capture(man);
    else if (u.hasClass(man, man.canCastle)
      this.completeCastle(man);
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
      if (!sq.man || sq.man.canCastleNow ||
          sq.man.color === chess.game.enemy) {

        sq.el.classList.add('active');
        return true;
      }
    });
  },
  deactivate: function(manEl) {
    this.active.manEl.classList.remove('active');
    u.each(this.active.squares, function(sq) {
      sq.el.classList.remove('active');
      if (sq.man) sq.man.canCastleNow = false;
    });
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
      results = this.getPawnMoves(sq);
    else if (sq.man.repeat)
      results = chess.game.seekMany(sq.coords, sq.man.moves);
    else
      results = chess.game.seekOne(sq.coords, sq.man.moves);

    if (sq.man.canCastle && !this.inCheck) {
      castling = this.getCastling(sq);
      results = castling.concat(results);
    }

    return results;
  },
  onHome: function(coords) {
    var team = this.active.color;
    if (team === 'white' && coords[1] === 1) return true;
    if (team === 'black' && coords[1] === 6) return true;
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
  },
  getPawnMoves: function(sq) {
    var captures = this.getPawnCaptures(sq),
      advances = this.getPawnAdvances(sq);
    return advances.concat(captures);
  },
  checkForMate: function(kingSq) {
    kingSq = kingSq || this.getSqByMan('king', this.active.color);
    var proto = chess.Pieces.prototype,
      l_shaped = this.seekOne(kingSq.coords, proto.l_shaped),
      diagonal = this.seekMany(kingSq.coords, proto.diagonal),
      straight = this.seekMany(kingSq.coords, proto.straight),
      squares = l_shaped.concat(diagonal, straight),
      threats = squares.filter(function(sq) {
        if (sq && sq.man && sq.man.color === chess.game.enemy) return true;
      }),
      real = threats.filter(function(sq) {
        var deltas = sq.man.moves.captures || sq.man.moves;

        if (sq.man.repeat)
          squares = chess.game.seekMany(sq.coords, deltas);
        else
          squares = chess.game.seekOne(sq.coords, deltas);

        if (squares.indexOf(kingSq) + 1) return true;
      });
    return !!real.length;
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

  getCastling: function(sqObj) {
    var rank = sqObj.coords[1] + 1,
      results = [], right = [],
      left, leftObj, rightObj;

    u.loopRank(chess.board, rank, function(sq) {right.push(sq)});
    //  remove 4 elements from index 0
    left = right.splice(0,4)
    //  remove the king
    right.shift();
    right.reverse();
    results[0] = this.checkCastle(left);
    results[1] = this.checkCastle(right);
    return results.filter(function(sq) { if (sq) return true });
  },
  checkCastle: function(squares) {
    var validSquares = squares.filter(function(sq) {
      var inCheck = chess.game.checkForMate(sq), canCastle;
      if (sq.man) canCastle = sq.man.canCastle;
      if (!inCheck && !sq.man || canCastle) return true;
    });
    if (squares.length === validSquares.length) {
      squares[0].man.canCastleNow = true;
      console.log(squares[0])
      return squares.shift();
    }
  }


};
})();