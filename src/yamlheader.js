var yaml = require('js-yaml');

var forLines = function(str, pattern, f) {
    var p = 0;
    var match, part;

    pattern.lastIndex = p;
    match = pattern.exec(str);
    while (match) {
        part = str.slice(p, match.index);
        p = match.index + match[0].length;
        pattern.lastIndex = p;
        if (f(part) === false) { return; }
        match = pattern.exec(str);
    }
    part = str.slice(p, str.length);
    f(part);
};

var getHeader = function(data, opt) {
    var encoding;
    var header = [];
    var nl = /\r?\n/g;
    var meta = false;

    opt = opt || {};
    encoding = opt.encoding || 'utf8';
    if (data instanceof Buffer) {
        data = data.toString(encoding);
    }
    if (typeof data !== 'string') {
        throw 'Unsupported data type.';
    }

    forLines(data, nl, function(line) {
        if (line.trim().length === 0) {
            return true;
        }
        if (!meta) {
            if (line === '---') {
                meta = true;
            } else {
                return false;
            }
        } else {
            if (line === '---' || line === '...') {
                meta = false;
            } else {
                header.push(line);
            }
        }
    });

    return yaml.safeLoad(header.join('\n'));
};

module.exports = getHeader;
