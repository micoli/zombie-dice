'use strict';

var gulp = require('gulp-help')(require('gulp'));
var path = require('path');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var merge = require('merge2');
const rimraf = require('gulp-rimraf');
const tslint = require('gulp-tslint');
const mocha = require('gulp-mocha');
const shell = require('gulp-shell');
const env = require('gulp-env');

const tsProject = ts.createProject({
	declaration : true,
	lib : [ "es2015" ],
	target : "es6",
	module : "commonjs",
	moduleResolution : "node",
	sourceMap : true,
	typeRoots : [ "node_modules/@types" ],
});

gulp.task('compile-tsc', function() {
	var tsResult = gulp.src([ 'src/**/*.ts' ])
		.pipe(tsProject());

	return merge([
		tsResult.dts.pipe(gulp.dest('build/definitions')),
		tsResult.js.pipe(gulp.dest('build/src'))
	]);
});

gulp.task('compile-test', function() {
	gulp.src([ 'test/**/*.ts' ])
		.pipets(Project())
		.pipe(gulp.dest('build/test/'))
});

gulp.task('watch-tsc', [ 'tslint','compile-tsc', 'configs' ], function() {
	gulp.watch('src/**/*.ts', [ 'tslint','compile-tsc', 'configs' ]);
});

gulp.task('develop', [ 'compile-tsc' ], function() {
	var stream = nodemon({
		script : 'build/src/server.js',
		ext : 'ts json',
		ignore : [ 'ignored.js' ],
		watch : [ 'src' ],
		tasks : function(changedFiles) {
			var tasks = []
			if (!changedFiles) return tasks;
			changedFiles.forEach(function(file) {
				if (path.extname(file) === '.ts' && !~tasks.indexOf('tslint')) tasks.push('tslint')
				if (path.extname(file) === '.ts' && !~tasks.indexOf('compile-tsc')) tasks.push('compile-tsc')
				if (path.extname(file) === '.json' && !~tasks.indexOf('configs')) tasks.push('configs')
			//if (path.extname(file) === '.css' && !~tasks.indexOf('cssmin')) tasks.push('cssmin')
			})
			return tasks
		}
	})
	stream
		.once('start', () => {
			console.log('start')
		})
		.on('restart', function() {
			console.log('Restarted!')
		})
		.on('crash', function() {
			console.error('Application has crashed!\n')
			stream.emit('restart', 2) // restart the server in 10 seconds
		});

});

/**
 * Remove build directory.
 */
gulp.task('clean', function() {
	return gulp.src(outDir, {
		read : false
	})
		.pipe(rimraf());
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task('tslint', () => {
	return gulp.src('src/**/*.ts')
		.pipe(tslint({
			formatter : 'prose'
		}))
		.pipe(tslint.report());
});


gulp.task('configs', (cb) => {
	return gulp.src("src/configurations/*.json")
		.pipe(gulp.dest('./build/src/configurations'));
});


gulp.task('build', [ 'tslint', 'compile-tsc', 'configs' ], () => {
	console.log('Building the project ...');
});

/**
 * Run tests.
 */
gulp.task('test', [ 'build' ], (cb) => {
	const envs = env.set({
		NODE_ENV : 'test'
	});

	gulp.src([ 'build/test/**/*.js' ])
		.pipe(envs)
		.pipe(mocha())
		.once('error', (error) => {
			console.log(error);
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});

gulp.task('default', [ 'develop' ]);
