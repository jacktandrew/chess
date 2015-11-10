'use strict';

var chess = window.chess = window.chess || {},
	boardEl = document.querySelector('.board'),
  board = chess.board = new chess.Board();

chess.team = {};

var white = chess.team.white = new chess.Pieces('white'),
  black = chess.team.black = new chess.Pieces('black');

chess.setup.init(board, boardEl, white, black);

chess.game = new chess.Game(board);

chess.ui.init();
