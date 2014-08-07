var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var minifyCss = require('gulp-minify-css');
var inject = require('gulp-inject');

var bowerDir = './bower_components/';
var tempDir = './tmp/';

gulp.task('clean', function() {
	gulp.src(tempDir + '**')
		.pipe(rimraf());
});

gulp.task('build_html_template', function() {
	var stylesheets = gulp.src(bowerDir + 'h5smpl/css/*.css', { read: false });
	gulp.src('./template.html')
		.pipe(inject(stylesheets), { relative: true })
		.pipe(gulp.dest(tempDir));
});

gulp.task('default', ['build_html_template']);