/* global require, module */
/* jslint quotmark: false */

var through = require('through2');
var yamlheader = require('./yamlheader');

var defLang = 'en';
var langs = {
    "sq": "albanian",
    "am": "amharic",
    "ar": "arabic",
    "hy": "armenian",
    "eu": "basque",
    "bn": "bengali",
    "br": "breton",
    "bg": "bulgarian",
    "ca": "catalan",
    "hr": "croation",
    "cs": "czech",
    "da": "danish",
    "nl": "dutch",
    "en": "english",
    "eo": "esperanto",
    "et": "estonian",
    "fa": "farsi",
    "fi": "finnish",
    "fr": "french",
    "gl": "galician",
    "de": "german",
    "el": "greek",
    "he": "hebrew",
    "iw": "hebrew",
    "hi": "hindi",
    "is": "icelandic",
    "ia": "interlingua",
    "ga": "irish",
    "it": "italian",
    "kn": "kannada",
    "lo": "lao",
    "la": "latin",
    "lv": "latvian",
    "lt": "lithuanian",
    "ml": "malayalam",
    "mr": "marathi",
    "oc": "occitan",
    "pl": "polish",
    "pt": "portuges",
    "ro": "romanian",
    "ru": "russian",
    "sa": "sanskrit",
    "sr": "serbian",
    "sk": "slovak",
    "sl": "slovenian",
    "es": "spanish",
    "sv": "swedish",
    "ta": "tamil",
    "te": "telugu",
    "bo": "tibetan",
    "th": "thai",
    "tr": "turkish",
    "tk": "turkmen",
    "uk": "ukrainian",
    "ur": "urdu",
    "vi": "vietnamese",
    "cy": "welsh"
};

var toPdfLang = function (lang) {
    'use strict';
    return langs[lang] || langs[defLang];
};

var retrieveLang = function (data, opt) {
    'use strict';
    var meta = yamlheader(data, opt);
    return meta ? meta.lang : undefined;
};

var pdfLang = function () {
    'use strict';
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            cb();
            return;
        }
        if (file.isBuffer()) {
            file.pdfLang = toPdfLang(retrieveLang(file.contents, {
                encoding: enc
            }));
            this.push(file);
            cb();
            return;
        }
        if (file.isStream()) {
            throw 'Streams are not supported.';
        }
    });
};

module.exports = pdfLang;
