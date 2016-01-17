var boardSquareDimen = 66;
var pieceDimen = 56;
var margin = (boardSquareDimen - pieceDimen) / 2;
var darkSquareColor = "green";
var lightSquareColor = "white";

var defaultCellColor = function(rowIndex, colIndex) {
  return (rowIndex + colIndex) % 2 === 0 ? lightSquareColor : darkSquareColor;
};

Template.board.onRendered(function() {
  var template = Template.instance();

  var game = FlexChessGame.findOne(template.data.gameId);
  var boardNumRows = game.numRows();
  var boardNumCols = game.numCols();

  var emitter = template.data.emitter || new EventEmitter();

  if (!boardNumRows || !boardNumCols) {
    return;
  }

  var s = Snap(template.find("svg.board"))
  .attr({
    width: boardNumCols * boardSquareDimen,
    height: boardNumRows * boardSquareDimen,
  });
  s.clear();

  var boardSvgElements = _.range(boardNumRows).map(function(rowIndex){
    return _.range(boardNumCols).map(function(colIndex) {
      return {
        rect: s.rect(colIndex*boardSquareDimen, rowIndex*boardSquareDimen, boardSquareDimen, boardSquareDimen)
        .attr({
          fill: defaultCellColor(rowIndex, colIndex)
        })
      };
    });
  });

  emitter.on('select', function(rowIndex, colIndex) {
    boardSvgElements[rowIndex][colIndex].rect.attr({
      fill: "yellow"
    });
  });

  emitter.on('deselect_all', function(rowIndex, colIndex) {
    _.each(boardSvgElements, function(row, rowIndex) {
      _.each(row, function(cell, colIndex) {
        boardSvgElements[rowIndex][colIndex].rect.attr({
          fill: defaultCellColor(rowIndex, colIndex)
        });
      });
    });
  });

  _.times(boardNumRows, function(rowIndex) {
    _.times(boardNumCols, function(colIndex) {
      template.autorun(function() {
        // Reactive to only the cell at the designated location
        var cellAtRowCol = FlexChessGame.findCellAt(game._id, rowIndex, colIndex);

        var emitClickCell = function() {
          emitter.emit('click_cell', cellAtRowCol, rowIndex, colIndex);
        };

        var previousDrawPiece = boardSvgElements[rowIndex][colIndex].pieceGraphic;
        if (previousDrawPiece) {
          previousDrawPiece.clear();
        }

        // Draw board squares
        if (cellAtRowCol.piece) {
          var pieceColor = cellAtRowCol.playerIndex === 0 ? 'w' : 'b';
          var pieceCharId = cellAtRowCol.piece.toLowerCase();
          Snap.load('/pieces/regular/' + pieceColor + pieceCharId + '.svg', function(res) {
            var svg = res.select('svg');
            svg.attr({
              x: colIndex*boardSquareDimen + margin,
              y: rowIndex*boardSquareDimen + margin,
              width: pieceDimen,
              height: pieceDimen
            });
            svg.click(emitClickCell);
            s.append(svg);

            boardSvgElements[rowIndex][colIndex].pieceGraphic = svg;
          });
        }

        boardSvgElements[rowIndex][colIndex].rect
        .unclick() // Remove the old handler
        .click(emitClickCell);
      });
    });
  });

  // Draw the border around the board
  s.rect(0, 0, boardNumCols * boardSquareDimen, boardNumRows * boardSquareDimen).attr({
    fill: "none",
    stroke: "#000000",
    strokeWidth: 2
  });

});