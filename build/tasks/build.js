'use strict';

var gulp = require('gulp');
var sourceMaps = require('gulp-sourcemaps');
var tsc = require('gulp-typescript');
var gulpConfig = require('./../gulp-config');
var ncp = require('ncp').ncp;
var path = require('path');
var fs = require('fs');

gulp.task('transpile', function () {
    var tsResult = gulp
        .src(gulpConfig.allTypescript, {
            base: '.'
        })
        .pipe(sourceMaps.init())
        .pipe(tsc(gulpConfig.typescriptCompilerOptions))
        .on('error', function (err) {
            throw new Error('TypeScript transpilation error: ' + err);
        });

    tsResult.dts.pipe(gulp.dest('./'));

    return tsResult.js
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('./'));
});

gulp.task('copy-package-json', gulp.series(function (done) {
    if (!fs.existsSync(gulpConfig.output)) {
        fs.mkdirSync(gulpConfig.output);
    }
    
    ncp(gulpConfig.packageJSON, path.join(gulpConfig.output, 'package.json'), function (err) {
        if (err) {
            throw new Error('Gulp copy error: ' + err);
        }
    });

    done();
}));

gulp.task('copy-public', function () {
    ncp(gulpConfig.srcPublicDir, gulpConfig.relPublicDir, function (err) {
        if (err) {
            throw new Error('Gulp copy error: ' + err);
        }
    });
});