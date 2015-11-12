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

gulp.task('dotex_svg', 
	mdproc.extractGraphTask(
		['./data/architecture.md', './data/backlog.md'], 
		'./tmp/', 
		{ mode: 'dotex' }));

gulp.task('dotex_png', 
	mdproc.extractGraphTask(
		['./data/architecture.md', './data/backlog.md'], 
		'./tmp/', 
		{ mode: 'dotex', imgFormat: 'png' }));

gulp.task('autograph_svg', 
	mdproc.extractGraphTask(
		'./data/ui.md', 
		'./tmp/', 
		{ autographLevel: 2 }));

gulp.task('autograph_png', 
	mdproc.extractGraphTask(
		'./data/ui.md', 
		'./tmp/', 
		{ autographLevel: 2, imgFormat: 'png' }));

var customTextTransform = function (s) { 
	return s.replace(/included/g, '_included_'); 
};

gulp.task('md2html', ['dotex_svg', 'autograph_svg'],
	mdproc.buildHtmlTask(
		'./data/*.md',
		'./tmp/',
		{ customTransformation: customTextTransform }));

gulp.task('md2docx', ['dotex_png', 'autograph_png'],
	mdproc.buildDocxTask(
		'./data/*.md',
		'./tmp/',
		{ customTransformation: customTextTransform }));

gulp.task('default', ['includes', 'csv', 'md2html', 'md2docx']);
