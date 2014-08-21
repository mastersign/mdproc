var gulp = require('gulp');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var minifyCss = require('gulp-minify-css');
var htinliner = require('htinliner');

var bowerDir = './bower_components/';
var tempDir = './tmp/';

gulp.task('clean', function() {
	gulp.src(tempDir + '**')
		.pipe(rimraf());
});

gulp.task('copy_template', function() {
	return gulp.src('./src/template.html')
		.pipe(gulp.dest(tempDir));
});

gulp.task('minify_styles', function() {
	return gulp.src(bowerDir + 'h5smpl/css/*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest(tempDir + 'css/'));
});

gulp.task('build_html_template', 
	['copy_template', 'minify_styles'], function() {

	return gulp.src('template.html' , { cwd: tempDir })
		.pipe(htinliner())
		.pipe(rename('template.standalone.html'))
		.pipe(gulp.dest('assets/'));
});

gulp.task('default', ['build_html_template']);