(function(){
  var chess = window.chess = window.chess || {};

  function Pieces(color) { return this.init(color); }

  chess.Pieces = Pieces;

  Pieces.prototype = {
    constructor: Pieces,
    diagonal: [
      [1,1],    //  NE
      [1,-1],   //  SE
      [-1,-1],  //  SW
      [-1,1]    //  NW
    ],
    straight: [
      [1,0],    //  right
      [-1,0],   //  left
      [0,1],    //  forward
      [0,-1]    //  back
    ],
    l_shaped: [
      [1,2],    //  1 o'clock
      [2,1],    //  2 o'clock
      [2,-1],   //  4 o'clock
      [1,-2],   //  5 o'clock
      [-1,-2],  //  7 o'clock
      [-2,-1],  //  8 o'clock
      [-2,1],   //  10 o'clock
      [-1,2]    //  11 o'clock
    ],
    whitePawn: {
      advances: [[0,1],[0,2]],
      captures: [[1,1],[-1,1]]
    },
    blackPawn: {
      advances: [[0,-1],[0,-2]],
      captures: [[1,-1],[-1,-1]]
    },
    init: function(color) {
      this.all = this.straight.concat(this.diagonal);
      this.color = color;
    },
    getPawnMoves: function() {
      if (this.color === 'black') return this.blackPawn;
      if (this.color === 'white') return this.whitePawn;
    },
    pawn: function() {
      return {
        name: 'pawn',
        color: this.color,
        moves: this.getPawnMoves(),
        repeat: false,
        promotable: true
      }
    },
    rook: function() {
      return {
        name: 'rook',
        color: this.color,
        moves: this.straight,
        repeat: true,
        abbr: 'R'
      }
    },
    knight: function() {
      return {
        name: 'knight',
        color: this.color,
        moves: this.l_shaped,
        repeat: false,
        jumpping: true,
        abbr: 'N'
      }
    },
    bishop: function() {
      return {
        name: 'bishop',
        color: this.color,
        moves: this.diagonal,
        repeat: true,
        abbr: 'B'
      }
    },
    queen: function() {
      return {
        name: 'queen',
        color: this.color,
        moves: this.all,
        repeat: true,
        abbr: 'Q'
      }
    },
    king: function() {
      return {
        name: 'king',
        color: this.color,
        moves: this.all,
        repeat: false,
        abbr: 'K'
      }
    }
  };

})();