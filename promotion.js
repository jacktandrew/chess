window.chess.promotion = {
  rank: {
    black: 0,
    white: 7
  },
  inquire: function(sqObj) {
    var c = sqObj.man.color,
      isPawn = sqObj.man.name === 'pawn',
      onLastRank = this.rank[c] === sqObj.coords[1];

    if (isPawn && onLastRank)
      chess.render.makePromotionModal(c);
  },
  finish: function() {

  }
};