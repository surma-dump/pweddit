const gulp = require('gulp');
const minimatch = require('minimatch');
const browserSync = require('browser-sync');
const through = require('through2');
const fs = require('fs');
const url = require('url');
const Handlebars = require('handlebars');

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
const handlebarsCompiler = require('gulp-compile-handlebars')
const s3 = require('gulp-s3');

let pkg, config;
const refreshTemplateContext = _ => {
  let pkg = JSON.parse(fs.readFileSync('package.json'));
  let config = JSON.parse(fs.readFileSync('config.json'));
  return {pkg, config};
};
let templateContext = refreshTemplateContext();
const FILES_FROM_MODULES = [
  'normalize.css/normalize.css',
  'systemjs/dist/system.js'
]

const es5Scripts = [
  'sw.es5.js',
  'bootstrap.es5.js'
];

Handlebars.registerHelper('json', o => JSON.stringify(o));

function scripts() {
  return src('*.js')
    .pipe(handlebarsCompiler(templateContext))
    .pipe(sourcemaps.init())
    .pipe(skip(es5Scripts.concat('system.js')))
    .pipe(babel({
      presets: ['stage-0'],
      plugins: ['transform-es2015-modules-systemjs']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function notranspileScripts() {
  return gulp.src(
      es5Scripts
        .map(f => `app/${f}`)
        .concat(
          FILES_FROM_MODULES
            .filter(f => /\.js$/.test(f))
            .map(f => `node_modules/${f}`)
        )
    )
    .pipe(handlebarsCompiler(templateContext))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function styles() {
  return src('*.{scss,sass,css}')
    .pipe(handlebarsCompiler (templateContext))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
}

function markup() {
  return src('*.html')
    .pipe(handlebarsCompiler(templateContext))
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
  return src('*.{json,svg,jpeg,jpg,png,woff,eot,ttf,woff2,otf}')
    // Imagemin et al are slow and potentially
    // non-deterministic. Use `gulp images`.
    .pipe(gulp.dest('dist'));
}

function incrementVersion() {
  const stream = gulp.src('package.json')
    .pipe(bump())
    .pipe(gulp.dest('.'));

  templateContext = refreshTemplateContext();
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
  res.setHeader('Expires', '0');
  next();
}

function watch() {
  browserSync.create().init({
    server: {
      baseDir: 'dist',
    },
    middleware: addCachingHeader,
    reloadOnRestart: true,
    open: false
  });

  gulp.watch('app/**/*', gulp.series('build'));
}

gulp.task('build', gulp.series(
  incrementVersion,
  gulp.parallel(
    scripts,
    notranspileScripts,
    styles,
    markup,
    staticFiles
  )
));
gulp.task('serve', gulp.series('build', watch));
gulp.task('default', gulp.series('build'));

gulp.task('deploy', _ => {
  const s3conf = JSON.parse(fs.readFileSync('s3conf.json'));

  Object.keys(s3conf).forEach(key => {
    s3conf[key] = process.env[key.toUpperCase()] || s3conf[key];
  });

  return gulp.src('dist/**/*')
    .pipe(s3(s3conf, {
      headers: {
        'Cache-Control': 'public, no-cache'
      }
    }));
});

// Wrapper around gulp.src that always includes a fixed set of files
// from node_modules (see FILES_FROM_MODULES)
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
