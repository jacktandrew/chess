(function(){
  var chess = window.chess = window.chess || {};

  function Game(board) { this.init(board); }

  chess.Game = Game;

  Game.prototype = {
    constructor: Game,
    counter: 0,
    teams: ['white', 'black'],
    init: function(board) {
      this.active = {
        color: this.teams[this.counter],
        moves: []
      };
      this.board = board;
      this.enemy = this.teams[1 - this.counter];
      document.body.addEventListener('click', this, false);
    },
    handleEvent: function(event) {
      var el = event.target,
        parent = el.parentElement,
        parentIsSq = parent.classList.contains('square'),
        isMan = el.classList.contains('man'),
        isPawn = el.classList.contains('pawn'),
        isSq = el.classList.contains('square'),
        isActiveTeam = el.classList.contains(this.active.color);

      if (isPawn) this.getPawnMoves(sqObj);
      if (isMan && isActiveTeam) this.handleMan(el);
      else if (isSq) this.handleSquare(el);
      else if (parentIsSq) this.handleSquare(parent);
    },
    handleSquare: function(sqEl) {
      var name = sqEl.dataset.name,
        sqObj = chess.board[name];

      if (!sqObj.el.classList.contains('active')) return false;
      if (sqObj.man) this.takePiece(sqObj);

      sqObj.man = this.active.man;
      sqObj.el.appendChild(this.active.manEl);

      this.counter = 1 - this.counter;
      this.deactivate();

      this.active.sqObj.man = undefined;
      this.active = { color: this.teams[this.counter] };
      this.enemy = this.teams[1 - this.counter];
    },
    takePiece: function(sqObj) {
      var piece = sqObj.el.children[0];
      sqObj.el.removeChild(piece);
      sqObj.man = undefined;
    },
    handleMan: function(manEl) {
      var sqObj = this.getObject(manEl),
        active = {
          manEl: manEl,
          man: sqObj.man,
          sqObj: sqObj,
          moves: []
        },
        moves;

      if (manEl.classList.contains(this.active.color)) {
        if (this.active.manEl) this.deactivate();
        u.extend(this.active, active);
        this.getPotentialMoves(sqObj, active.man, active.man.moves);
        this.activateSquares();
        manEl.classList.add('active');
      }
    },
    deactivate: function(manEl) {
      this.active.manEl.classList.remove('active');
      u.each(this.active.moves, function(move) {
        move.el.classList.remove('active');
      });
    },
    getObject: function(manEl) {
      var sqEl = manEl.parentElement,
        name = sqEl.dataset.name;
      return chess.board[name];
    },
    getPotentialMoves: function(sqObj, man, deltas) {
      var start = sqObj.coords, moves;

      moves = u.map(deltas, function(delta) {
        var sq = chess.board.getSq([start[0]+delta[0],start[1]+delta[1]]);
        if (sq && !sq.man && man.repeat) {
          chess.game.getPotentialMoves(sq, man, delta);
          console.log(sq);
        }

        return sq;
      });

      this.active.moves = this.active.moves.concat(moves);
    },
    onHome: function(coords) {
      var team = this.active.color;
      if (team === 'white' && coords[1] === 1) return true;
      if (team === 'black' && coords[1] === 6) return true;
    },
    activateSquares: function() {
      this.active.moves = this.active.moves.filter(function(move) {
        if (!move) return false;
        if (!move.man || move.man.color === chess.game.enemy)
          return true;
      });

      u.each(this.active.moves, function(sq) {
        sq.el.classList.add('active');
      });
    },
    getPawnMoves: function(sqObj) {
      var coords = sqObj.coords,
        onHome = this.onHome(coords),
        enemy = this.enemy,
        squares = u.map(sqObj.man.moves, function(deltas) {
          return deltas.map(function(delta) {
            var moves = [delta[0]+coords[0], delta[1]+coords[1]];
            return chess.board.getSq(moves);
          });
        }),
        kills = squares.kills.filter(function(sq) {
          if (sq && sq.man && sq.man.color === enemy) return true;
        }),
        advances = squares.moves.filter(function(move, i) {
          if (!move) return false;
          if (!move.man && i === 0) return true;
          if (!move.man && onHome) return true;
        });

      return advances.concat(kills);
    }
  };

})();