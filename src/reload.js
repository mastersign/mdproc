/* globals require, module */

var through = require('through2');
var fs = require('fs');

var fileExists = function (path) {
	try {
		fs.accessSync(path, fs.constants.F_OK);
		return true;
	} catch (err) {
		return false;
	}
};

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
		if (fileExists(file.path)) {
			file.contents = fs.createReadStream(file.path);
			this.push(file);
		} else {
			console.log("Could not reload file, it does not exist: " + file.path);
		}
		cb();
	});
};
