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

gulp.task('dotex', mdproc.extractGraphTask(
	['./data/architecture.md', './data/backlog.md'], 
	'./tmp/', 
	{ mode: 'dotex' }));

gulp.task('autograph', mdproc.extractGraphTask(
	'./data/ui.md', 
	'./tmp/', 
	{ autographLevel: 2 }));

var customTextTransform = function (s) { 
	return s.replace(/included/g, '_included_'); 
};

gulp.task('md2html', ['dotex', 'autograph'],
	mdproc.buildHtmlTask(
		'./data/*.md',
		'./tmp/',
		{ customTransformation: customTextTransform }));

gulp.task('default', ['md2html', 'includes', 'csv']);
