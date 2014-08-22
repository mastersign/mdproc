var inliner = require('htinliner');
var ge = require('mdgraphextract');
var spawn = require('gulp-spawn');

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

