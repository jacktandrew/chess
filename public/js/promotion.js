window.chess.promotion = {
  rank: { black: 0, white: 7 },
  handle: function() {
    chess.promotion.finish(sqEl);
  },
  inquire: function(sqObj) {
    var c = sqObj.man.color,
      isPawn = sqObj.man.name === 'pawn',
      onLastRank = this.rank[c] === sqObj.coords[1];

    this.sqObj = sqObj;
    if (isPawn && onLastRank) this.showModal(c);
  },
  showModal: function(color) {
    var modal = chess.render.getModal(color);
    this.men = {
      queen: chess.team[color].queen(),
      rook: chess.team[color].rook(),
      bishop: chess.team[color].bishop(),
      knight: chess.team[color].knight()
    };

    u.each(this.men, function(obj) {
      var manEl = chess.render.getManEl(obj);
      manEl.classList.add('promotion');
      modal.appendChild(manEl);
    });

    document.body.appendChild(modal);
    document.body.classList.add('modal');
    this.modal = modal;
  },
  finish: function(manEl) {
    var pawn = this.sqObj.el.children[0],
      man = this.men[manEl.dataset.name];

    manEl.classList.remove('promotion');
    document.body.classList.remove('modal');
    document.body.removeChild(this.modal);

    this.sqObj.man = man;
    this.sqObj.el.removeChild(pawn);
    this.sqObj.el.appendChild(manEl);
  }
};