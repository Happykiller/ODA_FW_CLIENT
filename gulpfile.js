/* jshint node:true */

'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var stylish = require('jshint-stylish');

var elts = {
    oda : "dist/Oda.js"
};

/**
 * Compress
 * For build the Oda.min.js
 */
gulp.task('compress', function() {
    gulp.src(elts.oda)
        .pipe(uglify({mangle: false}))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist/'));
    return;
});

/**
 * JsHint
 * Validate js script
 */
gulp.task('jshint', function() {
    return gulp.src([elts.oda])
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', ['jshint'], function() {
    gulp.watch(elts.oda, ['jshint']);

    gulp.watch(elts.oda, ['compress']);

    return;
});