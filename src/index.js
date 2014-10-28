var path = require('path');
var gulp = require('gulp');
var spawn = require('gulp-spawn');
var exec = require('gulp-exec');
var rename = require('gulp-rename');

var ge = require('mdgraphextract');
var inliner = require('htinliner');

var processIncludes = require('./includes');
var processStates = require('./states');
var processReferences = require('./refs');
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

var html5TemplatePath = path.join(path.dirname(module.filename), '../assets/template.standalone.html');
var latexTemplatePath = path.join(path.dirname(module.filename), '../assets/template.tex');
var texInputsPath = path.join(path.dirname(module.filename), '../assets');

process.env.TEXINPUTS = texInputsPath + path.delimiter + process.env.TEXINPUTS;

var buildHtml = function(src, dest, opt) {
	var imgFormat, imgBasePath, templatePath;
	opt = opt || {};
	imgFormat = opt.imgFormat || 'svg';
	imgBasePath = opt.imgBasePath || dest;
	templatePath = opt.template || html5TemplatePath;
	return function() {
		return gulp.src(src)
			.pipe(processIncludes())
			.pipe(processStates())
			.pipe(processReferences({ prefixCaption: true, figureTerm: 'Abbildung' }))
			.pipe(spawn({
				cmd: 'pandoc',
				args: [
					'--from=' + inputFormat.join('+'),
					'--to=html5',
					'--default-image-extension=' + imgFormat,
					'--normalize',
					'--smart',
					'--toc',
					'--toc-depth=2',
					'--mathml',
					'--template', templatePath
				],
				filename: function(base, ext) { return base + '.html' }
			}))
			.pipe(inliner({
				svgRemoveSize: true,
				svgWrapElement: 'div',
				basePath: imgBasePath
			}))
			.pipe(gulp.dest(dest));
	};
};
module.exports.buildHtmlTask = buildHtml;

var buildFactory = function(targetFormat, targetExt, 
	defImgFormat, defTemplate, defTocDepth, prefixCaption,
	args, transforms) {

	return function(src, dest, opt) {
		var execOptions, cmdline;
		var imgFormat, imgBasePath, templatePath, tocDepth, variables, key;
		var tmpExt = targetExt + '_tmp';
		var contextArgs, contextTransforms;
		var i;

		opt = opt || {};
		imgFormat = opt.imgFormat || defImgFormat;
		templatePath = opt.template || defTemplate;
		tocDepth = (opt.tocDepth !== undefined) ? opt.tocDepth : defTocDepth;
		variables = opt.vars || {};
		imgBasePath = opt.imgBasePath || dest;

		var contextify = function(value) {
			if (typeof(value) === 'function') {
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

		if (templatePath) {
			cmdline.push('--template="' + templatePath + '"');
		}
		if (contextArgs) {
			for (i = 0; i < contextArgs.length; i++) {
				cmdline.push(contextArgs[i]);
			}
		}

		for (key in variables) {
			cmdline.push('"--variable=' + key + ':' + variables[key] + '"');
		}

		cmdline.push('-o');
		cmdline.push('"<%= file.path %>.' + targetExt + '"');
		cmdline.push('"<%= file.path %>.' + tmpExt + '"');

		return function() {
			var s = gulp.src(src);

			s = s.pipe(processIncludes());
			s = s.pipe(processStates());
			s = s.pipe(processReferences({ prefixCaption: prefixCaption, figureTerm: 'Abbildung' }));
			
			s = s
				.pipe(rename({ extname: '.' + tmpExt }))
				.pipe(gulp.dest(dest))
				.pipe(rename({ extname: '' }));

			if (contextTransforms) {
				for (i = 0; i < contextTransforms.length; i++) {
					s = s.pipe(contextTransforms[i]);
				}
			}

			s = s
				.pipe(exec(cmdline.join(' '), execOptions))
				.pipe(exec.reporter());

			return s;
		};
	};
};

module.exports.buildPdfTask = buildFactory(
	'latex', 'pdf', 'pdf', latexTemplatePath, 2, false, 
	[
		'--latex-engine=xelatex',
		'--variable=documentclass:scrartcl',
		'--variable=lang:<%= file.pdfLang %>'
	], 
	[ pdfLang() ]);

module.exports.buildDocxTask = buildFactory(
	'docx', 'docx', 'png', null, 2, true)

var extractGraph = function(src, dest, opt) {
	var imgFormat, mode, attributes, a;
	var args = [];
	opt = opt || {};
	imgFormat = opt.imgFormat || 'svg';
	mode = opt.mode || 'auto';

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

	return function() {
		return gulp.src(src)
			.pipe(processIncludes())
			.pipe(ge(opt))
			.pipe(spawn({
				cmd: 'dot',
				args: args,
				filename: function(base, ext) { return base + '_' + mode + '.' + imgFormat }
			}))
			.pipe(gulp.dest(dest));
	};
};
module.exports.extractGraphTask = extractGraph;
