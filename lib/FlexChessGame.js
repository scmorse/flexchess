"use strict";

/*

{
  _id: ...,
  players: [
    userId1,
    userId2
  ],
  initialBoard: [
    [{ piece: 'R', 'playerIndex': 0}, { piece: 'N', 'playerIndex': 0}, ... ],
    [{ piece: 'p', 'playerIndex': 0}, 'p', 'p', ... ],
    ...
  ],
  moves: [{
    source: {
      rank: 4,
      file: 0
    },
    destination: {
      rank: 5,
      file: 0
    }
  }, ... ]
}

*/

var FlexChessGame = _global.FlexChessGame = new Mongo.Collection('game');

// Adding names to each helper makes following stack traces easier
FlexChessGame.helpers({

  inBoardRange: function(r, c) {

  },

  currentBoardState: function() {

  },

  toString: function FlexChessGame_toString() {
    console.log(this.initialBoard);
    return "";
  },

});

FlexChessGame.createGame = function(width, heigth) {

};

FlexChessGame.allow({});

FlexChessGame.deny({});