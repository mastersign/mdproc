var path = require('path');
var inliner = require('htinliner');
var ge = require('mdgraphextract');
var spawn = require('gulp-spawn');

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
		return src
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
			.pipe(dest);
	};
};
module.exports.buildHtmlTask = buildHtml;

var inlineSvg = function(src, dest) {
	return function() {
		src
			.pipe(inliner({ svgRemoveSize: true, svgWrapElement: 'div' }))
			.pipe(dest);
	};
};
module.exports.inlineSvgTask = inlineSvg;

var extractGraph = function(src, dest, opt) {
	return function() {
		return src
			.pipe(ge(opt))
			.pipe(spawn({
				cmd: 'dot',
				args: ['-Tsvg', '-Nfontname=Helvetica'],
				filename: function(base, ext) { return base + '.svg' }
			}))
			.pipe(dest);
	};
};
module.exports.extractGraphTask = extractGraph;

/*

md -> dot -> svg
md -> html -> svgembedded

*/