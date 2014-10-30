var through = require('through2');

var transformFile = function (buffer) {
    "use strict";
    var result = buffer
        .toString('utf8')
        .replace(
            /<!--\s+#state\s+(\S+)\s+-->/g,
            function (m, typ) {
                switch (typ) {
                case 'open':
                    return '<span class="state open">offen</span>';
                case 'in-progress':
                    return '<span class="state in-progress">in Bearbeitung</span>';
                case 'closed':
                    return '<span class="state closed">abgeschlossen</span>';
                default:
                    return '<span class="state unknown">unbekannt</span>';
                }
            }
        );
    return new Buffer(result, 'utf8');
};

var processStates = function () {
    "use strict";
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            cb();
            return;
        }
        if (file.isBuffer()) {
            file.contents = transformFile(file.contents);
            this.push(file);
            cb();
            return;
        }
        if (file.isStream()) {
            throw 'Streams are not supported.';
        }
    });
};

module.exports = processStates;
