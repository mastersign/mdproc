var path = require('path');
var gulp = require('gulp');
var spawn = require('gulp-spawn');

var ge = require('mdgraphextract');
var inliner = require('htinliner');

var processStates = require('./states');

var inputFormat = [
	'markdown',
	'pipe_tables',
	'table_captions',
	'pandoc_title_block',
	'yaml_metadata_block',
	'lists_without_preceding_blankline',
	'abbreviations',
	'tex_math_dollars',
	'auto_identifiers',
	'implicit_header_references',
	'definition_lists'
];

var templatePath = path.join(path.dirname(module.filename), '../assets/template.standalone.html');

var buildHtml = function(src, dest, opt) {
	return function() {
		return gulp.src(src)
			.pipe(processStates())
			.pipe(spawn({
				cmd: 'pandoc',
				args: [
					'--from=' + inputFormat.join('+'),
					'--to=html5',
					'--default-image-extension=svg',
					'--normalize',
					'--smart',
					'--toc',
					'--toc-depth=2',
					'--mathml',
					'--template', templatePath
				],
				filename: function(base, ext) { return base + '.html' }
			}))
			.pipe(inliner({ 
				svgRemoveSize: true, 
				svgWrapElement: 'div',
				basePath: dest 
			}))
			.pipe(gulp.dest(dest));
	};
};
module.exports.buildHtmlTask = buildHtml;

var extractGraph = function(src, dest, opt) {
	return function() {
		return gulp.src(src)
			.pipe(ge(opt))
			.pipe(spawn({
				cmd: 'dot',
				args: ['-Tsvg', '-Nfontname=Helvetica'],
				filename: function(base, ext) { return base + '.svg' }
			}))
			.pipe(gulp.dest(dest));
	};
};
module.exports.extractGraphTask = extractGraph;
