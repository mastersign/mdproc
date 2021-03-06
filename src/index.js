/* global module, require, process, console */

var path = require('path');
var url = require('url');
var gulp = require('gulp');
var Vinyl = require('vinyl');
var through2 = require('through2');
var lazypipe = require('lazypipe');
var spawn = require('gulp-spawn');
var exec = require('gulp-exec');
var rename = require('gulp-rename');
var del = require('del');
var tmp = require('tmp');
var textTransform = require('gulp-text-simple');

var ge = require('mdgraphextract');
var inliner = require('htinliner');

var reload = require('./reload');
var linkext = require('./linkext');

var inputFormat = [
	'markdown',
	'smart',
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

var html5TemplateFinder = function (theme) {
	'use strict';
	theme = theme || 'default';
	return path.join(path.dirname(module.filename),
		'..', 'assets', 'template.' + theme + '.html');
};
var docxTemplateFinder = function () {
	'use strict';
	return path.join(path.dirname(module.filename),
		'..', 'assets', 'template.docx');
};
var latexTemplateFinder = function () {
	'use strict';
	return path.join(path.dirname(module.filename),
		'..', 'assets', 'template.tex');
};
var texInputsPath = path.join(path.dirname(module.filename),
	'../assets');

process.env.TEXINPUTS = texInputsPath + path.delimiter + (process.env.TEXINPUTS || '');

var identity = function (x) {
	'use strict';
	return x;
};

var noteDirname = function() {
	'use strict';
	return through2.obj(function (file, enc, cb){
		var f = new Vinyl({
			cwd: file.cwd,
			base: file.base,
			path: file.path,
			contents: file.contents,
			history: file.history,
			originalDirname: path.dirname(file.path)
		});
		this.push(f);
		cb();
	});
};

var runWithTempFiles = function (s, tmpDir, tmpExt, targetExt, commandLine) {
	'use strict';

	var execOptions = {
		continueOnError: true,
		pipeStdout: false
	};
	var reporterOptions = {
		err: false,
		stderr: true,
		stdout: true
	};
	return s
		// unify extension of input file
		.pipe(rename, { extname: '.' + tmpExt })
		// write files to temp directory
		.pipe(gulp.dest, tmpDir)
		// remove the file extension from the vinyl file
		.pipe(rename, { extname: '' })
		// call command line
		.pipe(exec, commandLine, execOptions)
		.pipe(exec.reporter, reporterOptions)
		// add the target extension to the vinyl file to match the output
		.pipe(rename, { extname: '.' + targetExt })
		// load the content of the target file
		.pipe(reload);
};

var makeImagePathsAbsoluteTransform = function (text, opts) {
	'use strict';
	var basePath = path.dirname(opts.sourcePath);
	return text.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, function (m, title, href) {
		if (path.isAbsolute(href) || url.parse(href).protocol) {
			return m;
		} else {
			return '![' + title + '](' + path.join(basePath, href) + ')';
		}
	});
};

var buildFactory = function (targetFormat, targetExt,
	defImgFormat, templateFinder, defTocDepth, prefixCaption,
	args, pipeSteps) {
	'use strict';

	return function (opt) {
		var debug; // a switch for activating debug messages
		var cmdline; // an array with all command line components
		var imgFormat; // the image format as file extension without period
		var theme; // the template theme
		var templatePath; // the path to the HTML template
		var linkExtTransform; // a function taking a string and returning a string
		                      // for adaptation of hyperlinks to other Markdown documents
		var tocDepth; // the depth for the table of contents
		var variables; // an object with additional template variables
		var noSvgInline; // a switch to prevent SVG images from beeing inlined
		var tmpDir; // the directory for temporary files
		var tmpExt; // the file name extension for intermediate files
		var cleanupTmp; // switch to prevent the cleanup of temporary files
		var contextArgs; // arguments where functions are resolved to values
		var contextify; // function to resolve functional args into values

		opt = opt || {};
		debug = opt.debug || false;
		imgFormat = opt.imgFormat || defImgFormat;
		theme = opt.theme || 'default';
		templatePath = opt.template;
		if (!templatePath && typeof(templateFinder) === 'function') {
			templatePath = templateFinder(theme);
		}
		linkExtTransform = opt.adaptMdLinks !== false ?
			linkext('.md', '.' + targetExt) : identity;
		tocDepth = opt.tocDepth !== undefined ?
			opt.tocDepth : defTocDepth;
		variables = opt.vars || {};
		noSvgInline = opt.noSvgInline || false;
		tmpDir = tmp.dirSync({ prefix: 'mdproc_' });
		tmpExt = targetExt + '_tmp';
		cleanupTmp = opt.cleanupTempFiles !== false;

		contextify = function (value) {
			if (typeof value === 'function') {
				return value(opt);
			}
			return value;
		};
		contextArgs = contextify(args);

		cmdline = [
			'pandoc',
			'--from=' + inputFormat.join('+'),
			'--to=' + targetFormat,
			'--resource-path="<%= file.originalDirname %>"',
			'--default-image-extension=' + imgFormat
		];

		if (opt.citations) {
			cmdline.push('--filter');
			cmdline.push('pandoc-citeproc');
			if (opt.bibliography && opt.bibliography.forEach) {
				opt.bibliography.forEach(function (filePath) {
					cmdline.push('--bibliography');
					cmdline.push('"' + filePath + '"');
				});
			}
			if (opt.citation_style) {
				cmdline.push('--csl');
				cmdline.push('"' + opt.citation_style + '"');
			}
		}

		if (tocDepth) {
			cmdline.push('--toc');
			cmdline.push('--toc-depth=' + tocDepth);
		}

		if (targetFormat === 'html5') {
			cmdline.push('--mathml');
		}

		if (templatePath) {
			if (targetFormat === 'docx') {
				cmdline.push('--reference-doc="' + templatePath + '"');
			} else {
				cmdline.push('--template="' + templatePath + '"');
			}
		}
		if (contextArgs) {
			for (var i = 0; i < contextArgs.length; i++) {
				cmdline.push(contextArgs[i]);
			}
		}

		for (var key in variables) {
			cmdline.push('--variable="' + key + ':' + variables[key] + '"');
		}

		cmdline.push('-o');
		cmdline.push('"<%= file.path %>.' + targetExt + '"');
		cmdline.push('"<%= file.path %>.' + tmpExt + '"');

		var s = lazypipe();
		if (pipeSteps) {
			pipeSteps.forEach(function (step) {
				s = s.pipe(step);
			});
		}
		s = s.pipe(textTransform(linkExtTransform));

		if (targetFormat !== 'html5') {
			s = s.pipe(textTransform(makeImagePathsAbsoluteTransform));
		}

		if (debug) { console.log('DEBUG: ' + cmdline.join(' ')); }
		s = s.pipe(noteDirname);
		s = runWithTempFiles(s, tmpDir.name, tmpExt, targetExt, cmdline.join(' '));

		if (targetFormat === 'html5') {
			s = s
				.pipe(inliner, {
					inlineSvgImages: !noSvgInline,
					svgRemoveSize: true,
					svgLimitSize: true,
					svgWrapElement: 'div',
					sourcePath: opt.basePath
				});
		}

		s = s();

		s.on('error', function (e) {
			console.log('ERROR while compiling document:');
			console.log(e.message);
		});

		if (tmpDir && cleanupTmp) {
			s.on('end', function () {
				del.sync(tmpDir.name + '/*', { force: true });
			});
		}

		return s;
	};
};

module.exports.md2html = buildFactory(
	'html5', 'html', 'svg', html5TemplateFinder, 2, true);

module.exports.md2docx = buildFactory(
	'docx', 'docx', 'png', docxTemplateFinder, 2, true);

module.exports.md2pdf = buildFactory(
	'latex', 'pdf', 'pdf', latexTemplateFinder, 2, false, [
		'--pdf-engine=xelatex',
		'--variable=documentclass:scrartcl'
	], []);

module.exports.md2tex = buildFactory(
	'latex', 'tex', 'pdf', latexTemplateFinder, 2, false, [
		'--variable=documentclass:scrartcl'
	], []);

var extractGraphFactory = function (graphExtractMode) {
	'use strict';

	return function (opt) {
		var debug; // a switch to activate debug messages
		var imgFormat; // the image format as file extension without the period
		var imgResolution; // the raster image resolution in pixels per inch
		var convertToPdf = false;
		var convertToPng = false;
		var imgName; // the image name
		var tmpDir;
		var attributes; // attribute collection for the commandline
		var a; // single attribute in iterations
		var args = []; // the commandline arguments

		opt = opt || {};
		debug = opt.debug || false;
		imgFormat = (opt.imgFormat || 'svg').toLowerCase();
		if (imgFormat === 'pdf') {
			convertToPdf = true;
			imgFormat = 'svg';
		}
		if (imgFormat === 'png') {
			convertToPng = true;
			imgFormat = 'svg';
		}
		imgResolution = opt.imgResolution || 300;

		opt.mode = graphExtractMode || 'auto';
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

		var s = lazypipe();
		s = s.pipe(textTransform(makeImagePathsAbsoluteTransform));
		s = s.pipe(ge, opt);

		if (opt.gvOutputFile) {
			var basename = path.basename(opt.gvOutputFile);
			var dirname = path.dirname(opt.gvOutputFile);
			s = s
				.pipe(rename, basename)
				.pipe(gulp.dest, dirname);
		}

		if (debug) { console.log('DEBUG: dot ' + args); }
		s = s
			.pipe(spawn, {
				cmd: 'dot',
				args: args,
				filename: function (base) {
					return imgName ?
						imgName + '.' + imgFormat :
						base + '_' + opt.mode + '.' + imgFormat;
				}
			});

		var convertCmd;
		if (convertToPdf) {
			convertCmd = 'inkscape -f "<%= file.path %>.svg" -A "<%= file.path %>.pdf"';
			if (debug) { console.log('DEBUG: ' + convertCmd); }
			tmpDir = tmp.dirSync({ prefix: 'mdproc_' });
			s = runWithTempFiles(s, tmpDir.name, 'svg', 'pdf', convertCmd);
		}
		if (convertToPng) {
			convertCmd = 'inkscape -f "<%= file.path %>.svg" -e "<%= file.path %>.png" -d ' + imgResolution;
			if (debug) { console.log('DEBUG: ' + convertCmd); }
			tmpDir = tmp.dirSync({ prefix: 'mdproc_' });
			s = runWithTempFiles(s, tmpDir.name, 'svg', 'png', convertCmd);
		}

		s = s();

		s.on('error', function (e) {
			console.log('ERROR while compiling graph diagram:');
			console.log(e.message);
		});

		if (tmpDir) {
			s.on('end', function () {
				del.sync(tmpDir.name + '/*', { force: true });
			});
		}

		return s;
	};
};

module.exports.autograph = extractGraphFactory('auto');
module.exports.dotex = extractGraphFactory('dotex');

module.exports.references = textTransform(require('./refs'));
module.exports.badges = textTransform(require('./badges'));
