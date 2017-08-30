const gulp = require("gulp");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();


gulp.task('styles', () => {
  return gulp.src('./dev/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./public/styles/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('scripts', () => {
  return gulp.src('./dev/scripts/*.js')
   .pipe(babel({
    presets:['es2015']
   }))
   .pipe(gulp.dest('./public/scripts'))
   .pipe(browserSync.reload({
     stream: true
   }))
});

gulp.task('html', () => {
  return gulp.src('./dev/*.html')
   .pipe(gulp.dest('./public/'))
   .pipe(browserSync.reload({
    stream: true
   }))
});

gulp.task('watch',["browserSync", "styles"], () => {
  gulp.watch("./dev/*.html", ["html"], browserSync.reload);
  gulp.watch("./dev/styles/**/*.scss", ['styles']);
  gulp.watch("./dev/scripts/*.js", ['scripts'], browserSync.reload);
});

gulp.task('browserSync', function() {
  browserSync.init({
    port: 8383,
    server: {
      baseDir: 'public'
    },
    ui: {
      port:8181
    }

  })
});

gulp.task('default',['watch','styles','scripts']);