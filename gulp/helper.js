'use strict';

var gulp = require('gulp');
var git = require('git-rev-sync');
var ngConstant = require('gulp-ng-constant');
var rename = require('gulp-rename');
var conf = require('./conf');

/**
 * This task generates the angular constant for storing
 * the github project info that the application is currently running
 */
gulp.task('helper', function () {
    var info = {};
    info.short = git.short();
    info.long = git.long();
    info.branch = git.branch();
    info.tag = git.tag();
    info.message = git.message();
    info.url = "https://github.com/thehyve/transmart-base-ui/commit/" + info.long;
    info.count = git.count();
    var obj = {
        gitInfo: info
    }

    return ngConstant({
        name: "transmartBaseUiGitConstants",
        constants: obj,
        stream: true
    })
        .pipe(rename('help.constant.js'))
        .pipe(gulp.dest(conf.paths.src + '/app/containers/help/'));
});
