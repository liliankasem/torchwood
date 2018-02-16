'use strict';

var gulp = require('gulp');
var path = require('path');
var zip = require('gulp-zip');
var minimist = require('minimist');
var defaultRoot = path.join(__dirname, "../..");

var knownOptions = {
    string: 'packageName',
    string: 'packagePath',
    default: {
        packageName: "Package.zip",
        packagePath: path.join(defaultRoot, '_package')
    }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('package', ['copy-package-json'], function () {

    var packagePaths = ['release/**'];

    for (var i = 0; i < packagePaths.length; i++) {
        var pPath = path.join(defaultRoot, packagePaths[i]);
        packagePaths[i] = pPath;
    }

    return gulp.src(packagePaths)
        .pipe(zip(options.packageName))
        .pipe(gulp.dest(options.packagePath));
});