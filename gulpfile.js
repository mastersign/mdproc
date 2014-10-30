var path = require('path');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var jslint = require('gulp-jslint');
var less = require('gulp-less');
var htinliner = require('htinliner');

var bowerDir = './bower_components/';
var tempDir = './tmp/';

gulp.task('clean', function (cb) {
    del([tempDir + '**'], cb);
});

gulp.task('copy_template', function() {
	return gulp.src('./src/template.html')
		.pipe(gulp.dest(tempDir));
});

gulp.task('minify_styles', function() {
	return merge(
		gulp.src(path.join(bowerDir, 'h5smpl/css', '*.css'))
			.pipe(minifyCss())
			.pipe(gulp.dest(path.join(tempDir, 'css/'))),
		gulp.src('./src/*.less')
			.pipe(less())
			.pipe(minifyCss())
			.pipe(gulp.dest(path.join(tempDir, 'css/'))));
});

gulp.task('build_html_template', 
	['copy_template', 'minify_styles'], function() {

	return gulp.src('template.html' , { cwd: tempDir })
		.pipe(htinliner())
		.pipe(rename('template.standalone.html'))
		.pipe(gulp.dest('assets/'));
});
gulp.task('default', ['build_html_template']);

gulp.task('jslint', function () {
    return gulp.src('./src/*.js')
        .pipe(jslint({
            node: true,
            evil: false,
            reporter: 'default',
            errorsOnly: false
        }));
});
