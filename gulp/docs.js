'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');
var isThere = require("is-there");
var mkdirp = require('mkdirp');
var gutil = require('gulp-util');

gulp.task('prepareDocDirectories', function () {
    var docsDir = 'dist/docs';
    var tutorialsDir = docsDir + '/tutorials';

    if(!isThere(docsDir)) {
        mkdirp(docsDir, function (err) {
            if (err) console.error(err)
            else gutil.log('Create directory ' + docsDir + '...');
        });
    }

    if(!isThere(tutorialsDir)) {
        mkdirp(tutorialsDir, function (err) {
            if (err) console.error(err)
            else gutil.log('Create directory ' + tutorialsDir + '...');
        });
    }

});

gulp.task('docs', ['prepareDocDirectories'], shell.task([
    'node_modules/jsdoc/jsdoc.js '+
    '-c node_modules/angular-jsdoc/common/conf.json '+   // config file
    '-t node_modules/angular-jsdoc/angular-template '+   // template file
    '-d dist/docs '+                          // output directory
    './README.md ' +                          // to include README.md as index contents
    '-r src/app/ ' +                 // source code directory
    '-u dist/docs/tutorials'   // tutorials directory
]));
