(function(){
  var chess = window.chess = window.chess || {};

  chess.render = {
  	init: function(board) {
      var boardEl = document.createElement('section');
      boardEl.className = 'board';

      for (var row = 8; row > 0; row--) {
        u.loopRow(board, row, function(square) {
          var squareEl = document.createElement('div'), manEl;

          squareEl.classList.add('square', square.color, square.name);
          squareEl.dataset.name = square.name;

          if (square.man) {
            manEl = this.getManEl(square.man);
            squareEl.appendChild(manEl);
          }

          square.el = squareEl;
          boardEl.appendChild(squareEl);
        }.bind(this));
      }

      return boardEl
    },
    getManEl: function(man) {
      var manEl = document.createElement('figure'),
        abbr = man.abbr || man.name.slice(0,1);
      manEl.textContent = abbr;
      manEl.dataset.name = man.name;
      manEl.classList.add('man', man.color, man.name);
      return manEl;
    },
    styleIt: function(length) {
      var boardEl = document.querySelector('.board'),
        square = boardEl.querySelector('.square'),
        style = getComputedStyle(square),
        width = parseInt(style.width),
        boardWidth = width * length + 100;
      boardEl.style.width = boardWidth + 'px';
    },
  };

})();