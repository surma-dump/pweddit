const gulp = require('gulp');
const minimatch = require('minimatch');
const browserSync = require('browser-sync');
const through = require('through2');
const fs = require('fs');
const url = require('url');

// Gulp plugins
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const minifyInline = require('gulp-minify-inline');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');
const bump = require('gulp-bump');
const handlebars = require('gulp-compile-handlebars')

let pkg = JSON.parse(fs.readFileSync('package.json'));
let templateContext = {pkg};
const FILES_FROM_MODULES = [
  'normalize.css/normalize.css'
]

function scripts() {
  return src('*.js')
    .pipe(handlebars(templateContext))
    .pipe(sourcemaps.init())
    .pipe(skip(['sw.js', 'require.js']))
    .pipe(babel({
      presets: ['stage-0'],
      plugins: ['transform-es2015-modules-amd']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function serviceWorker() {
  return gulp.src([
      'app/sw.js',
      'node_modules/requirejs/require.js'
    ])
    .pipe(handlebars(templateContext))
    .pipe(sourcemaps.init())
    // This uses the defaults provided in the `package.json`.
    .pipe(babel())
    // .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function styles() {
  return src('*.{scss,sass,css}')
    .pipe(handlebars(templateContext))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
}

function markup() {
  return src('*.html')
    .pipe(handlebars(templateContext))
    .pipe(sourcemaps.init())
    .pipe(htmlmin({
      minifyCSS: true,
      minifyJS: true,
      removeScriptTypeAttributes: true,
      collapseBooleanAttributes: true,
      removeTagWhitespace: true,
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(minifyInline())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
}

function staticFiles() {
  return src('*.{json,svg,jpeg,jpg,png}')
    // Imagemin et al are slow and potentially
    // non-deterministic. Use `gulp images`.
    .pipe(gulp.dest('dist'));
}

function incrementVersion() {
  const stream = gulp.src('package.json')
    .pipe(bump())
    .pipe(gulp.dest('.'));

  pkg = JSON.parse(fs.readFileSync('package.json'));
  return stream;
}

function addCachingHeader(req, res, next) {
  // Don’t cache anything, except if the file name has a hash
  // directly before the extension.
  let maxAge = 0;
  if(/-[0-9a-f]*\.[^.]+$/.test(req.url)) {
    maxAge = 60*60*24*356; // That’s a year!
  }
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
  next();
}

function SPA(defaultFile) {
  return (req, res, next) => {
    var fileName = url.parse(req.url);
    fileName = fileName.href.split(fileName.search).join('');
    var fileExists = fs.existsSync(`dist/${fileName}`);
    if (!fileExists && fileName.indexOf('browser-sync-client') < 0)
      req.url = `/${defaultFile}`;
    return next();
  };
}

function watch() {
  browserSync.create().init({
    server: {
      baseDir: 'dist',
    },
    middleware: [
      addCachingHeader,
      SPA('index.html'),
    ],
    reloadOnRestart: true,
    open: false
  });

  gulp.watch('app/**/*', gulp.series('build'));
}

gulp.task('build', gulp.series(
  incrementVersion,
  gulp.parallel(
    scripts,
    serviceWorker,
    styles,
    markup,
    staticFiles
  )
));
gulp.task('serve', gulp.series('build', watch));
gulp.task('default', gulp.series('build'));

function src(glob) {
  return gulp.src(
    [`app/**/${glob}`].concat(
      FILES_FROM_MODULES
        .map(file => `node_modules/${file}`)
        .filter(minimatch.filter(glob, {matchBase: true}))
      )
  );
}

var skip = (names) => {
  if(typeof names === 'string') {
    names = [names];
  }
  return through.obj(function(file, _, cb) {
    if(names.indexOf(file.basename) === -1) {
      this.push(file);
    }
    cb();
  });
};
