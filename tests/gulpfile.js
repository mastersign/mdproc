/* globals require */

var gulp = require('gulp');
var mdproc = require('../src/index');

gulp.task('includes',
	mdproc.buildHtmlTask(
		['./data/includes.md'],
		'./tmp/',
		{  }));

gulp.task('csv',
	mdproc.buildHtmlTask(
		['./data/csv.md'],
		'./tmp/',
		{  }));

gulp.task('links',
	mdproc.buildHtmlTask(
		['./data/links.md'],
		'./tmp/',
		{  }));

gulp.task('dotex_svg',
	mdproc.extractGraphTask(
		['./data/dotex.md'],
		'./tmp/',
		{ mode: 'dotex' }));

gulp.task('dotex_png',
	mdproc.extractGraphTask(
		['./data/dotex.md'],
		'./tmp/',
		{ mode: 'dotex', imgFormat: 'png' }));

gulp.task('autograph_svg',
	mdproc.extractGraphTask(
		'./data/autograph.md',
		'./tmp/',
		{  }));

gulp.task('autograph_png',
	mdproc.extractGraphTask(
		'./data/autograph.md',
		'./tmp/',
		{ imgFormat: 'png' }));

var customTextTransform = function (s) {
	return s.replace(/included/g, '_included_');
};

gulp.task('md2html', ['dotex_svg', 'autograph_svg'],
	mdproc.buildHtmlTask(
		'./data/*.md',
		'./tmp/',
		{ customTransformation: customTextTransform,
		  cleanupTempFiles: false }));

gulp.task('md2docx', ['dotex_png', 'autograph_png'],
	mdproc.buildDocxTask(
		'./data/*.md',
		'./tmp/',
		{ customTransformation: customTextTransform }));

gulp.task('default', ['md2html', 'md2docx']);
