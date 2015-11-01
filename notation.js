window.chess.notation = {
  notes: [],
  current: {},
  previous: {},
  logEl: document.querySelector('.log'),
  start: function(sqObj) {
    var sq = sqObj.name,
      man = sqObj.man.abbr || '',
      f1 = chess.game.active.sqObj.coords[0],
      f2 = sqObj.coords[0],
      fileName = chess.game.active.sqObj.name[0],
      note = man + sq;

    this.color = sqObj.man.color;

    if (chess.game.isCastling) {
      if (f1 === 0 || f2 === 0) note = '0-0-0';
      if (f1 === 7 || f2 === 7) note = '0-0';
    } else if (chess.game.isCapture) {
      note = man + 'x' + sq;
      if (!man) note = fileName + 'x' + sq;
    }

    this.current = note;
  },
  finish: function(inCheck) {
    if (inCheck) this.current += '+';

    if (this.color === 'black') {
      this.notes.push([this.previous, this.current]);
      this.write([this.previous, this.current]);
    }

    this.previous = this.current;
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