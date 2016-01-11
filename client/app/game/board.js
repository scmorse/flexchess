var boardSquareDimen = 66;
var pieceDimen = 56;
var margin = (boardSquareDimen - pieceDimen) / 2;
var darkSquareColor = "green";
var lightSquareColor = "white";

_global.tmp = new ReactiveVar();

Template.board.onRendered(function() {
  this.autorun(function() {
    var template = Template.instance();
    var boardState = FlexChessGame.findOne(template.data.gameId).initialBoard;
    var emitter = template.data.emitter || new EventEmitter();
    if (boardState.length !== 7) {
      tmp.get();
    }
    if (!boardState || !boardState.length) {
      return;
    }

    function boardNumCols() {
      return boardState[0].length;
    }

    function boardNumRows() {
      return boardState.length;
    }


    var s = Snap(template.find("svg.board"))
    .attr({
      width: boardNumCols() * boardSquareDimen,
      height: boardNumRows() * boardSquareDimen,
    });
    s.clear();

    // Draw board squares
    _.each(boardState, function(row, rowIndex) {
      _.each(row, function(cell, colIndex) {
        var emit = function() {
          emitter.emit('click_cell', cell, rowIndex, colIndex);
        };

        var rect = s.rect(colIndex*boardSquareDimen, rowIndex*boardSquareDimen, boardSquareDimen, boardSquareDimen)
        .attr({
          fill: (rowIndex + colIndex) % 2 === 0 ? lightSquareColor : darkSquareColor
        })
        .click(emit);

        if (cell.piece) {
          var pieceColor = cell.playerIndex === 0 ? 'w' : 'b';
          var pieceCharId = cell.piece.toLowerCase();
          Snap.load('/pieces/regular/' + pieceColor + pieceCharId + '.svg', function(res) {
            var svg = res.select('svg');
            svg.attr({
              x: colIndex*boardSquareDimen + margin,
              y: rowIndex*boardSquareDimen + margin,
              width: pieceDimen,
              height: pieceDimen
            });
            svg.click(emit);
            s.append(svg);
          });
        }
      });
    });

    // Draw the border around the board
    s.rect(0, 0, boardNumCols() * boardSquareDimen, boardNumRows() * boardSquareDimen).attr({
      fill: "none",
      stroke: "#000000",
      strokeWidth: 2
    });

  });

});