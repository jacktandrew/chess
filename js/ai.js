'use strict';

var chess = window.chess = window.chess || {};

chess.ai = {
	counter: 0,
	white: [
		['e2', 'e4'],
		['f1', 'c4'],
		['d1', 'h5'],
	],
	black: [
		['e7', 'e5'],
		['b8', 'c6'],
		['g8', 'h6'],
		['a7', 'a6'],
	],
	play: function() {
		this.white.forEach(function(move, i) {
			var white = chess.ai.getSquares('white', i),
				black = chess.ai.getSquares('black', i);
			chess.ai.move(white);
			chess.ai.move(black);
		});
	},
	getSquares: function(team, i) {
		return this[team][i].map(function(coord) {
			return chess.board[coord];
		});
	},
	move: function(coords) {
		chess.game.movePiece(coords[0], coords[1]);
	}
};