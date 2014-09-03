var path = require('path');
var gulp = require('gulp');
var spawn = require('gulp-spawn');
var exec = require('gulp-exec');
var rename = require('gulp-rename');

var ge = require('mdgraphextract');
var inliner = require('htinliner');

var processStates = require('./states');
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
	var imgFormat, imgBasePath;
	opt = opt || {};
	imgFormat = opt.imgFormat || 'svg';
	imgBasePath = opt.imgBasePath || dest;
	return function() {
		return gulp.src(src)
			.pipe(processStates())
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
					'--template="' + html5TemplatePath + '"'
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


var buildPdf = function(src, dest, opt) {
	var execOptions, cmdline;
	var imgFormat, imgBasePath;
	opt = opt || {};
	imgFormat = opt.imgFormat || 'png';
	imgBasePath = opt.imgBasePath || dest;
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
		'--to=latex',
		'--default-image-extension=' + imgFormat,
		'--normalize',
		'--smart',
		'--template="' + latexTemplatePath + '"',
		'--variable=documentclass:scrartcl',
		'--variable=lang:<%= file.pdfLang %>',
		'--latex-engine=xelatex',
		'-o', '"<%= file.path %>.pdf"',
		'"<%= file.path %>.tmp"'
	];
	return function() {
		return gulp.src(src)
			.pipe(processStates())
			.pipe(rename({ extname: '.tmp' }))
			.pipe(gulp.dest(dest))
			.pipe(rename({ extname: '' }))
			.pipe(pdfLang())
			.pipe(exec(cmdline.join(' '), execOptions))
			.pipe(exec.reporter());
	};
};
module.exports.buildPdfTask = buildPdf;

var buildDocx = function(src, dest, opt) {
	var execOptions, cmdline;
	var imgFormat, imgBasePath;
	opt = opt || {};
	imgFormat = opt.imgFormat || 'png';
	imgBasePath = opt.imgBasePath || dest;
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
		'--to=docx',
		'--default-image-extension=' + imgFormat,
		'--normalize',
		'--smart',
		'-o', '"<%= file.path %>.docx"',
		'"<%= file.path %>.tmp"'
	];
	return function() {
		return gulp.src(src)
			.pipe(processStates())
			.pipe(rename({ extname: '.tmp' }))
			.pipe(gulp.dest(dest))
			.pipe(rename({ extname: '' }))
			.pipe(exec(cmdline.join(' '), execOptions))
			.pipe(exec.reporter());
	};
};
module.exports.buildDocxTask = buildDocx;

var extractGraph = function(src, dest, opt) {
	var imgFormat, attributes, a;
	var args = [];
	opt = opt || {};
	imgFormat = opt.imgFormat || 'svg';

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
			.pipe(ge(opt))
			.pipe(spawn({
				cmd: 'dot',
				args: args,
				filename: function(base, ext) { return base + '.' + imgFormat }
			}))
			.pipe(gulp.dest(dest));
	};
};
module.exports.extractGraphTask = extractGraph;
