/*eslint-env node */
/*global require: true, module: true */

'use strict';

var options = require('../gulp-options.js'),
    gulp = require('gulp'),
    clean = require('gulp-clean'),
    webapp = require('./webapp.js'),
    imagemin = require('gulp-imagemin');

var runSequence = require('run-sequence');

gulp.task('webapp', function (callback) {
    return webapp(callback);
});

gulp.task('distribution:clean', function () {
    return gulp
        .src([options.dirname + '/dist'], { 'read': false })
        .pipe(clean({'force': true}));
});

gulp.task('distribution:copy', function () {
    return gulp
        .src(['**/*'], { 'cwd': options.targetFolderPath + '/webapp' })
        .pipe(gulp.dest(options.dirname + '/dist'));
});

gulp.task('imagemin', () =>
    gulp.src([options.dirname + '/app/assets/images/*'])
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: false,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(gulp.dest('dist/assets/images'))
);

module.exports = function (callback) {
    return runSequence('distribution:clean', 'webapp', 'distribution:copy', 'imagemin', callback);
};
