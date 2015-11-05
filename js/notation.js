window.chess.notation = {
  notes: [],
  current: undefined,
  previous: undefined,
  logEl: document.querySelector('.log'),
  record: function(sqObj) {
    var inCheck = chess.check.get(chess.game.turn.enemy);
    if (!this.current) this.current = this.getNote(sqObj);

    if (inCheck) this.current += '+';

    if (sqObj.man.color === 'black') {
      this.notes.push([this.previous, this.current]);
      this.write([this.previous, this.current]);
    }

    this.previous = this.current;
    this.current = undefined;
  },
  getNote: function(sqObj) {
    var abbr = sqObj.man.abbr || '',
      fileName = chess.game.turn.sqObj.name[0];

    if (chess.game.captured) {
      note = abbr + 'x' + sqObj.name;
      if (!abbr) note = fileName + 'x' + sqObj.name;
    } else {
      note = abbr + sqObj.name;
    }

    return note;
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