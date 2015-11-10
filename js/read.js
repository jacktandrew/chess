'use strict';

var chess = window.chess = window.chess || {};

chess.read = {
	counter: 0,
	moves: [
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