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
      this.completeCastle(sqObj);
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

    if (!this.isCastling) this.note = abbr + name;

    if (this.isCapture) {
      if (!abbr) abbr = this.active.sqObj.name.slice(0,1);
      this.note = abbr + 'x' + name;
    }

    this.isCastling = false;
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

    if (sq.man.canCastle && !this.inCheck) {
      castling = this.getCastling(sq);
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
  getCastling: function(sqObj) {
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
      kResult = this.checkCastle(k);

    if (file === 'h' || file === 'e')
      qResult = this.checkCastle(q);

    results = kResult.concat(qResult);

    return results.filter(function(sq) { if (sq) return true });
  },
  checkCastle: function(squares) {
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
  completeCastle: function(sqObj) {
    var clone = u.clone(sqObj.man),
      sq1 = this.active.sqObj.el,
      sq2 = sqObj.el,
      man1 = sq1.children[0],
      man2 = sq2.children[0],
      f1 = this.active.sqObj.coords[0],
      f2 = sqObj.coords[0];

    sq1.appendChild(man2);
    sq2.appendChild(man1);

    console.log(sqObj);
    console.log(this.active.sqObj);

    sqObj.man = this.active.sqObj.man;
    this.active.sqObj.man = clone;

    sqObj.man.canCastle = false;
    this.active.sqObj.man.canCastle = false;

    if (f1 === 0 || f2 === 0) this.note = '0-0-0';
    if (f1 === 7 || f2 === 7) this.note = '0-0';
    this.isCastling = true;

    this.endTurn(sqObj.el);
  }
};
})();