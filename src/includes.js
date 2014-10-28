var through = require('through2');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');

var readFile = function(filePath, pathCache) {
	var content;
	if (_.contains(pathCache, filePath)) {
		return '<!-- CIRCULAR INCLUDE REFERENCE: ' + filePath + ' -->';
	}
	if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		return '<!-- INCLUDE FILE NOT FOUND: ' + filePath + ' -->';
	}
	pathCache.push(filePath);
	return fs.readFileSync(filePath, 'utf8');
};

var transformText = function(text, referencePath, pathCache) {
	pathCache = pathCache || [];
	return text.replace(
		/<!--\s+#include\s+(.+?)\s+-->/g,
		function(m, filePath) {
			var branchCache = _.clone(pathCache);
			var absPath = path.resolve(referencePath, filePath);
			var includeContent = readFile(absPath, branchCache);
			return transformText(includeContent, path.dirname(absPath), branchCache);
		});
};

var transformFile = function(buffer, referencePath) {
	return new Buffer(
		transformText(
			buffer.toString('utf8'),
			referencePath),
		'utf8');
};

var processIncludes = function() {
	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			cb();
			return;
		}
		if (file.isBuffer()) {
			file.contents = transformFile(file.contents, path.dirname(file.path));
			this.push(file);
			cb();
			return;
		}
		if (file.isStream()) {
			throw 'Streams are not supported.';
		}
	});
};

module.exports = processIncludes;