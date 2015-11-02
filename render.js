(function(){
  var chess = window.chess = window.chess || {};

  chess.render = {
    pieces: {
      white: {
        king: '&#9812;',
        queen: '&#9813;',
        rook: '&#9814;',
        bishop: '&#9815;',
        knight: '&#9816;',
        pawn: '&#9817;'
      },
      black: {
        king: '&#9818;',
        queen: '&#9819;',
        rook: '&#9820;',
        bishop: '&#9821;',
        knight: '&#9822;',
        pawn: '&#9823;'
      }
    },
  	init: function(board, boardEl) {

      for (var rank = 8; rank > 0; rank--) {
        u.loopRank(board, rank, function(square) {
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
        character = this.pieces[man.color][man.name];
      manEl.innerHTML = character;
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
      this.boardEl = boardEl;
    },
    makePromotionModal: function(color) {
      var modal = document.createElement('aside'),
        options = u.filter(this.pieces[color], function(unicode, name) {
          if (name === 'pawn' || name === 'king') return false;
          else return true;
        });
        u.each(options, function(unicode, name) {
          var piece = document.createElement('figure');
          piece.innerHTML = unicode;
          piece.classList.add('man', name);
          modal.appendChild(piece);
        });

      this.boardEl.classList.add('promotion');
      modal.classList.add('modal', color);
      document.body.appendChild(modal);
    }
  };

})();