

Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function(){

  this.route('/', function(){
    Router.go('choose_board_size');
  });

  this.route('/setup-board', {
    name: 'choose_board_size',
    template: 'choose_board_size'
  });

  this.route('/setup-pieces', {
    name: 'arrange_pieces',
    template: 'arrange_pieces'
  });

  this.route('/game/:gameId', {
    name: 'flexgame',
    template: 'flexgame'
  });

});