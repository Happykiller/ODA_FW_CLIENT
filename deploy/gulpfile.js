/* jshint node:true */

'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var launch = require('gulp-open');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var gulp = require('gulp-param')(require('gulp'), process.argv);

var OdaGulpConfig = {
    "vendorName" : "bower_components"
};

gulp.task('params', function(vendorName) {
    if(vendorName !== null){
        OdaGulpConfig.vendorName = vendorName;
    }
    return;
});

//ex : gulp install-full --vendorName libs
gulp.task('install-full', ['params'], function() {
    gulp.src(['full/index.html'])
        .pipe(replace(/vendor/g, OdaGulpConfig.vendorName))
        .pipe(gulp.dest('./../../../'));
    return;
});