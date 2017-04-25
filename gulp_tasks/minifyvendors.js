
/*eslint-env node */
/*global require: true, module: true */

'use strict';

var options = require('../gulp-options.js'),
    gulp = require('gulp'),

    // Base dependencies
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),

    // Classical gulp dependencies
    uglify = require('gulp-uglify');

var runSequence = require('run-sequence');

gulp.task('minifyvendorjs:clean', function () {
  return gulp.src(options.bowerFolderPath + '/**/*.min.js', {read: false})
    .pipe(clean());
});

gulp.task('minifyvendorjs:minify', function () {
    return gulp
        .src(options.bowerFolderPath + '/**/*.js')
        .pipe(uglify({
            preserveComments: 'false'
        })) 
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }))
});

module.exports = function (callback) {
    return runSequence(
    	'minifyvendorjs:clean',
        'minifyvendorjs:minify',
        callback
    );
};