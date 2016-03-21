import gulp from 'gulp';
import browserSync from 'browser-sync';

const defaultBrowserSyncConfig = {
  reloadOnRestart: true,
  open: false
};

export default function serve() {
  const options = Object.assign({}, defaultBrowserSyncConfig, {
    server: {
      baseDir: 'dist',
      middleware: (req, res, next) => {
        let maxAge = 0;
        if(/-[0-9a-f]*\.[^.]+$/.test(req.url)) {
          maxAge = 60*60*24*356;
        }
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
        next();
      }
    }
  });
  const browserSyncInstance = browserSync.create();
  browserSyncInstance.init(options);

  gulp.watch('app/**/*', gulp.series('build'));
}
