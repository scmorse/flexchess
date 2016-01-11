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
var FlexChessTemplate = _global.FlexChessTemplate = new Mongo.Collection('game_template');

// Adding names to each helper makes following stack traces easier
FlexChessGame.helpers({

  inBoardRange: function(r, c) {

  },

  currentBoardState: function() {
    // TODO
    return this.initialBoard;
  },

  toString: function FlexChessGame_toString() {
    return "";
  },

});

FlexChessGame.newGame = function(width, height) {
  function newRow() {
    return Array.apply(null, new Array(width)).map(function(){ return {}; });
  }

  function newBoard() {
    return Array.apply(null, new Array(height)).map(function(){ return newRow(); });
  }

  var doc = {
    players: [],
    initialBoard: newBoard(),
    moves: []
  };
  return FlexChessGame.insert(doc);
};

if (Meteor.isServer) {
    Meteor.publish('games', function(){
      return FlexChessGame.find({});
    });

    Meteor.publish('game_templates', function(){
      return FlexChessTemplate.find({});
    });
}

// FlexChessGame.allow({});

// FlexChessGame.deny({});
