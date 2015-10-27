window.chess.notation = {
  notes: [],
  logEl: document.querySelector('.log'),
  start: function(sqObj) {
    var sq = sqObj.name,
      man = sqObj.man.abbr || '';

    if (!chess.game.isCastling) this.note = man + sq;
    if (chess.game.isCapture) this.note = man + 'x' + sq;
  },
  finish: function(inCheck) {
    if (inCheck) this.note += '+';

    if (this.whiteMove) {
      this.notes.push([this.whiteMove, this.note]);
      this.write();
      this.whiteMove = undefined;
    } else {
      this.whiteMove = this.note;
    }
  },
  write: function() {
    var li = document.createElement('li');
    li.textContent = this.whiteMove+' '+this.note;
    this.logEl.appendChild(li);
  },
  log: function() {
    var l = this.notes.length;
    console.log(l+'. '+this.whiteMove, this.note);
  }
};