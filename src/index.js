/* global module, require, process */

var path = require('path');
var gulp = require('gulp');
var spawn = require('gulp-spawn');
var exec = require('gulp-exec');
var rename = require('gulp-rename');
var del = require('del');
var textTransform = require('gulp-text-simple');

var ge = require('mdgraphextract');
var inliner = require('htinliner');
var processIncludes = require('mdinclude');
var processQueries = require('mdquery').transform;

var processStates = require('./states');
var processReferences = require('./refs');
var linkext = require('./linkext');
var pdfLang = require('./pdflang');

var inputFormat = [
    'markdown',
    'pipe_tables',
    'table_captions',
    'pandoc_title_block',
    'yaml_metadata_block',
    'lists_without_preceding_blankline',
    'abbreviations',
    'tex_math_dollars',
    'auto_identifiers',
    'implicit_header_references',
    'definition_lists'
];

var html5TemplatePath = path.join(path.dirname(module.filename),
    '../assets/template.standalone.html');
var latexTemplatePath = path.join(path.dirname(module.filename),
    '../assets/template.tex');
var texInputsPath = path.join(path.dirname(module.filename),
    '../assets');

process.env.TEXINPUTS = texInputsPath + path.delimiter + process.env.TEXINPUTS;

var identity = function (x) { return x; };

var buildFactory = function (targetFormat, targetExt,
    defImgFormat, defTemplate, defTocDepth, prefixCaption,
    args, transforms) {
    'use strict';

    return function (src, dest, opt) {
        var execOptions; // the options for the exec call
        var cmdline; // an array with all command line components
        var imgFormat; // the image format as file extension without period
        var imgBasePath; // the base path for relative image references
        var templatePath; // the path to the HTML template
        var customTransform; // a function taking a string and returning a string
                             // for custom processing the Markdown text
        var linkExtTransform; // a function taking a string and returning a string
                               // for adaptation of hyperlinks to other Markdown documents
        var tocDepth; // the depth for the table of contents
        var variables; // an object with additional template variables
        var tmpExt; // the file name extension for intermediate files
        var cleanupTmp; // switch to prevent the cleanup of temporary files
        var contextArgs; // arguments where functions are resolved to values
        var contextTransforms; // additional transformations for the pipeline
        var contextify; // function to resolve functional args into values

        opt = opt || {};
        imgFormat = opt.imgFormat || defImgFormat;
        templatePath = opt.template || defTemplate;
        customTransform = opt.customTransformation || identity;
        linkExtTransform = opt.adaptMdLinks !== false ?
            linkext('.md', '.' + targetExt) : identity;
        tocDepth = opt.tocDepth !== undefined ?
            opt.tocDepth : defTocDepth;
        variables = opt.vars || {};
        tmpExt = targetExt + '_tmp';
        cleanupTmp = opt.cleanupTempFiles !== false;
        imgBasePath = opt.imgBasePath || dest;

        contextify = function (value) {
            if (typeof value === 'function') {
                return value(src, dest, opt);
            }
            return value;
        };
        contextArgs = contextify(args);
        contextTransforms = contextify(transforms);

        execOptions = {
            continueOnError: true,
            pipeStdout: false
        };

        cmdline = [
            'cd',
            '"' + imgBasePath + '"',
            '&&',
            'pandoc',
            '--from=' + inputFormat.join('+'),
            '--to=' + targetFormat,
            '--default-image-extension=' + imgFormat,
            '--normalize',
            '--smart'
        ];

        if (tocDepth) {
            cmdline.push('--toc');
            cmdline.push('--toc-depth=' + tocDepth);
        }

        if (targetFormat === 'html') {
            cmdline.push('--mathml');
        }

        if (templatePath) {
            cmdline.push('--template="' + templatePath + '"');
        }
        if (contextArgs) {
            for (var i = 0; i < contextArgs.length; i++) {
                cmdline.push(contextArgs[i]);
            }
        }

        for (var key in variables) {
            cmdline.push('"--variable=' + key + ':' + variables[key] + '"');
        }

        cmdline.push('-o');
        cmdline.push('"<%= file.path %>.' + targetExt + '"');
        cmdline.push('"<%= file.path %>.' + tmpExt + '"');

        return function () {
            var s = gulp.src(src);

            s = s.pipe(processIncludes());
            s = s.pipe(processQueries());
            s = s.pipe(textTransform(customTransform));
            s = s.pipe(textTransform(linkExtTransform));
            s = s.pipe(processStates());
            s = s.pipe(processReferences({
                prefixCaption: prefixCaption,
                figureTerm: 'Abbildung'
            }));

            s = s
                .pipe(rename({
                    extname: '.' + tmpExt
                }))
                .pipe(gulp.dest(dest))
                .pipe(rename({
                    extname: ''
                }));

            if (contextTransforms) {
                for (var i = 0; i < contextTransforms.length; i++) {
                    s = s.pipe(contextTransforms[i]);
                }
            }

            s = s
                .pipe(exec(cmdline.join(' '), execOptions))
                .pipe(exec.reporter());

            if (targetFormat === 'html') {
                s = s
                    .pipe(rename({
                        extname: '.' + targetExt
                    }))
                    .pipe(inliner({
                        svgRemoveSize: true,
                        svgWrapElement: 'div',
                        basePath: imgBasePath
                    }));
            }

            if (cleanupTmp) {
                s.on('end', function() {
                    del.sync(dest + '/**/*.' + tmpExt);
                });
            }

            return s;
        };
    };
};

module.exports.buildHtmlTask = buildFactory(
    'html5', 'html', 'svg', html5TemplatePath, 2, true);

module.exports.buildDocxTask = buildFactory(
    'docx', 'docx', 'png', null, 2, true);

module.exports.buildPdfTask = buildFactory(
    'latex', 'pdf', 'pdf', latexTemplatePath, 2, false, [
        '--latex-engine=xelatex',
        '--variable=documentclass:scrartcl',
        '--variable=lang:<%= file.pdfLang %>'
    ], [pdfLang()]);

module.exports.buildLaTeXTask = buildFactory(
    'latex', 'tex', 'pdf', latexTemplatePath, 2, false, [
        '--variable=documentclass:scrartcl',
        '--variable=lang:<%= file.pdfLang %>'
    ], [pdfLang()]);

var extractGraph = function (src, dest, opt) {
    'use strict';
    var imgFormat; // the image format as file extension without the period
    var mode; // the extraction mode
    var imgName; // the image name
    var attributes; // attribute collection for the commandline
    var a; // single attribute in iterations
    var args = []; // the commandline arguments

    opt = opt || {};
    imgFormat = opt.imgFormat || 'svg';
    mode = opt.mode || 'auto';
    imgName = opt.imgName;

    args.push('-T' + imgFormat);

    attributes = opt.graphAttributes || {};
    for (a in attributes) {
        args.push('-G' + a + '=' + attributes[a]);
    }
    attributes = opt.nodeAttributes || {};
    for (a in attributes) {
        args.push('-N' + a + '=' + attributes[a]);
    }
    attributes = opt.edgeAttributes || {};
    for (a in attributes) {
        args.push('-E' + a + '=' + attributes[a]);
    }

    return function () {
        return gulp.src(src)
            .pipe(processIncludes())
            .pipe(ge(opt))
            .pipe(spawn({
                cmd: 'dot',
                args: args,
                filename: function (base) {
                    return imgName ?
                        imgName + '.' + imgFormat :
                        base + '_' + mode + '.' + imgFormat;
                }
            }))
            .pipe(gulp.dest(dest));
    };
};

module.exports.extractGraphTask = extractGraph;
