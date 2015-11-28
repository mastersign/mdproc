/* globals require */

var path = require('path');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var less = require('gulp-less');
var htinliner = require('htinliner');

var bowerDir = './bower_components/';
var tempDir = './tmp/';

gulp.task('clean', function (cb) {
    'use strict';
    del([tempDir + '**'], cb);
});

gulp.task('copy_template', function () {
    'use strict';
    return gulp.src('./src/template.html')
        .pipe(gulp.dest(tempDir));
});

gulp.task('minify_styles', function () {
    'use strict';
    return merge(
        gulp.src(path.join(bowerDir, 'h5smpl/css', '*.css'))
            .pipe(minifyCss())
            .pipe(gulp.dest(path.join(tempDir, 'css/'))),
        gulp.src('./src/*.less')
            .pipe(less())
            .pipe(minifyCss())
            .pipe(gulp.dest(path.join(tempDir, 'css/')))
    );
});

gulp.task('build_html_template',
    ['copy_template', 'minify_styles'],
    function () {
        'use strict';
        return gulp.src('template.html', { cwd: tempDir })
            .pipe(htinliner())
            .pipe(rename('template.standalone.html'))
            .pipe(gulp.dest('assets/'));
    });

gulp.task('default', ['build_html_template']);
