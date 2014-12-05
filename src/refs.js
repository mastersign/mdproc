/* global require, module, Buffer */

var through = require('through2');

var defFigureTerm = 'Figure';

var figurePattern = /!\[#([^\s\]]+)(?:\s+([^\]]*))?\]((?:\([^\)]*\)|\[[^\]]*\])?)/g;
var figureLinePattern = new RegExp('^' + figurePattern.source + '$', 'gm');
var figureRefPattern = /\[#([^\s\]]+)(?:\s+([^\]]*))?\](?!\||\()/g;

var transformFile = function (buffer, opt) {
    'use strict';
    var encoding, prefixCaption, figureTerm, text;
    var count = 0;
    var ids = {};

    var registerFigure = function (id) {
        if (!ids[id]) {
            count = count + 1;
            ids[id] = count;
        }
    };

    var figureLabel = function (id) {
        var no = ids[id] || '???';
        return figureTerm + ' ' + no;
    };

    var figureReplacer = function (sep) {
        return function (m, id, alt, ref) {
            var label;
            registerFigure(id);
            label = prefixCaption ? (figureLabel(id) + ': ') : '';
            return '<a name="' + id + '"></a>' + sep + '![' + label + alt + ']' + ref;
        };
    };

    var figureRefReplacer = function (m, id, alt) {
        return '[' + (alt || figureLabel(id)) + '](#' + id + ')';
    };

    opt = opt || {};
    encoding = opt.encoding || 'utf8';
    prefixCaption = opt.prefixCaption || false;
    figureTerm = opt.figureTerm || defFigureTerm;
    text = buffer.toString(encoding);
    text = text.replace(figureLinePattern, figureReplacer('\n\n'));
    text = text.replace(figurePattern, figureReplacer(' '));
    text = text.replace(figureRefPattern, figureRefReplacer);

    return new Buffer(text, encoding);
};

var processReferences = function (opt) {
    'use strict';
    opt = opt || {};
    return through.obj(function (file, enc, cb) {
        opt.encoding = opt.encoding || enc;
        if (file.isNull()) {
            this.push(file);
            cb();
            return;
        }
        if (file.isBuffer()) {
            file.contents = transformFile(file.contents, opt);
            this.push(file);
            cb();
            return;
        }
        if (file.isStream()) {
            throw 'Streams are not supported.';
        }
    });
};

module.exports = processReferences;
