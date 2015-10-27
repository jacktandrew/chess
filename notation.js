window.chess.notation = {
  notes: [],
  logEl: document.querySelector('.log'),
  start: function(sqObj) {
    var sq = sqObj.name,
      man = sqObj.man.abbr || '',
      f1 = chess.game.active.sqObj.coords[0],
      f2 = sqObj.coords[0],
      note = man + sq;

    if (chess.game.isCastling) {
      if (f1 === 0 || f2 === 0) note = '0-0-0';
      if (f1 === 7 || f2 === 7) note = '0-0';
    } else if (chess.game.isCapture) {
      note = man + 'x' + sq;
    }

    return note;
  },
  finish: function(note, inCheck) {
    var move = [this.previous, note];
    if (inCheck) note += '+';

    if (this.previous) {
      this.notes.push(move);
      this.write(move);
      this.previous = undefined;
    } else {
      this.previous = note;
    }
  },
  write: function(move) {
    var li = document.createElement('li');
    li.textContent = move[0]+' '+move[1];
    this.logEl.appendChild(li);
  },
  log: function() {
    // var l = this.notes.length;
    // console.log(l+'. '+this.previous, this.note);
  }
};