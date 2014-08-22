var inliner = require('htinliner');
var ge = require('mdgraphextract');
var spawn = require('gulp-spawn');

var buildHtml = function(src, dest, opt) {
	return function() {
		return src
			.pipe(spawn({
				cmd: 'pandoc',
				args: [],
				filename: function(base, ext) { return base + '.html' }
			}))
			.pipe(inliner())
			.pipe(dest);
	};
};

module.exports.buildHtmlTask = buildHtml;

var extractGraph = function(src, dest, opt) {
	return function() {
		return src
			.pipe(ge(opt))
			.pipe(dest)
			.pipe(spawn({
				cmd: 'dot',
				args: ['-Tsvg', '-Nfontname=Helvetica'],
				filename: function(base, ext) { return base + '.svg' }
			}))
			.pipe(dest);
	};
};

module.exports.extractGraphTask = extractGraph;

