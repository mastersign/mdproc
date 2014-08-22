var gulp = require('gulp');
var mdproc = require('../src/index');

gulp.task('dotex', mdproc.extractGraphTask(
	gulp.src(['./data/*.md', '!./data/ui.md']), 
	gulp.dest('./tmp/'), 
	{ mode: 'dotex' }));

gulp.task('autograph', mdproc.extractGraphTask(
	gulp.src('./data/ui.md'), 
	gulp.dest('./tmp/'), 
	{ autographLevel: 2 }));

gulp.task('default', ['autograph', 'dotex']);