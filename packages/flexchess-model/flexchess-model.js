// Write your package code here!

if (Meteor.isServer) {
  _ = Meteor.npmRequire("lodash");
}

var Knight = function(game, locRow, locCol){
  this._game = game;
  var piece = this._game[locRow][locCol];
  if (!piece || piece.piece === 'N') {
    throw new Error('No night at board location');
  }
};

Knight.prototype.moves = function() {

};