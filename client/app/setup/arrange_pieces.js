
Template.arrange_pieces.helpers({
  gameBoard: function() {
    var template = Template.instance();
    return {
      gameId: template.gameId,
      emitter: template.gameEmitter
    };
  },
  selectPieceTemplate: function() {
    var template = Template.instance();
    return {
      gameId: "BivYwGuKDbo5azMwa",
      emitter: template.pieceSelectionEmitter
    };
  }
});

var boardNumRows = function() {
  var query = Router.current().params.query;
  return query.height && parseInt(query.height);
};

var boardNumCols = function() {
  var query = Router.current().params.query;
  return query.width && parseInt(query.width);
};

Template.arrange_pieces.onCreated(function() {
  if (!boardNumRows() || !boardNumCols()) {
    Router.go('choose_board_size');
  }
  var template = this;

  template.subscribe('games');
  template.subscribe('game_templates');

  template.gameId = FlexChessGame.newGame(boardNumCols(), boardNumRows());

  template.gameEmitter = new EventEmitter();
  template.gameEmitter.on('click_cell', function(piece, rowIndex, colIndex) {
    // put selected piece into board
    var insertPiece = template.selectedPiece;
    if (insertPiece) {
      var set = { $set: {} };
      set.$set['initialBoard.' + rowIndex + '.' + colIndex] = insertPiece;
      // set.$set.initialBoard = [[{}, {}, {}], [{}, {}], [{}]];
      FlexChessGame.update({ _id: template.gameId }, set);
    }
  });

  template.pieceSelectionEmitter = new EventEmitter();
  template.selectedPiece = null;
  template.pieceSelectionEmitter.on('click_cell', function(piece, rowIndex, colIndex) {
    // set selected piece
    template.selectedPiece = piece;
  });
});

Template.arrange_pieces.onDestroyed(function() {
  console.log('removed');
  FlexChessGame.remove(this.gameId);
  console.log('removed');
});