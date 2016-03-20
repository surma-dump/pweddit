import gulp from 'gulp';
import gtb from './gtb';
import pkg from './package.json';
import commonTasks from './gtb/common-tasks';
import serve from './gulp-tasks/serve';

var task = gtb();

task.filesIn('app')
  .inFolder('js')
  .withExtension('js')
  .run(commonTasks.babel({
    presets: ['stage-0'],
    plugins: ['transform-es2015-modules-amd']
  }))
  .run(commonTasks.minifyJs())
  .put('js');
task.filesIn('app')
  .withName('sw.js')
  .run(commonTasks.babel({
    presets: ['stage-0'],
  }))
  .run(commonTasks.minifyJs());
task.filesIn('app')
  .withExtension('sass', 'scss')
  .run(commonTasks.compileSass())
  .run(commonTasks.autoprefixer())
  .run(commonTasks.minifyCss());
task.filesIn('app')
  .withExtension('css')
  .run(commonTasks.autoprefixer())
  .run(commonTasks.minifyCss());
task.filesIn('app')
  .withExtension('html')
  .run(commonTasks.replace('{{_!_version_!_}}', pkg.version))
  .run(commonTasks.minifyHtml())
task.filesIn('app')
  .withExtension('jpeg', 'jpg', 'png', 'svg')
  .run(commonTasks.imagemin());
task.filesIn('node_modules')
  .inFolder('requirejs')
  .withName('require.js')
  .run(commonTasks.minifyJs())
  .put('js');

gulp.task('build', task.build());
gulp.task('default', gulp.series('build'));
gulp.task('serve', gulp.series('build', serve));
