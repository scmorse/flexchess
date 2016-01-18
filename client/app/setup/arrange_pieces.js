
Template.arrange_pieces.events({

  'click [data-action="continue"]': function(event, template) {
    // TODO assess that board is valid
    Router.go('flexgame', { gameId: template.gameId });
  }

});

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
      gameId: "C8dorqfcz4kNyYtg4",
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

  template.gameId = FlexChessGame.newGame(boardNumCols(), boardNumRows());
  console.log(template.gameId);

  template.gameEmitter = new EventEmitter();
  template.gameEmitter.on('click_cell', function(piece, rowIndex, colIndex) {
    // put selected piece into board
    var insertPiece = template.selectedPiece;
    if (insertPiece) {
      FlexChessGame.updateInitialBoardCellAt(template.gameId, rowIndex, colIndex, insertPiece);
    }
  });

  template.pieceSelectionEmitter = new EventEmitter();
  template.selectedPiece = null;
  template.pieceSelectionEmitter.on('click_cell', function(piece, rowIndex, colIndex) {
    // set selected piece
    template.selectedPiece = piece;
    template.pieceSelectionEmitter.emit('deselect_all');
    template.pieceSelectionEmitter.emit('select', rowIndex, colIndex);
  });
});

Template.arrange_pieces.onDestroyed(function() {
  // console.log('calling remove');
  // FlexChessGame.remove(this.gameId);
});