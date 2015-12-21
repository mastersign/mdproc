/* globals require, module */

var through = require('through2');
var fs = require('fs');

module.exports = function () {
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			cb();
			return;
		}
		if (file.isStream()) {
			file.contents.close();
		}
		file.contents = fs.createReadStream(file.path);
		this.push(file);
		cb();
	});
};
