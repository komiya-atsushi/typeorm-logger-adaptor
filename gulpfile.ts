/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types */
import { Gulpclass, Task, SequenceTask } from 'gulpclass';

const del = require('del');
const gulp = require('gulp');
const shell = require('gulp-shell');

const distDir = 'dist';

@Gulpclass()
export class Gulpfile {
  @Task()
  clean(cb: Function) {
    return del([`./${distDir}/**`], cb);
  }

  @Task()
  build() {
    return gulp.src('package.json', { read: false }).pipe(shell(['npm run build']));
  }

  @Task()
  packagePreparePackageFile() {
    return gulp.src('./package.json').pipe(gulp.dest(`./${distDir}/`));
  }

  @Task()
  packageCopyReadme() {
    return gulp.src('./README.md').pipe(gulp.dest(`./${distDir}/`));
  }

  @Task()
  packageCopyLicense() {
    return gulp.src('./LICENSE').pipe(gulp.dest(`./${distDir}/`));
  }

  @Task()
  packagePublish() {
    return gulp.src('package.json', { read: false }).pipe(shell([`cd ./${distDir}/ && npm publish`]));
  }

  @SequenceTask()
  package() {
    return ['clean', 'build', 'packagePreparePackageFile', 'packageCopyReadme', 'packageCopyLicense'];
  }

  @SequenceTask()
  publish() {
    return ['package', 'packagePublish'];
  }
}
