"use strict";

Template.mobile_nav.events({
  'click label[for="nav-trigger"]': function() {
    var newChecked = !$('.nav-trigger').prop('checked');
    $('.nav-trigger').prop('checked', newChecked);
    $('.site-wrap').css('left', newChecked ? '200px' : '0px');
    $('.site-wrap').css('box-shadow', newChecked ? '0 0 5px 5px rgba(0,0,0,0.5)' : '');
  }
});

