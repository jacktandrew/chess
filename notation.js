window.chess.notation = {
  notes: [],
  current: undefined,
  previous: undefined,
  logEl: document.querySelector('.log'),
  start: function(sqObj) {
    var sq = sqObj.name,
      abbr = sqObj.man.abbr || '',
      fileName = chess.game.active.sqObj.name[0],
      note;

    this.color = sqObj.man.color;

    if (chess.game.isCapture) {
      note = abbr + 'x' + sqObj.name;
      if (!abbr) note = fileName + 'x' + sqObj.name;
    } else {
      note = abbr + sqObj.name;
    }

    if (!this.current) this.current = note;
  },
  finish: function(inCheck) {
    if (inCheck) this.current += '+';

    if (this.color === 'black') {
      this.notes.push([this.previous, this.current]);
      this.write([this.previous, this.current]);
    }

    this.previous = this.current;
    this.current = undefined;
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