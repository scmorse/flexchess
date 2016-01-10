Template.registerHelper('loopCount', function(count) {
  return Array.apply(null, {length: count}).map(Number.call, Number);
});