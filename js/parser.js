var team = 1;

var longNotation = [];

u.ajax('json/immortal.json', function(string) {
  game = JSON.parse(string);
  u.each(game, function(move) {
    white = makeLong(move[0]);
    black = makeLong(move[1]);
    longNotation.push([white, black]);
  });

  longNotation.forEach(function(t) {
    // console.log(t[0],t[1]);
  })
});

function makeLong(move) {
  var l, man, file, rank;
  move = move.replace(/\#|\?+|\!+|\++/g,'');
  l = move.length - 1;
  man = move.match(/[B-R]/);
  file = move.match(/[a-h]/);
  rank = move[l];
  team = 1 - team;

  if (!file) return parseCastling(move, team);
  if (!man) return parsePawnMove(move, team);

  return getPrev(team, man[0], file[0], rank);
}

function parsePawnMove(move, team) {
  if (move.match(/x/)) return parsePawnCatpure(move, team);
  var dirs = [1,-1],
    dir = dirs[team],
    end = parseInt(move[1]),
    rank = end - dir,
    prev = checkDoubleMove(move[0], rank, team, dir);

  return [prev, move[0] + move[1]];
}

function checkDoubleMove(file, rank, team, dir) {
  var prev = file + rank,
    arr = longNotation.filter(function(turn) {
      if (turn[team] && prev === turn[team][1]) return true;
    });

  if (!arr.length) {
    rank = rank - dir;
    prev = file + rank;
  }

  return prev
}

function parsePawnCatpure(move, team) {
  var dirs = [1,-1],
    dir = dirs[team],
    end = parseInt(move[3]),
    rank = end - dir;

  return [move[0] + rank, move[2] + move[3]];
}

var movements = {
  diagonal: [
    [1,1],    //  NE
    [1,-1],   //  SE
    [-1,-1],  //  SW
    [-1,1]    //  NW
  ],
  straight: [
    [1,0],    //  right
    [-1,0],   //  left
    [0,1],    //  forward
    [0,-1]    //  back
  ],
  l_shaped: [
    [1,2],    //  1 o'clock
    [2,1],    //  2 o'clock
    [2,-1],   //  4 o'clock
    [1,-2],   //  5 o'clock
    [-1,-2],  //  7 o'clock
    [-2,-1],  //  8 o'clock
    [-2,1],   //  10 o'clock
    [-1,2]    //  11 o'clock
  ],
};
var files = ['a','b','c','d','e','f','g','h'];
var start = {
  file: ['R','N','B','Q','K','B','N','R'],
  rank: [1,8]
};

var paths = {
  R: movements.straight,
  B: movements.diagonal,
  N: movements.l_shaped,
  Q: movements.straight.concat(movements.diagonal),
  K: movements.straight.concat(movements.diagonal)
}

function getPrev(team, man, file, rank) {
  var start = [

  ];
  console.log(team, man, file, rank);
}

function parseCastling(move, team) {
  var teams = [{
      '0-0':   [['e1','g1'],['h1','f1']],
      '0-0-0': [['e1','c1'],['a1','d1']]
    },{
      '0-0':   [['e8','g8'],['h8','f8']],
      '0-0-0': [['e8','c8'],['a8','d8']]
    }],
    coord = teams[team][move];
  if (coord) return coord;
}