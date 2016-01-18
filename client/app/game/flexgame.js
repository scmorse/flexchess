
var gameId = function() {
  return Router.current().params.gameId;
};

Template.flexgame.helpers({
  gameBoard: function() {
    var template = Template.instance();
    return {
      gameId: gameId(),
      emitter: template.emitter
    };
  },
});

Template.flexgame.onCreated(function() {
  if (!gameId()) {
    Router.go('choose_board_size');
  }

  var template = this;

  template.subscribe('games');

  template.emitter = new EventEmitter();

  template.emitter.on('click_cell', function(rawPiece, rowIndex, colIndex) {
    template.emitter.emit('reset_all_cells');

    var pushedNewMove = false;
    if (template.workingMove && template.workingMove.allowedMoves) {
      pushedNewMove = !!(_.find(template.workingMove.allowedMoves, function(move) {
        var dests = move.getDestinations();
        for (var i = 0; i < dests.length; i++) {
          if (dests[i].rowIndex === rowIndex && dests[i].colIndex === colIndex) {
            FlexChessGame.updatePushMove(gameId(), move);
            return true;
          }
        }
      }));
      template.workingMove = undefined;
    }

    if (!pushedNewMove) {
      template.workingMove = new Move();
      template.workingMove.setFrom(rowIndex, colIndex);

      var board = FlexChessGame.findOne(gameId()).boardState();
      var piece = board.pieceAt(rowIndex, colIndex);
      template.workingMove.allowedMoves = piece ? piece.basicMoves() : undefined;
      if (template.workingMove.allowedMoves) {
        _.each(template.workingMove.allowedMoves, function(move) {
          var dests = move.getDestinations();
          for (var i = 0; i < dests.length; i++) {
            template.emitter.emit('outline', dests[i].rowIndex, dests[i].colIndex);
          }
        });
      }
    }

  });
});