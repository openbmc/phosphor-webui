var options = require('../gulp-options.js'),
    gulp = require('gulp'),
    connect = require('gulp-connect'),
    distribution = require('./distribution.js');

var runSequence = require('run-sequence');

gulp.task('distribution', function (callback) {
    return distribution(callback);
});

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('livereload', function() {
  gulp.src(['./dist/**/*.html','./dist/**/*.js','./dist/**/*.css'])
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('./app/**/*', function(callback){
    return runSequence('distribution', 'livereload');
  });
});

module.exports = function (callback) {
    return runSequence('connect', 'watch', callback);
};