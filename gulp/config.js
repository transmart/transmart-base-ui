
var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var ngConstant = require('gulp-ng-constant');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

gulp.task('config', function () {
  var config = require(path.join('..', conf.paths.src, 'app', 'config.json'));
  var environment = gutil.env.env ? gutil.env.env : 'dev';
  return ngConstant({
    name: "transmartBaseUi",
    constants: config[environment],
    deps: false,
    stream: true
  })
    .pipe(rename('config.js'))
    .pipe(gulp.dest(path.join(conf.paths.src, 'app')));
});

