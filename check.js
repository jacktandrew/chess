window.chess.check = {
  isMate: false,
  getSqByMan: function(name, color) {
    var results = u.filter(chess.board, function(sq) {
      var man = sq.man || {};
      if (man.color === color && man.name === name)
        return true;
    });
    return results[0]
  },
  get: function(kingSq) {
    kingSq = kingSq || this.getSqByMan('king', chess.game.active.color);
    var threats = this.inquire(kingSq),
      hasUncheck;

    if (threats) {
      hasUncheck = this.findUncheck(kingSq, threats);
      if (!hasUncheck) return this.alertMate();
    }

    return threats;
  },
  alertMate: function() {
    alert(chess.game.active.color+'... You lost... '+' Congrats '+chess.game.enemy);
  },
  inquire: function(kingSq) {
    return this.seekThreats(kingSq, chess.game.enemy);
  },
  seekThreats: function(target, enemy, moveType) {
    moveType = moveType || 'captures';
    var proto = chess.Pieces.prototype,
      l_shaped = chess.game.seekOne(target.coords, proto.l_shaped),
      diagonal = chess.game.seekMany(target.coords, proto.diagonal),
      straight = chess.game.seekMany(target.coords, proto.straight),
      squares = l_shaped.concat(diagonal, straight),
      threats = squares.filter(function(sq) {
        if (sq.man && sq.man.color === enemy) return true;
      }),
      real = threats.filter(function(sq) {
        var deltas = sq.man.moves[moveType] || sq.man.moves;

        if (sq.man.repeat)
          squares = chess.game.seekMany(sq.coords, deltas);
        else
          squares = chess.game.seekOne(sq.coords, deltas);

        if (squares.indexOf(target) + 1) return true;
      });
    if (real.length) return real;
  },
  reverseMove: function(sqObj) {
    setTimeout(function() {
      chess.game.active.sqObj.man = chess.game.active.man;
      chess.game.active.sqObj.el.appendChild(chess.game.active.manEl);
      sqObj.man = undefined;
      if (chess.game.isCapture) {
        sqObj.man = chess.game.capturedMan;
        sqObj.el.appendChild(chess.game.capturedEl);
        chess.game.isCapture = false;
      }
    }, 500);
  },
  getEscapes: function(kingSq) {
    var kingMoves = chess.game.seekOne(kingSq.coords, kingSq.man.moves),
      escapes = kingMoves.filter(function(sq) {
        var inCheck = chess.check.inquire(sq);
        if (inCheck) return false;
        if (!sq.man) return true;
      });
    if (escapes.length) return escapes;
  },
  getCaptureOfThreat: function(threats) {
    var captures = [];
    u.each(threats, function(threat) {
      var capture = chess.check.seekThreats(threat, chess.game.active.color);
      if (capture) captures = captures.concat(capture);
    });
    if (captures.length) return captures;
  },
  getBlockOfThreat: function(kingSq, threats) {
    var active = chess.game.active.color,
      paths = [], blockers = [];

    u.each(threats, function(threat) {
      if (threat.man.name === 'knight') {
        console.log('the knight cannot be blocked!');
        return false;
      }
      var path = chess.check.getAttackPaths(kingSq, threat);
      if (path.length) paths.push(path);
    });

    u.each(paths, function(path) {
      u.each(path, function(sq) {
        console.log('pathSq', sq);
        var blocker = chess.check.seekThreats(sq, active, 'advances');
        blockers = blockers.concat(blocker)
      });
    });

    blockers = blockers.filter(function(sq) {
      if (sq && sq.man.name !== 'king') return true;
    });

    if (blockers.length) return blockers;
  },
  getAttackPaths: function(kingSq, threat) {
    var diffs = [
        kingSq.coords[0] - threat.coords[0],
        kingSq.coords[1] - threat.coords[1]
      ],
      signs = [
        Math.sign(diffs[0]),
        Math.sign(diffs[1])
      ],
      max = Math.max(diffs[0], diffs[1]),
      path = [], coords = [];

    for (var i = 1; i < max; i++) {
      coords[0] = i * signs[0] + threat.coords[0];
      coords[1] = i * signs[1] + threat.coords[1];
      path[i] = chess.board.getSq(coords);
    }
    return path;
  },
  findUncheck: function(kingSq, threats) {
    var escapes = this.getEscapes(kingSq),
      captures = this.getCaptureOfThreat(threats),
      blocks = this.getBlockOfThreat(kingSq, threats);

    console.log(escapes, captures, blocks);

    if (escapes || captures || blocks) return true;
  }
};