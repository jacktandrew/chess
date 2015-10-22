(function(){
  var chess = window.chess = window.chess || {};

  function Game() { this.init(); }

  chess.Game = Game;

  Game.prototype = {
    constructor: Game,
    counter: 0,
    teams: ['white', 'black'],
    init: function() {
      this.kills = [];
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
          this.handleMan(el);
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
      //  Store man of action
      this.active.man = this.active.sqObj.man;

      //  Put man on target square in model
      target.sqObj.man = this.active.sqObj.man;

      //  Put man on target square in HTML
      target.sqObj.el.appendChild(this.active.manEl);

      //  Remove man of action from starting square
      this.active.sqObj.man = undefined;
    },
    checkForMate: function() {
      var inCheck = false;
      this.kills = [];
      this.threatened(this.enemy, this.active.color);

      u.each(this.kills, function(kill) {
        if (kill.man && kill.man.name === 'king') inCheck = true;
      });

      return inCheck;
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
        console.log(this.whiteMove, this.note);
        this.whiteMove = undefined;
      } else {
        this.whiteMove = this.note;
      }
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
    threatened: function(us, them) {
      var ourTeam = u.filter(chess.board, function(sq) {
          if (sq.man && sq.man.color === us) return true;
        });
      this.enemy = them;

      u.each(ourTeam, function(sq) {
        if (sq.man.name === 'pawn') this.getPawnKills(sq);
        else this.getMoves(sq.coords, sq.man.repeat, sq.man.moves);
      }.bind(this));
      this.enemy = this.teams[1 - this.counter];
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
          manEl: manEl,
          sqObj: sqObj
        };

      manEl.classList.add('active');
      u.extend(this.active, active);

      if (u.hasClass(manEl, 'pawn'))
        this.getPawnMoves(chess.board[manEl.parentElement.dataset.name]);
      else
        this.getMoves(sqObj.coords, sqObj.man.repeat, sqObj.man.moves);

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
          chess.game.kills.push(sq);
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
    getPawnKills: function(sq) {
      var enemy = this.enemy,
        possible = this.getPossible(sq.coords, sq.man.moves.kills);
        kills = possible.filter(function(sq) {
          if (sq && sq.man && sq.man.color === enemy) return true;
        });
      this.kills = this.kills.concat(kills);
      return kills;
    },
    getPawnAdvances: function(sq) {
      var onHome = this.onHome(sq.coords),
        possible = this.getPossible(sq.coords, sq.man.moves.advances);

      return possible.filter(function(move, i) {
        if (!move) return false;
        if (!move.man && i === 0) return true;
        if (!move.man && onHome) return true;
      });
    },
    getPossible: function(start, deltas) {
      return deltas.map(function(delta) {
        var move = [start[0]+delta[0], start[1]+delta[1]];
        return chess.board.getSq(move);
      });
    },
    getPawnMoves: function(sq) {
      var kills = this.getPawnKills(sq),
        advances = this.getPawnAdvances(sq);

      this.active.squares = advances.concat(kills);
    }
  };

})();