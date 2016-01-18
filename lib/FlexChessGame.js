"use strict";

/*

Terminology:
 - Game is whole object
 - Board is initialBoard/currentBoard transformed to array
 - Cell is object in board
 - piece is string for type of piece

Note that boards are stored as objects so that we may fetch a cursor for
a single cell, as Minimongo doesn't yet have support for doing a find on a single
array element. (Would be happy to be proven wrong, but as far as I can tell that is true)

{
  _id: ...,
  players: [
    userId1,
    userId2
  ],
  initialBoard: {
    numRows: 8,
    numCols: 8,
    '0_0': { piece: 'R', 'playerIndex': 0 },
    '0_1': { piece: 'N', 'playerIndex': 0 },
    ...
  }
  currentBoard: {
    '0_0': { piece: 'R', 'playerIndex': 0 },
    '0_1': { piece: 'N', 'playerIndex': 0 },
    ...
  },
  moves: [{
    type: 'basic',
    source: {
      row: 4,
      col: 0
    },
    destination: {
      row: 5,
      col: 0
    }
  }, ... ]
}

*/
var SEP = "_";
var FlexChessGame = _global.FlexChessGame = new Mongo.Collection('game');

FlexChessGame.helpers({

  numRows: function() {
    var board = this.initialBoard;
    return board && board.numRows;
  },

  numCols: function() {
    var board = this.initialBoard;
    return board && board.numCols;
  },

  inBoardRange: function(r, c) {
    return 0 <= r && r < this.numRows() && 0 <= c && c < this.numCols();
  },

  boardState: function(currentBoard) {
    var numRows = this.numRows();
    var numCols = this.numCols();
    currentBoard = currentBoard || this.currentBoard;
    var rawBoard = _.range(numRows).map(function(rowIndex) {
      return _.range(numCols).map(function(colIndex) {
        return currentBoard[rowIndex + SEP + colIndex];
      });
    });
    return new Board(rawBoard);
  },

  initialBoardState: function() {
    return this.boardState(this.initialBoard);
  },

  toString: function() {
    return "";
  },

});

FlexChessGame.after.update(function(userId, doc, fieldNames, modifier, options){
  // Update the current board whenever the moves or initialBoard change
  var needToUpdateCurrentBoard = (fieldNames.indexOf('moves') >= 0) || (fieldNames.indexOf('initialBoard') >= 0);
  if (needToUpdateCurrentBoard) {
    var newBoard = doc.initialBoard; // Copy initialBoard to start
    _.each(doc.moves, function(move) {
      newBoard[move.destination.row + SEP + move.destination.col] = newBoard[move.source.row + SEP + move.source.col];
      newBoard[move.source.row + SEP + move.source.col] = {};
    });
    var updateModifier = { $set: {} };
    _.times(newBoard.numRows, function(rowIndex) {
      _.times(newBoard.numCols, function(colIndex) {
        var oldPiece = doc.currentBoard[rowIndex + SEP + colIndex];
        var newPiece = newBoard[rowIndex + SEP + colIndex];
        if (oldPiece.piece !== newPiece.piece || oldPiece.playerIndex !== newPiece.playerIndex) {
          updateModifier.$set['currentBoard.' + rowIndex + SEP + colIndex] = newPiece;
        }
      });
    });
    if (Object.keys(updateModifier.$set).length) {
      FlexChessGame.update({ _id: doc._id }, updateModifier);
    }
  }
}, { fetchPrevious: false });

FlexChessGame.newGame = function(width, height) {

  var newBoard = function() {
    var board = { numRows: height, numCols: width };
    _.times(height, function(rowIndex) {
      _.times(width, function(colIndex) {
        board[rowIndex + SEP + colIndex] = {};
      });
    });
    return board;
  };

  var doc = {
    players: [],
    initialBoard: newBoard(),
    currentBoard: newBoard(),
    moves: []
  };
  return FlexChessGame.insert(doc);
};

FlexChessGame.findCellAt = function(gameId, rowIndex, colIndex) {
  var findOpts = { fields: {} };
  var positionKey = rowIndex + SEP +colIndex;
  findOpts.fields["currentBoard." + positionKey] = 1;
  var game = FlexChessGame.findOne({ _id: gameId }, findOpts);
  if (game) {
    return game.currentBoard[positionKey];
  }
};

FlexChessGame.updateInitialBoardCellAt = function(gameId, rowIndex, colIndex, updatedCell) {
  var set = { $set: {} };
  set.$set['initialBoard.' + rowIndex + '_' + colIndex] = updatedCell;
  FlexChessGame.update({ _id: gameId }, set);
};

FlexChessGame.updatePushMove = function(gameId, move) {
  FlexChessGame.update({ _id: gameId }, { $push: { moves: move.getDatabaseRepresentation() } });
};

if (Meteor.isServer) {
    Meteor.publish('games', function(){
      return FlexChessGame.find({});
    });
}

// FlexChessGame.allow({});

// FlexChessGame.deny({});
