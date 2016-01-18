// Write your package code here!

if (Meteor.isServer) {
  _ = Meteor.npmRequire("lodash");
}

////////////////////////////////////////////////////////////////////

Board = function(rawBoard) {
  this._rawBoard = rawBoard;
};

Board.prototype.isValidRow = function(rowIndex) {
  return 0 <= rowIndex && rowIndex < this._rawBoard.length;
};

Board.prototype.isValidCol = function(colIndex) {
  return 0 <= colIndex && colIndex < this._rawBoard[0].length;
};

Board.prototype.isOnBoard = function(rowIndex, colIndex) {
  return this.isValidRow(rowIndex) && this.isValidCol(colIndex);
};

Board.prototype.playerAt = function(rowIndex, colIndex) {
  if (!this.isOnBoard(rowIndex, colIndex)) {
    throw new Error('Off board');
  }

  return this._rawBoard[rowIndex][colIndex].playerIndex;
};

Board.prototype.rawPieceAt = function(rowIndex, colIndex) {
  if (!this.isOnBoard(rowIndex, colIndex)) {
    throw new Error('Off board');
  }

  return this._rawBoard[rowIndex][colIndex];
};

Board.prototype.pieceAt = function(rowIndex, colIndex) {
  if (!this.isOnBoard(rowIndex, colIndex)) {
    throw new Error('Off board');
  }

  return Piece.fromBoard(this, rowIndex, colIndex);
};



////////////////////////////////////////////////////////////////////

var MoveTypes = {
  BASIC: 'basic',
  CASTLE: 'castle',
  PROMOTION: 'promotion'
};

Move = function(objMove) {
  this._objMove = objMove || {};
  this._type = this._objMove.type || MoveTypes.BASIC;
};

Move.prototype.isBasic = function() {
  return this._type === MoveTypes.BASIC;
};

Move.prototype.isCastle = function() {
  return this._type === MoveTypes.CASTLE;
};

Move.prototype.isPromotion = function() {
  return this._type === MoveTypes.PROMOTION;
};

Move.prototype.reset = function() {
  this._objMove = {};
  this._type = MoveTypes.BASIC;
};

Move.prototype.setFrom = function(rowIndex, colIndex) {
  this.reset();
  this._objMove.source = {
    row: rowIndex,
    col: colIndex
  };
  return this;
};

Move.prototype.setTo = function(rowIndex, colIndex) {
  this._objMove.destination = {
    row: rowIndex,
    col: colIndex
  };
  return this;
};

Move.prototype.getDestinations = function() {
  var dests = [];
  if (this.isBasic()) {
    dests.push({
      rowIndex: this._objMove.destination.row,
      colIndex: this._objMove.destination.col
    });
  }
  return dests;
};

Move.prototype.toString = function() {
  var source = this._objMove.source;
  var destination = this._objMove.destination;
  return "(" + source.row + ", " + source.col + ") -> (" + destination.row + ", " + destination.col + ")";
};

Move.prototype.getDatabaseRepresentation = function() {
  if (!this._objMove || !this._objMove.source || !this._objMove.destination) {
    throw new Error('Attempting to push incomplete move');
  }
  return this._objMove;
};

////////////////////////////////////////////////////////////////////

Piece = function(board, locRow, locCol) {
  this._board = board;
  this._row = locRow;
  this._col = locCol;
};

Piece.prototype.playerIndex = function() {
  return this._board.playerAt(this._row, this._col);
};

Piece.prototype.row = function() {
  return this._row;
};

Piece.prototype.col = function() {
  return this._col;
};

Piece.prototype.hasMoved = function() {
  // TODO
  return true;
};

Piece.fromBoard = function(board, rowIndex, colIndex) {
  var rawPiece = board.rawPieceAt(rowIndex, colIndex);

  if (rawPiece.piece) {
    switch (rawPiece.piece) {
    case King.pieceId:
      return new King(board, rowIndex, colIndex);
    case Queen.pieceId:
      return new Queen(board, rowIndex, colIndex);
    case Rook.pieceId:
      return new Rook(board, rowIndex, colIndex);
    case Bishop.pieceId:
      return new Bishop(board, rowIndex, colIndex);
    case Knight.pieceId:
      return new Knight(board, rowIndex, colIndex);
    case Pawn.pieceId:
      return new Pawn(board, rowIndex, colIndex);
    }
  }

  return null;
};

var _linearMoves = function(piece, arrMoveOpts) {
  var moves = [];
  var board = piece._board;

  _.each(arrMoveOpts, function(moveOpts) {
    var rowDelta = moveOpts.rowDelta;
    var colDelta = moveOpts.colDelta;
    var limitSet = moveOpts.limit !== undefined;
    var limit = moveOpts.limit;

    var destRow = piece.row();
    var destCol = piece.col();
    while (!limitSet || limit > 0) {
      limit--;
      destRow += rowDelta;
      destCol += colDelta;
      if (board.isOnBoard(destRow, destCol)) {
        var destinationPlayer = board.playerAt(destRow, destCol);
        var sourcePlayer = piece.playerIndex();
        var addMove =
          moveOpts.onlyAttacks ? (destinationPlayer !== undefined && sourcePlayer !== destinationPlayer) :
          (moveOpts.noAttacks ? (destinationPlayer === undefined) :
          (sourcePlayer !== destinationPlayer));
        if (addMove) {
          var move = new Move();
          move.setFrom(piece.row(), piece.col());
          move.setTo(destRow, destCol);
          moves.push(move);
        }
        if (destinationPlayer !== undefined) {
          break;
        }
      } else {
        break;
      }
    }
  });

  return moves;
};

////////////////////////////////////////////////////////////////////

King = function(board, locRow, locCol) {
  Piece.apply(this, _.toArray(arguments));
};
Queen = function(board, locRow, locCol) {
  Piece.apply(this, _.toArray(arguments));
};
Rook = function(board, locRow, locCol) {
  Piece.apply(this, _.toArray(arguments));
};
Bishop = function(board, locRow, locCol) {
  Piece.apply(this, _.toArray(arguments));
};
Knight = function(board, locRow, locCol) {
  Piece.apply(this, _.toArray(arguments));
};
Pawn = function(board, locRow, locCol) {
  Piece.apply(this, _.toArray(arguments));
};

_.each([King, Queen, Rook, Bishop, Knight, Pawn], function(childConstructor) {
  childConstructor.prototype = _.create(Piece.prototype, {
    constructor: childConstructor
  });
});

////////////////////////////////////////////////////////////////////

King.prototype.pieceId = 'K';
King.pieceId = 'K';

King.prototype.basicMoves = function() {
  return _linearMoves(this, [
    { rowDelta:  0, colDelta:  1, limit: 1 },
    { rowDelta:  0, colDelta: -1, limit: 1 },
    { rowDelta:  1, colDelta:  0, limit: 1 },
    { rowDelta: -1, colDelta:  0, limit: 1 },
    { rowDelta:  1, colDelta:  1, limit: 1 },
    { rowDelta:  1, colDelta: -1, limit: 1 },
    { rowDelta: -1, colDelta:  1, limit: 1 },
    { rowDelta: -1, colDelta: -1, limit: 1 }
  ]);
};

////////////////////////////////////////////////////////////////////

Queen.prototype.pieceId = 'Q';
Queen.pieceId = 'Q';

Queen.prototype.basicMoves = function() {
  return _linearMoves(this, [
    { rowDelta:  0, colDelta:  1 },
    { rowDelta:  0, colDelta: -1 },
    { rowDelta:  1, colDelta:  0 },
    { rowDelta: -1, colDelta:  0 },
    { rowDelta:  1, colDelta:  1 },
    { rowDelta:  1, colDelta: -1 },
    { rowDelta: -1, colDelta:  1 },
    { rowDelta: -1, colDelta: -1 }
  ]);
};

////////////////////////////////////////////////////////////////////

Rook.prototype.pieceId = 'R';
Rook.pieceId = 'R';

Rook.prototype.basicMoves = function() {
  return _linearMoves(this, [
    { rowDelta:  0, colDelta:  1 },
    { rowDelta:  0, colDelta: -1 },
    { rowDelta:  1, colDelta:  0 },
    { rowDelta: -1, colDelta:  0 }
  ]);
};

////////////////////////////////////////////////////////////////////

Bishop.prototype.pieceId = 'B';
Bishop.pieceId = 'B';

Bishop.prototype.basicMoves = function() {
  return _linearMoves(this, [
    { rowDelta:  1, colDelta:  1 },
    { rowDelta:  1, colDelta: -1 },
    { rowDelta: -1, colDelta:  1 },
    { rowDelta: -1, colDelta: -1 }
  ]);
};


////////////////////////////////////////////////////////////////////

Knight.prototype.pieceId = 'N';
Knight.pieceId = 'N';

Knight.prototype.basicMoves = function() {
  return _linearMoves(this, [
    { rowDelta:  1, colDelta:  2, limit: 1 },
    { rowDelta:  1, colDelta: -2, limit: 1 },
    { rowDelta: -1, colDelta:  2, limit: 1 },
    { rowDelta: -1, colDelta: -2, limit: 1 },
    { rowDelta:  2, colDelta:  1, limit: 1 },
    { rowDelta:  2, colDelta: -1, limit: 1 },
    { rowDelta: -2, colDelta:  1, limit: 1 },
    { rowDelta: -2, colDelta: -1, limit: 1 },
  ]);
};

////////////////////////////////////////////////////////////////////

Pawn.prototype.pieceId = 'P';
Pawn.pieceId = 'P';

Pawn.prototype.direction = function() {
  // TODO
  return { rowDelta: -1, colDelta: 0 };
};

Pawn.prototype.basicMoves = function() {
  var direction = this.direction();

  var moveOpts = _.clone(direction);
  moveOpts.limit = this.hasMoved() ? 1 : 2;
  moveOpts.noAttacks = true;
  var moves = _linearMoves(this, [ moveOpts ]);

  moveOpts = _.clone(direction);
  moveOpts.limit = 1;
  moveOpts.onlyAttacks = true;
  moveOpts[direction.rowDelta === 0 ? 'rowDelta' : 'colDelta'] = 1;
  Array.prototype.push.apply(moves, _linearMoves(this, [ moveOpts ]));
  moveOpts[direction.rowDelta === 0 ? 'rowDelta' : 'colDelta'] = -1;
  Array.prototype.push.apply(moves, _linearMoves(this, [ moveOpts ]));

  return moves;
};


