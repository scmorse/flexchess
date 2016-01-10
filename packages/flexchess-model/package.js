Package.describe({
  name: 'flexchess-model',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

// Npm.depends({
//   "lodash": "3.10.0"
// });

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  api.use('ecmascript');
  api.use('stevezhu:lodash');

  api.addFiles('flexchess-model.js', ['client', 'server']);
  api.export('Board', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('flexchess-model', ['client', 'server']);
  api.addFiles('flexchess-model-tests.js');
  api.export('Board');
});
