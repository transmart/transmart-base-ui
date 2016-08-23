var gulp = require('gulp');
var git = require('git-rev-sync');
var file = require('gulp-file');
var conf = require('./conf');

gulp.task('git-helper', function () {
    var info = {};
    info.short = git.short();
    info.long = git.long();
    info.branch = git.branch();
    info.tag = git.tag();
    info.message = git.message();
    var str = JSON.stringify(info);

    return file('info.json', str, {src: true})
        .pipe(gulp.dest(conf.paths.src + '/app/containers/help/'));
});
