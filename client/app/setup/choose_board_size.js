"use strict";

var maxCols = 10;
var maxRows = 10;

Template.choose_board_size.helpers({
  hoverSelectedWidth: function() {
    return Template.instance().hoverSelectedWidth.get();
  },
  hoverSelectedHeight: function() {
    return Template.instance().hoverSelectedHeight.get();
  },
  maxCols: maxCols,
  maxRows: maxRows
});

function adjustHoverSelectedVars(event, template) {
  template.hoverSelectedWidth.set($(event.target).index() + 1);
  template.hoverSelectedHeight.set($(event.target).closest('tr').index() + 1);
}

Template.choose_board_size.events({
  "mouseenter table.choose-board-size td": adjustHoverSelectedVars,
  "click table.choose-board-size td": function(event) {
    adjustHoverSelectedVars(event);
    // Router.go('');
  }
});

Template.choose_board_size.onCreated(function() {
  this.hoverSelectedWidth = new ReactiveVar(0);
  this.hoverSelectedHeight = new ReactiveVar(0);
});

Template.choose_board_size.onRendered(function() {
  var template = this;

  this.autorun(function() {
    var col = template.hoverSelectedWidth.get();
    var row = template.hoverSelectedHeight.get();

    $('table.choose-board-size tr').each(function(rowIndex) {
      $('td', this).each(function(colIndex) {
        if (rowIndex < row && colIndex < col) {
          $(this).addClass('selected');
        } else {
          $(this).removeClass('selected');
        }
      });
    });
  });
});