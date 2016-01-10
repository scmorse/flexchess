

Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function(){
  this.route('/', function(){
    Router.go('choose_board_size');
  });

  this.route('/setup', {
    name: 'choose_board_size',
    template: 'choose_board_size'
  });
});