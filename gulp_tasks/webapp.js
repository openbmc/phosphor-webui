/*eslint-env node */
/*global require: true, module: true */

'use strict';

var options = require('../gulp-options.js'),
    gulp = require('gulp'),

    // Base dependencies
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    util = require('gulp-util'),

    // Angular gulp dependencies
    ngTemplateCache = require('gulp-angular-templatecache'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngConstant = require('gulp-ng-constant'),

    // Classical gulp dependencies
    stripDebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    cleanCss = require('gulp-clean-css'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    gulpIf = require('gulp-if'),
    useref = require('gulp-useref'),
    jsoncombine = require('gulp-jsoncombine'),
    htmlParser = require('gulp-htmlparser');


var runSequence = require('run-sequence'),
    es = require('event-stream');

gulp.task('webapp:clean', function () {
    return gulp
        .src([options.targetFolderPath + '/webapp', options.dirname + '/.temp'], { 'read': false })
        .pipe(clean({'force': true}));
});

gulp.task('webapp:sasscompile', function () {
    return gulp
        .src('app/styles/index.scss')
        .pipe(sass.sync().on('error', util.log))
        .pipe(gulp.dest(options.srcFolderPath + '/styles'))
});

// ----- To .temp from app
gulp.task('webapp:copyjs', function () {
    return gulp.src(options.srcFolderPath + '/**/*.js')
        .pipe(ngAnnotate()) // Check angular dependencies injection
        .pipe(stripDebug()) // Remove all logs
        .pipe(uglify({ 'mangle': false }))
        .pipe(gulp.dest(options.dirname + '/.temp'));
});

gulp.task('webapp:copyothers', function () {
    return gulp.src(['**/*', '!**/*.js', '!**/*.css', '!**/*.scss'], { 'cwd': options.srcFolderPath }) // All except JS files
        .pipe(gulp.dest(options.tempFolderPath));
});

gulp.task('webapp:copycss', function () {
    return gulp
        .src('app/styles/index.css')
        .pipe(cleanCss())
        .pipe(gulp.dest(options.tempFolderPath + '/styles'));
});

gulp.task('webapp:constants', function () {
    return gulp
        .src('environment-constants.json')
        .pipe(ngConstant({
            'name': 'app.constants',
            'deps': false
        }))
        .pipe(rename('environment-constants.js'))
        .pipe(gulp.dest(options.tempFolderPath + '/constants'));
});

// ----- To target/webapp from .temp and bower_components
gulp.task('webapp:template', function () {
    return gulp.src([options.srcFolderPath + '/**/*.html', '!' + options.srcFolderPath + '/index.html'])
        .pipe(ngTemplateCache('templates.js', {
            'module': 'app.templates',
            'standalone': true
        }))
        .pipe(gulp.dest(options.tempFolderPath));
});

gulp.task('webapp:useref', function () {
    var tasks = ['index.html'].map(function (indexPage) {
        var assets = useref.assets({ });

        return gulp.src(options.tempFolderPath + '/' + indexPage)
            .pipe(assets)
            .pipe(assets.restore())
            .pipe(useref())
            .pipe(revReplace()) // Force useref to apply the 'rev' method
            .pipe(gulp.dest(options.targetFolderPath + '/webapp'));
    });

    return es.concat.apply(null, tasks);
});

gulp.task('webapp:copyresources', function () {
    return gulp.src(['**/*.*', '!**/*.js', '!**/*.css', '!**/*.html', '!**/*.log'], { 'cwd': options.tempFolderPath })
        .pipe(gulp.dest(options.targetFolderPath + '/webapp'));
});

module.exports = function (callback) {
    return runSequence(
        'webapp:clean',
        'webapp:sasscompile',
        [
            'webapp:copyjs',
            'webapp:copycss',
            'webapp:copyothers'
        ],
        [
            'webapp:constants',
            'webapp:template'
        ],
        [
            'webapp:useref'
        ],
        [
            'webapp:copyresources'
        ],
        callback
    );
};
