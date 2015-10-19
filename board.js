(function(){
  var chess = window.chess = window.chess || {};

  function Board() { return this.init(); }

  chess.Board = Board;

  Board.prototype = {
    constructor: Board,
    length: 8,
    letters: ['a','b','c','d','e','f','g','h'],

    init: function() {
      this.buildBoard();
    },
    buildBoard: function() {
      var name, x, y;
      for (x = 0; x < this.length; x++) {
        for (y = 0; y < this.length; y++) {
          name = this.letters[x] + (y + 1);
          this[name] = {
            color: this.getColor(x, y),
            coords: [x, y],
            name: name
          }
        }
        y = 0;
      }
    },
    getSq: function(coords) {
      var column = this.letters[coords[0]],
        row = coords[1] + 1,
        name = column + row;
      return this[name];
    },
    getColor: function(column, row) {
      var color = 'white',
        columnIsOdd = column % 2,
        rowIsOdd = row % 2;
      if (columnIsOdd && rowIsOdd || !columnIsOdd && !rowIsOdd)
        color = 'black';
      return color;
    }
  };

})();