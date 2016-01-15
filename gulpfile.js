/* globals require */

var path = require('path');
var del = require('del');
var glob = require('glob');
var gulp = require('gulp');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var cssNano = require('gulp-cssnano');
var less = require('gulp-less');
var textTransformation = require('gulp-text-simple');
var htinliner = require('htinliner');

var bowerDir = './bower_components/';
var tempDir = './tmp/';
var styleSourcePattern = path.join(bowerDir, 'h5smpl', 'dist', 'css', 'style.*.mini.css');

var extractStyleFromFilename = function (fileName) {
    'use strict';
    return fileName.replace(/^.*\.([^\.]*?)\.mini\.css$/, '$1');
};

var findStyles = function () {
    'use strict';
    return glob.sync(styleSourcePattern)
        .map(extractStyleFromFilename);
};

var setTemplateStyle = function (html, opts) {
    'use strict';
    return html.replace('style.default.css', 'style.' + opts.style + '.mini.css');
};

var insertLangAttribute = function (html) {
    'use strict';
    return html.replace('<html>', '<html$if(lang)$ lang="$lang$"$endif$>');
};

gulp.task('clean', function () {
    'use strict';
    return del([tempDir + '**']);
});

gulp.task('copy_template', function () {
    'use strict';
    return gulp.src('./src/template.html')
        .pipe(gulp.dest(tempDir));
});

gulp.task('copy_h5smpl_styles', function () {
    'use strict';
    return gulp.src(styleSourcePattern)
        .pipe(gulp.dest(path.join(tempDir, 'css/')));
});

gulp.task('compile_mdproc_styles', function () {
    'use strict';
    return gulp.src('./src/*.less')
        .pipe(less())
        .pipe(cssNano())
        .pipe(gulp.dest(path.join(tempDir, 'css/')));
});

gulp.task('preparations', ['copy_template', 'compile_mdproc_styles', 'copy_h5smpl_styles']);

gulp.task('build_html_template', ['preparations'], function () {
    'use strict';
    return merge(findStyles().map(function (style) {
        var styleSetter = textTransformation(setTemplateStyle, { style: style });
        var langInserter = textTransformation(insertLangAttribute);
        return gulp.src('template.html', { cwd: tempDir })
            .pipe(styleSetter())
            .pipe(htinliner())
            .pipe(langInserter())
            .pipe(rename('template.' + style + '.html'))
            .pipe(gulp.dest('assets/'));
    }));
});

gulp.task('default', ['build_html_template']);
