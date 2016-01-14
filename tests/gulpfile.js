/* globals require */
'use strict';

var gulp = require('gulp');
var del = require('del');
var mdinclude = require('mdinclude');
var mdproc = require('../src/index');

gulp.task('clean', function (cb) {
	del(['tmp/**', 'data/images/auto/*'], cb);
});

gulp.task('includes', function () {
	return gulp.src('data/includes.md')
		.pipe(mdinclude())
		.pipe(mdproc.md2html())
		.pipe(gulp.dest('tmp'));
});

gulp.task('csv', function () {
	return gulp.src('data/csv.md')
		.pipe(mdinclude())
		.pipe(mdproc.md2html())
		.pipe(gulp.dest('tmp'));
});

gulp.task('links', function () {
	return gulp.src('data/links.md')
		.pipe(mdproc.md2html())
		.pipe(gulp.dest('tmp'));
});

gulp.task('autograph:complex', function () {
	return gulp.src('data/complex.md')
		.pipe(mdinclude())
		.pipe(mdproc.autograph())
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('copy-images', function () {
	return gulp.src('data/images/**')
		.pipe(gulp.dest('tmp/images'));
});

gulp.task('complex', ['autograph:complex', 'copy-images'], function () {
	return gulp.src('data/complex.md')
		.pipe(mdinclude())
		.pipe(mdproc.md2html())
		.pipe(gulp.dest('tmp'));
});

gulp.task('dotex_svg',  function () {
	return gulp.src('data/*.md')
		.pipe(mdproc.dotex())
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('dotex_png',  function () {
	return gulp.src('data/*.md')
		.pipe(mdproc.dotex({ imgFormat: 'png' }))
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('dotex_pdf',  function () {
	return gulp.src('data/*.md')
		.pipe(mdproc.dotex({ imgFormat: 'pdf' }))
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('autograph_svg', function () {
	return gulp.src('data/*.md')
		.pipe(mdproc.references())
		.pipe(mdproc.autograph({ imgFormat: 'svg' }))
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('autograph_png', function () {
	return gulp.src('data/*.md')
		.pipe(mdproc.references())
		.pipe(mdproc.autograph({ imgFormat: 'png' }))
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('autograph_pdf', function () {
	return gulp.src('data/*.md')
		.pipe(mdproc.references())
		.pipe(mdproc.autograph({ imgFormat: 'pdf' }))
		.pipe(gulp.dest('data/images/auto'));
});

gulp.task('md2html', ['dotex_svg', 'autograph_svg', 'copy-images'], function () {
	return gulp.src('data/*.md')
		.pipe(mdinclude())
		.pipe(mdproc.states())
		.pipe(mdproc.references({ prefixCaption: true }))
		.pipe(mdproc.md2html({ basePath: 'data', theme: 'metro' }))
		.pipe(gulp.dest('tmp'));
});

gulp.task('md2docx', ['dotex_png', 'autograph_png'], function () {
	return gulp.src('data/*.md')
		.pipe(mdinclude())
		.pipe(mdproc.states())
		.pipe(mdproc.references())
		.pipe(mdproc.md2docx())
		.pipe(gulp.dest('tmp'));
});

gulp.task('md2pdf', ['dotex_pdf', 'autograph_pdf'], function () {
	return gulp.src('data/*.md')
		.pipe(mdinclude())
		.pipe(mdproc.states())
		.pipe(mdproc.references())
		.pipe(mdproc.md2pdf())
		.pipe(gulp.dest('tmp'));
});

gulp.task('default', ['md2html', 'md2docx', 'md2pdf']);
