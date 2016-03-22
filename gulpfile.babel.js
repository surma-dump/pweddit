import pkg from './package.json';

import gulp from 'gulp';
import minimatch from 'minimatch';
import browserSync from 'browser-sync';
import through from 'through2';

// Gulp plugins
import uglify from 'gulp-uglify';
import babel from 'gulp-babel';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import minifyInline from 'gulp-minify-inline';
import htmlmin from 'gulp-htmlmin';
import sourcemaps from 'gulp-sourcemaps';

const FILES_FROM_MODULES = [ ]

function scripts() {
  return src('*.js')
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
    .pipe(sourcemaps.init())
    // Babel’s transform-es2015-modules-commonjs destroy require.js
    // so Imma add the individual plugins on an as-needed basis. But don’t
    // expect sw.js to contain much code anyways.
    .pipe(babel({
      plugins: []
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function styles() {
  return src('*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
}

function markup() {
  return src('*.html')
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

function watch() {
  browserSync.create().init({
    server: {
      baseDir: 'dist',
      middleware: (req, res, next) => {
        // Don’t cache anything, except if the file name has a hash
        // directly before the extension.
        let maxAge = 0;
        if(/-[0-9a-f]*\.[^.]+$/.test(req.url)) {
          maxAge = 60*60*24*356; // That’s a year!
        }
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
        next();
      }
    },
    reloadOnRestart: true,
    open: false
  });

  gulp.watch('app/**/*', gulp.series('build'));
}

gulp.task('build', gulp.parallel(scripts, serviceWorker, styles, markup, staticFiles))
gulp.task('serve', gulp.series('build', watch))
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
