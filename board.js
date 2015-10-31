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
      var file = this.getFile(coords),
        rank = coords[1] + 1,
        name = file + rank;
      return this[name];
    },
    getFile: function(coords) {
      return this.letters[coords[0]];
    },
    getName: function(coords) {
      var file = this.getFile(coords),
        rank = coords[1] + 1;
      return file + rank;
    },
    getColor: function(file, rank) {
      var color = 'white',
        fileIsOdd = file % 2,
        rankIsOdd = rank % 2;
      if (fileIsOdd && rankIsOdd || !fileIsOdd && !rankIsOdd)
        color = 'black';
      return color;
    }
  };

})();