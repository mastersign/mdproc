/* global require, module, Buffer */

var through = require('through2');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var csv = require('./csv');

var readFile = function (filePath, pathCache) {
    'use strict';
    if (_.contains(pathCache, filePath)) {
        return '<!-- CIRCULAR INCLUDE REFERENCE: ' + filePath + ' -->';
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return '<!-- INCLUDE FILE NOT FOUND: ' + filePath + ' -->';
    }
    pathCache.push(filePath);
    return fs.readFileSync(filePath, 'utf8');
};

var csvTable = function(csvText) {
    var data = '';
    var result = '';
    var headline = true;

    data = csv(csvText);

    // cleanup data: ignore empty lines, ignore # comments
    data = _.filter(data, function(row) {
            return row.length > 0 &&
                (row.length > 1 || row[0].trim().length > 0) &&
                row[0].trim()[0] != '#';
    });

    var formatRow = function(rowData, headline) {
        var r = '|';
        for (var i = 0; i < rowData.length; i++) {
            v = rowData[i]
            r += ' ' + v + ' |';
        };
        r += '\n';
        if (headline) {
            r += '|';
            for (var i = 0; i < rowData.length; i++) {
            v = rowData[i]
                r += (new Array(v.length + 2).join('-')) + '|';
            }
            r += '\n';
        }
        return r;
    }

    for (var i = 0; i < data.length; i++) {
        row = data[i]
        result += formatRow(row, headline);
        headline = false;
    };
    if (data.length == 1) {
        row = new Array(data[0].length);
        result += formatRow(row, false);
    }
    return result;
};

var transformText = function (text, referencePath, pathCache) {
    'use strict';
    pathCache = pathCache || [];
    text = text.replace(
        /<!--\s+#include\s+(.+?)\s+-->/g,
        function (m, filePath) {
            var branchCache = _.clone(pathCache);
            var absPath = path.resolve(referencePath, filePath);
            var includeContent = readFile(absPath, branchCache);
            return transformText(includeContent, path.dirname(absPath), branchCache);
        });
    text = text.replace(
        /<!--\s+#csv\s+(.+?)\s+-->/g,
        function (m, filePath) {
            var absPath = path.resolve(referencePath, filePath);
            var csvContent = readFile(absPath, []);
            return csvTable(csvContent);
        });
    return text;
};

var transformFile = function (buffer, referencePath) {
    'use strict';
    return new Buffer(
        transformText(
            buffer.toString('utf8'),
            referencePath),
        'utf8');
};

var processIncludes = function () {
    'use strict';
    return through.obj(function (file, enc, cb) {
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
